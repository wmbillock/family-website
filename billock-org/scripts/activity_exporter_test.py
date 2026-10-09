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
    def test_old_or_scheduled_workflows_are_not_evidence(self):
        checked=E.utc();run={'path':E.WORKFLOW,'head_branch':'master','status':'completed','conclusion':'success','head_sha':'a'*40,'id':123,'event':'push'}
        jobs={'jobs':[{'conclusion':'success','steps':[{'name':'Validate queue and check live output','conclusion':'success','completed_at':checked}]}]}
        changed={'files':[{'filename':'source.js'}]}
        self.assertIsNone(E.verified(run,jobs,changed,checked,{'sourceVerified':False,'sourceRevision':'a'*40}))
        run['event']='schedule';jobs['jobs'][0]['steps'].append({'name':'Verify source revision','conclusion':'success'})
        self.assertIsNone(E.verified(run,jobs,changed,checked,{'sourceVerified':False,'sourceRevision':'a'*40}))

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
