import importlib.util, pathlib, tempfile, unittest, json, shutil, base64
spec=importlib.util.spec_from_file_location('exporter',pathlib.Path(__file__).with_name('activity-exporter.py'))
E=importlib.util.module_from_spec(spec);spec.loader.exec_module(E)
E.NODE=shutil.which('node')

class ExporterTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.db=E.database(pathlib.Path(self.temp.name)/'state.sqlite3')
        self.checked=E.utc();self.revision='a'*40
        self.run={'path':E.WORKFLOW,'head_branch':'master','status':'completed','conclusion':'success','head_sha':self.revision,'id':123,'event':'push'}
        self.jobs={'jobs':[{'conclusion':'success','steps':[{'name':'Verify source revision','conclusion':'success'},{'name':'Validate queue and check live output','conclusion':'success','completed_at':self.checked}]}]}
        self.release={'sourceVerified':True,'sourceRevision':self.revision}
        self.changed={'files':[{'filename':'billock-org/src/components/people/Activity.jsx'}]}
    def tearDown(self):self.db.close();self.temp.cleanup()
    def receipt(self):return E.verified(self.run,self.jobs,self.changed,self.checked,self.release)
    def test_checks_are_generic_and_finite(self):
        E.admit(self.db,self.receipt());f=E.projection(self.db,self.checked,pathlib.Path(__file__).with_name('activity-projector.cjs'))
        self.assertEqual(f['events'][0]['agent'],'automation');self.assertEqual(f['events'][0]['verification'],'tested')
        for text in [self.revision,'123','head_sha','sourceId','evidenceSha256']:self.assertNotIn(text,json.dumps(f))
    def test_skipped_failed_wrong_branch_future_never_emit(self):
        for field,value in [('head_branch','other'),('conclusion','failure'),('status','in_progress')]:
            run={**self.run,field:value};self.assertIsNone(E.verified(run,self.jobs,self.changed,self.checked,self.release))
        self.jobs['jobs'][0]['steps'][1]['conclusion']='skipped';self.assertIsNone(self.receipt())
    def test_feed_only_commit_never_echoes(self):
        self.changed={'files':[{'filename':E.FEED}]};self.assertIsNone(self.receipt())
    def test_durable_dedup_and_restart_preserve_first_time(self):
        r=self.receipt();self.assertTrue(E.admit(self.db,r));self.assertFalse(E.admit(self.db,r))
        self.db.close();self.db=E.database(pathlib.Path(self.temp.name)/'state.sqlite3');self.assertFalse(E.admit(self.db,r));self.assertEqual(self.db.execute('SELECT COUNT(*) FROM receipts').fetchone()[0],1)
    def test_publication_only_acknowledges_exact_live_bytes(self):
        E.admit(self.db,self.receipt());f=E.projection(self.db,self.checked,pathlib.Path(__file__).with_name('activity-projector.cjs'));digest,payload=E.enqueue(self.db,f)
        remote={'content':base64.b64encode(b'{}').decode(),'sha':'old'}
        def api(endpoint,body=None):
            if body:self.assertEqual(body['sha'],'old');remote['content']=body['content'];return {'commit':{'sha':'b'*40}}
            return remote
        self.assertEqual(E.publish(self.db,digest,payload,api,lambda:b'wrong'),'submitted')
        self.assertEqual(E.publish(self.db,digest,payload,api,lambda:payload.encode()),'published')
    def test_uncertain_write_retries_without_duplicate_commit(self):
        digest,payload=E.enqueue(self.db,{'test':'public snapshot'})
        calls=[];remote={'content':base64.b64encode(b'{}').decode(),'sha':'old'}
        def api(endpoint,body=None):
            if body:remote['content']=body['content'];calls.append(body);raise RuntimeError('ambiguous')
            return remote
        with self.assertRaises(RuntimeError):E.publish(self.db,digest,payload,api)
        self.assertEqual(E.publish(self.db,digest,payload,api,lambda:payload.encode()),'published');self.assertEqual(len(calls),1)
    def test_previous_effect_is_reconciled_before_new_snapshot(self):
        digest,payload=E.enqueue(self.db,{'test':'previous public snapshot'})
        E.reconcile(self.db,lambda:payload.encode())
        E.enqueue(self.db,{'test':'new public snapshot'})
        self.assertEqual(self.db.execute('SELECT state FROM publications WHERE digest=?',(digest,)).fetchone()[0],'published')
    def test_pending_readback_failure_or_mismatch_never_creates_new_snapshot(self):
        digest,payload=E.enqueue(self.db,{'test':'pending public snapshot'})
        remote={'content':base64.b64encode(payload.encode()).decode(),'sha':'existing'}
        def api(endpoint,body=None):
            self.assertIn('/contents/',endpoint);self.assertIsNone(body);return remote
        for failure in [False,True]:
            def read():
                if failure:raise RuntimeError('offline')
                return b'mismatch'
            if failure:
                with self.assertRaises(RuntimeError):E.cycle(self.db,pathlib.Path(__file__).with_name('activity-projector.cjs'),api,read)
            else:E.cycle(self.db,pathlib.Path(__file__).with_name('activity-projector.cjs'),api,read)
            self.assertEqual(self.db.execute('SELECT COUNT(*) FROM publications').fetchone()[0],1)
            self.assertEqual(self.db.execute('SELECT bytes FROM publications').fetchone()[0],payload)
    def test_source_outage_does_not_advance_last_success(self):
        E.admit(self.db,self.receipt());feed=E.projection(self.db,self.checked,pathlib.Path(__file__).with_name('activity-projector.cjs'));E.enqueue(self.db,feed)
        before=self.db.execute('SELECT value FROM state WHERE key="last_feed"').fetchone()[0]
        def failed(endpoint,body=None):raise RuntimeError('Source unavailable')
        original=E.reconcile
        E.reconcile=lambda db,*args:None
        try:
            with self.assertRaises(RuntimeError):E.cycle(self.db,pathlib.Path(__file__).with_name('activity-projector.cjs'),failed)
        finally:E.reconcile=original
        self.assertEqual(self.db.execute('SELECT value FROM state WHERE key="last_feed"').fetchone()[0],before)
    def test_compare_and_swap_conflict_retains_pending(self):
        digest,payload=E.enqueue(self.db,{'test':'public snapshot'})
        def api(endpoint,body=None):
            if body:raise RuntimeError('conflict')
            return {'content':base64.b64encode(b'{}').decode(),'sha':'concurrent'}
        with self.assertRaises(RuntimeError):E.publish(self.db,digest,payload,api)
        self.assertEqual(self.db.execute('SELECT state FROM publications').fetchone()[0],'pending')


