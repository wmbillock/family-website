"""Private durable exporter. Only verified website check receipts cross its boundary.

Uses standard gh authentication without reading, copying or printing credentials.
No controller messages, private notes, provider effects or other project state.
"""
import re, base64, datetime as dt, fcntl, hashlib, json, os, pathlib, sqlite3, subprocess, sys, urllib.request

REPO = 'wmbillock/family-website'
FEED = 'billock-org/public/activity/feed.json'
WORKFLOW = '.github/workflows/deploy.yml'
GH = '/opt/homebrew/bin/gh'
NODE = '/opt/homebrew/bin/node'
MAX = 2 * 1024 * 1024

def raw(value): return json.dumps(value, separators=(',', ':'), ensure_ascii=False)
def sha(value): return hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()
def instant(value):
    parsed = dt.datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None: raise ValueError('Missing timezone')
    return parsed.astimezone(dt.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00','Z')
def utc(): return instant(dt.datetime.now(dt.timezone.utc).isoformat())

def gh(endpoint, body=None):
    args = [GH,'api',endpoint]
    if body is not None: args += ['--method','PUT','--input','-']
    result = subprocess.run(args,input=raw(body) if body is not None else None,text=True,capture_output=True,timeout=45)
    # Tool errors are never copied into public state or logs.
    if result.returncode or len(result.stdout)>MAX: raise RuntimeError('GitHub transport unavailable')
    return json.loads(result.stdout)

def verified(run, jobs, changed, checked, release):
    """A passed named test step is evidence of checks, never human acceptance.

    Opaque original IDs/revisions/evidence stay private. Ignore feed-only commits
    so publication never produces an activity feedback loop.
    """
    if run.get('path') != WORKFLOW or run.get('head_branch') != 'master' or run.get('event')!='push' or run.get('status')!='completed' or run.get('conclusion')!='success': return None
    revision=run.get('head_sha','')
    if len(revision)!=40 or any(c not in '0123456789abcdef' for c in revision): return None
    files=[f.get('filename') for f in changed.get('files',[])]
    if not files or len(files)>=300 or all(f==FEED for f in files): return None
    candidates=[]
    revision_verified=release.get('sourceVerified') is True and release.get('sourceRevision')==revision
    for job in jobs.get('jobs',[]):
        if job.get('conclusion')!='success': continue
        for step in job.get('steps',[]):
            if step.get('name')=='Validate queue and check live output' and step.get('conclusion')=='success' and step.get('completed_at'):
                at=instant(step['completed_at'])
                if at <= checked: candidates.append(at)
    if not candidates or not revision_verified: return None
    at=min(candidates)
    receipt={'schemaVersion':1,'taskId':'website-checks','attemptId':'revision-'+revision,'revision':revision,'occurredAt':at,'verification':'tested','evidenceSha256':sha(raw({'run':run['id'],'revision':revision,'step':'Validate queue and check live output','completedAt':at,'conclusion':'success'}))}
    return {'sourceId':'website-'+revision,'bytes':raw(receipt)}

def database(file):
    db=sqlite3.connect(file,timeout=5)
    os.chmod(file,0o600)
    db.executescript('''PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS receipts(source_id TEXT PRIMARY KEY,bytes TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS publications(digest TEXT PRIMARY KEY,bytes TEXT NOT NULL,state TEXT NOT NULL,created_at TEXT NOT NULL,remote_commit TEXT);
    CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,value TEXT NOT NULL);''')
    return db

def admit(db, receipt):
    previous=db.execute('SELECT bytes FROM receipts WHERE source_id=?',(receipt['sourceId'],)).fetchone()
    # First completed verified check for a code revision owns the event timestamp.
    if previous: return False
    db.execute('INSERT INTO receipts VALUES (?,?)',(receipt['sourceId'],receipt['bytes']))
    db.commit();return True

def projection(db, checked, script):
    cutoff=dt.datetime.fromisoformat(checked.replace('Z','+00:00'))-dt.timedelta(days=30)
    receipts=[{'sourceId':s,'bytes':b} for s,b in db.execute('SELECT source_id,bytes FROM receipts ORDER BY source_id') if dt.datetime.fromisoformat(json.loads(b)['occurredAt'].replace('Z','+00:00'))>=cutoff]
    # Preserve private history; bound the current public projection input.
    receipts=sorted(receipts,key=lambda r:json.loads(r['bytes'])['occurredAt'],reverse=True)[:100]
    sources=[{'sourceId':r['sourceId'],'receiptSha256':sha(r['bytes']),'project':'website','agent':'automation','action':'checks_passed'} for r in receipts]
    observation=raw({'schemaVersion':1,'checkedAt':checked,'sourceSetSha256':sha(raw(sorted(sources,key=lambda p:p['sourceId']))),'evidenceSha256':sha(raw({'repository':REPO,'workflow':WORKFLOW,'observedAt':checked,'receiptDigests':[sha(r['bytes']) for r in receipts]}))}) if sources else None
    policy={'schemaVersion':1,'sources':sources,'observationSha256':sha(observation) if observation else None}
    result=subprocess.run([NODE,'-e',"const fs=require('fs'),p=require(process.argv[1]),x=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(JSON.stringify(p.project(x.receipts,x.policy,x.observation,new Date(x.at))));",str(script)],input=raw({'receipts':receipts,'policy':policy,'observation':observation,'at':checked}),capture_output=True,text=True,timeout=15)
    if result.returncode: raise RuntimeError('Projection rejected')
    return json.loads(result.stdout)

def enqueue(db, feed):
    payload=json.dumps(feed,indent=2,ensure_ascii=False)+'\n'
    digest=sha(payload)
    db.execute('INSERT OR IGNORE INTO publications VALUES (?,?,?,?,NULL)',(digest,payload,'pending',utc()))
    db.execute('INSERT OR REPLACE INTO state VALUES (?,?)',('last_feed',payload))
    db.commit();return digest,payload

def publish(db, digest, payload, api=gh, read_live=None):
    remote=api('repos/'+REPO+'/contents/'+FEED+'?ref=master')
    current=base64.b64decode(remote['content']).decode()
    commit=None
    if sha(current)!=digest:
        response=api('repos/'+REPO+'/contents/'+FEED,{'message':'Refresh verified public website activity','content':base64.b64encode(payload.encode()).decode(),'sha':remote['sha'],'branch':'master'})
        commit=response['commit']['sha']
        db.execute('UPDATE publications SET state=?,remote_commit=? WHERE digest=?',('submitted',commit,digest));db.commit()
    # A git API success is not a deployment receipt. A later tick verifies bytes.
    if read_live and sha(read_live())==digest:
        db.execute('UPDATE publications SET state=? WHERE digest=?',('published',digest));db.commit();return 'published'
    return 'submitted' if commit else 'pending-live'

class RejectRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Public redirects are not permitted')

PUBLIC_OPENER=urllib.request.build_opener(RejectRedirect)

def public_bytes(file):
    # Fixed origin plus finite public paths only. Never accept a callback URL.
    if not re.fullmatch(r'(?:index\.html|activity/(?:feed|release-state)\.json|static/(?:js|css)/[a-zA-Z0-9_.-]+)',file):raise RuntimeError('Unsupported public path')
    request=urllib.request.Request('https://billock.org/'+file,headers={'Cache-Control':'no-cache'},method='GET')
    with PUBLIC_OPENER.open(request,timeout=15) as response:
        data=response.read(MAX+1)
        if len(data)>MAX: raise RuntimeError('Public artifact too large')
        return data

def observed_release():
    feed=public_bytes('activity/feed.json')
    if len(feed)>131072:raise RuntimeError('Public feed too large')
    marker=json.loads(public_bytes('activity/release-state.json'))
    if set(marker)!={'version','sourceDigest','sourceRevision','sourceVerified','files'} or marker['version']!=1 or not isinstance(marker['files'],dict) or len(marker['files'])>20 or marker['files'].get('activity/feed.json')!=sha(feed) or 'index.html' not in marker['files']:raise RuntimeError('Incomplete public release')
    for file,digest in marker['files'].items():
        if not re.fullmatch(r'(?:index\.html|activity/feed\.json|static/(?:js|css)/[a-zA-Z0-9_.-]+)',file) or not re.fullmatch('[a-f0-9]{64}',digest):raise RuntimeError('Unsupported public artifact')
        if sha(feed if file=='activity/feed.json' else public_bytes(file))!=digest:raise RuntimeError('Incomplete public release')
    return feed,marker

def live():return observed_release()[0]

def reconcile(db, read_live=live):
    observed=sha(read_live())
    db.execute("UPDATE publications SET state='published' WHERE digest=? AND state!='published'",(observed,));db.commit()

def cycle(db, script, api=gh, read_live=live):
    # Reconcile prior effects before creating a fresh projection; uncertain API
    # writes may already have succeeded, so inspect exact public bytes first.
    try:
        reconcile(db,read_live)
    except Exception:pass
    pending=db.execute("SELECT digest,bytes FROM publications WHERE state!='published' ORDER BY created_at DESC LIMIT 1").fetchone()
    if pending:
        # Do not supersede an unresolved effect with a new clock-stamped feed.
        return publish(db,pending[0],pending[1],api,read_live)
    runs=api('repos/'+REPO+'/actions/workflows/deploy.yml/runs?per_page=20')['workflow_runs']
    checked=utc()
    # The existing build entrypoint produces this proof only after checking the
    # actual checkout against the push SHA. Full artifact readback binds it.
    _,release=observed_release()
    for run in reversed(runs):
        if not re.fullmatch('[a-f0-9]{40}',str(run.get('head_sha',''))) or type(run.get('id')) is not int or run['id']<=0:continue
        if run.get('event')!='push' or run.get('status')!='completed' or run.get('conclusion')!='success': continue
        if db.execute('SELECT 1 FROM receipts WHERE source_id=?',('website-'+run.get('head_sha',''),)).fetchone(): continue
        changed=api('repos/'+REPO+'/commits/'+run['head_sha'])
        if changed.get('files') and all(f.get('filename')==FEED for f in changed['files']):continue
        jobs=api('repos/'+REPO+'/actions/runs/'+str(run['id'])+'/jobs?per_page=100')
        receipt=verified(run,jobs,changed,utc(),release)
        if receipt:admit(db,receipt)
    # Source observation time is after successful authoritative queries.
    checked=utc()
    feed=projection(db,checked,script)
    digest,payload=enqueue(db,feed)
    return publish(db,digest,payload,api,read_live)

def main():
    state=pathlib.Path(sys.argv[1]).resolve();state.mkdir(parents=True,exist_ok=True);state.chmod(0o700)
    with (state/'exporter.lock').open('a') as lock:
        os.chmod(lock.name,0o600)
        try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError:return
        db=database(state/'outbox.sqlite3')
        try:status=cycle(db,pathlib.Path(__file__).with_name('activity-projector.cjs'))
        except Exception:
            # Browser ages last success on transport outage; never fake a fresh check.
            status='source-or-publication-unavailable'
        print(raw({'checkedAt':utc(),'status':status}))
        db.close()

if __name__=='__main__':main()