class SourceBindingTests(unittest.TestCase):
    def test_feed_write_is_a_compare_and_swap_git_push_without_a_token(self):
        import subprocess as sp, tempfile, base64 as b64, os
        with tempfile.TemporaryDirectory() as d:
            run=lambda *a,cwd=None:sp.run(['git',*a],cwd=cwd,check=True,capture_output=True,text=True).stdout.strip()
            origin=os.path.join(d,'origin.git');work=os.path.join(d,'work');clone=os.path.join(d,'clone')
            run('init','--quiet','--bare','--initial-branch=master',origin);run('clone','--quiet',origin,work)
            feed=os.path.join(work,E.FEED);os.makedirs(os.path.dirname(feed));open(feed,'w').write('{"old":true}\n')
            run('add','-A',cwd=work);run('-c','user.name=t','-c','user.email=t@example.invalid','commit','--quiet','-m','seed',cwd=work);run('push','--quiet','origin','HEAD:master',cwd=work)
            blob=run('rev-parse','HEAD:'+E.FEED,cwd=work)
            old=E.REMOTE;E.REMOTE=origin
            try:
                body={'message':'Refresh verified public website activity','content':b64.b64encode(b'{"new":true}\n').decode(),'sha':blob,'branch':'master'}
                out=E.push_feed(body,clone)
                self.assertEqual(run('--git-dir',origin,'rev-parse','master'),out['commit']['sha'])
                self.assertEqual(run('--git-dir',origin,'show','master:'+E.FEED),'{"new":true}')
                with self.assertRaises(RuntimeError):E.push_feed(body,clone)   # stale blob sha: refused, nothing pushed
                self.assertEqual(run('--git-dir',origin,'rev-parse','master'),out['commit']['sha'])
            finally:E.REMOTE=old
        with self.assertRaises(RuntimeError):E.gh('repos/someone/else/contents/x',{'branch':'master'})
        with self.assertRaises(RuntimeError):E.gh('user')

    def test_unchanged_feed_is_not_republished_inside_the_heartbeat(self):
        import tempfile, os
        feed={'generatedAt':'2026-11-10T08:00:00.000Z','health':'healthy','events':[{'eventId':'a'}]}
        with tempfile.TemporaryDirectory() as d:
            db=E.database(os.path.join(d,'outbox.sqlite3'))
            try:
                self.assertFalse(E.unchanged(db,feed))
                E.enqueue(db,feed)
                self.assertTrue(E.unchanged(db,{**feed,'generatedAt':'2026-11-10T09:00:00.000Z'}))
                self.assertFalse(E.unchanged(db,{**feed,'generatedAt':'2026-11-11T08:00:01.000Z'}))
                self.assertFalse(E.unchanged(db,{**feed,'generatedAt':'2026-11-10T09:00:00.000Z','events':[]}))
                self.assertFalse(E.unchanged(db,{**feed,'generatedAt':'2026-11-10T09:00:00.000Z','health':'stale'}))
            finally:db.close()

    def test_old_or_scheduled_workflows_are_not_evidence(self):
        checked=E.utc();run={'path':E.WORKFLOW,'head_branch':'master','status':'completed','conclusion':'success','head_sha':'a'*40,'id':123,'event':'push'}
        jobs={'jobs':[{'conclusion':'success','steps':[{'name':'Validate queue and check live output','conclusion':'success','completed_at':checked}]}]}
        changed={'files':[{'filename':'source.js'}]}
        self.assertIsNone(E.verified(run,jobs,changed,checked,{'sourceVerified':False,'sourceRevision':'a'*40}))
        run['event']='schedule';jobs['jobs'][0]['steps'].append({'name':'Verify source revision','conclusion':'success'})
        self.assertIsNone(E.verified(run,jobs,changed,checked,{'sourceVerified':False,'sourceRevision':'a'*40}))

class ChatterTests(unittest.TestCase):
    def setUp(self):
        import datetime, sqlite3, os
        self.temp=tempfile.TemporaryDirectory();root=pathlib.Path(self.temp.name)
        self.db=E.database(root/'outbox.sqlite3');self.gateway=root/'gateway.sqlite3';self.ci=root/'ci';self.ci.mkdir()
        self.today=datetime.date(2026,11,12);self.day=datetime.date(2026,11,11)
        at=datetime.datetime(2026,11,11,15,0).timestamp();old=datetime.datetime(2026,11,9,15,0).timestamp()
        src=sqlite3.connect(self.gateway)
        src.executescript("""CREATE TABLE changes(id TEXT,title TEXT,state TEXT,done_at REAL);
        CREATE TABLE rooms(id TEXT,ask TEXT,state TEXT,closed_at REAL);
        CREATE TABLE refusal_cases(id TEXT,title TEXT,opened_at REAL);
        CREATE TABLE engine_events(at REAL,engine TEXT,kind TEXT,detail TEXT);
        CREATE TABLE envelopes(room_id TEXT,role TEXT,summary TEXT,body TEXT,engine TEXT,at REAL);""")
        src.executemany('INSERT INTO changes VALUES (?,?,?,?)',[('c1','PRIVATE-TITLE job search','done',at),('c2','PRIVATE-TITLE fund','done',at),('c3','x','cancelled',at),('c4','x','done',old)])
        src.executemany('INSERT INTO rooms VALUES (?,?,?,?)',[('r1','PRIVATE-ASK','converged',at),('r2','x','blocked',at)])
        src.execute('INSERT INTO refusal_cases VALUES (?,?,?)',('f1','PRIVATE-TITLE',at))
        src.executemany('INSERT INTO engine_events VALUES (?,?,?,?)',[(at,'tao','failure:unavailable','PRIVATE-DETAIL')]*3+[(at,'claude','ok','x')])
        seats=[('polymath',5),('claude',9),('local14b',2),('codex',1),('secret-engine',50)]
        src.executemany('INSERT INTO envelopes VALUES (?,?,?,?,?,?)',[('r1','critic','PRIVATE-SUMMARY','PRIVATE-BODY',engine,at) for engine,count in seats for _ in range(count)]+[('r1','willow','PRIVATE','PRIVATE','claude',at)])
        src.commit();src.close()
        stamp=datetime.datetime(2026,11,11,15,0).astimezone().isoformat()
        for name,codes in [('a',[0,0]),('b',[0,1]),('c',[0])]:
            file=self.ci/(name+'.json');file.write_text(json.dumps({'sha':'PRIVATE-SHA','finished':stamp,'steps':[{'name':'PRIVATE-STEP','exit_code':code} for code in codes]}));os.utime(file,(at,at))
    def tearDown(self):self.db.close();self.temp.cleanup()
    def test_a_finished_day_becomes_counts_in_speaking_order_and_nothing_else(self):
        rows=E.day_counts(self.day,self.gateway,self.ci)
        self.assertEqual(rows,[('euphonia','merged',2),('euphonia','rooms',1),('claude','seats',9),('polymath','seats',5),('tiny','seats',2),('stagehand','green',2),('stagehand','red',1),('euphonia','refused',1),('euphonia','noanswer',3)])
        self.assertEqual(E.gather(self.db,self.today,self.gateway,self.ci),E.CHATTER_DAYS)
        public=json.dumps(E.chatter(self.db,self.today))
        for private in ['PRIVATE','secret-engine','local14b','c1','r1']:self.assertNotIn(private,public)
        for item in E.chatter(self.db,self.today):self.assertEqual(sorted(item),['day','n','topic','who'])
    def test_a_day_is_recorded_once_and_an_empty_day_is_a_quiet_day(self):
        self.assertEqual(E.gather(self.db,self.today,self.gateway,self.ci),E.CHATTER_DAYS)
        self.assertEqual(E.gather(self.db,self.today,self.gateway,self.ci),0)
        said=E.chatter(self.db,self.today)
        self.assertEqual(said[0]['day'],'2026-11-11');self.assertEqual([c['day'] for c in said],sorted([c['day'] for c in said],reverse=True))
        self.assertIn({'day':'2026-11-10','who':'euphonia','topic':'quiet','n':0},said)
        self.assertNotIn('2026-11-12',[c['day'] for c in said])
    def test_a_missing_source_records_nothing_and_the_feed_still_projects(self):
        with self.assertRaises(Exception):E.gather(self.db,self.today,pathlib.Path(self.temp.name)/'absent.sqlite3',self.ci)
        self.assertEqual(E.chatter(self.db,self.today),[])
        feed=E.projection(self.db,E.utc(),pathlib.Path(__file__).with_name('activity-projector.cjs'))
        self.assertEqual(feed['schemaVersion'],2);self.assertEqual(feed['chatter'],[])
    def test_recorded_chatter_passes_the_public_contract_and_changes_the_feed(self):
        import datetime
        today=datetime.date.today();day=today-datetime.timedelta(days=1)
        self.db.executemany('INSERT INTO chatter VALUES (?,?,?,?,?)',[(day.isoformat(),0,'euphonia','merged',4),(day.isoformat(),1,'tiny','seats',2)]);self.db.commit()
        feed=E.projection(self.db,E.utc(),pathlib.Path(__file__).with_name('activity-projector.cjs'))
        self.assertEqual(feed['chatter'],[{'day':day.isoformat(),'who':'euphonia','topic':'merged','n':4},{'day':day.isoformat(),'who':'tiny','topic':'seats','n':2}])
        E.enqueue(self.db,feed);self.assertTrue(E.unchanged(self.db,feed));self.assertFalse(E.unchanged(self.db,{**feed,'chatter':[]}))
        self.db.execute("UPDATE chatter SET who='willow' WHERE ord=0");self.db.commit()
        with self.assertRaises(RuntimeError):E.projection(self.db,E.utc(),pathlib.Path(__file__).with_name('activity-projector.cjs'))

class PublicBoundaryTests(unittest.TestCase):
    def test_hostile_paths_are_rejected_before_network(self):
        from unittest.mock import Mock
        original=E.PUBLIC_OPENER;opener=Mock();E.PUBLIC_OPENER=opener
        try:
            for file in ['http://127.0.0.1:9999/execute','https://example.invalid/','//localhost/x','../private','static/js/../../private','activity/feed.json?callback=evil','activity/feed.json#fragment']:
                with self.assertRaises(RuntimeError):E.public_bytes(file)
            opener.open.assert_not_called()
        finally:E.PUBLIC_OPENER=original
    def test_redirect_to_home_or_another_host_is_not_followed(self):
        for url in ['http://127.0.0.1:9999/execute','http://192.168.1.1/','https://example.invalid/']:
            with self.assertRaises(RuntimeError):E.RejectRedirect().redirect_request(None,None,302,'redirect',{},url)
    def test_public_requests_are_fixed_https_get_without_auth(self):
        from unittest.mock import Mock,MagicMock
        original=E.PUBLIC_OPENER;opener=Mock();response=MagicMock();response.__enter__.return_value.read.return_value=b'{}';opener.open.return_value=response;E.PUBLIC_OPENER=opener
        try:
            self.assertEqual(E.public_bytes('activity/feed.json'),b'{}')
            request=opener.open.call_args.args[0]
            self.assertEqual(request.full_url,'https://billock.org/activity/feed.json');self.assertEqual(request.method,'GET')
            self.assertFalse(any(k.lower() in ['authorization','cookie'] for k,v in request.header_items()))
        finally:E.PUBLIC_OPENER=original

if __name__=='__main__':unittest.main()
