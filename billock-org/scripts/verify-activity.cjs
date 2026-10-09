const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const C=require('../src/activity/contract.js');
const {execFileSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function sourceDigest(root=path.join(__dirname,'..')) {
  return hash(Buffer.concat(['src/components/people/Activity.jsx','src/components/people/Willow.jsx','src/activity/contract.js','src/stylesheets/willow.sass','public/activity/feed.json'].map(p=>fs.readFileSync(path.join(root,p)))));
}
function prepare(build=path.join(__dirname,'../build')) {
  const manifest=JSON.parse(fs.readFileSync(path.join(build,'asset-manifest.json')));
  const files=['index.html','activity/feed.json',...manifest.entrypoints];
  const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const sourceVerified=process.env.GITHUB_EVENT_NAME==='push' && process.env.GITHUB_SHA===sourceRevision;
  if(process.env.GITHUB_EVENT_NAME==='push' && !sourceVerified)throw Error('Actual checkout differs from push revision');
  const state={version:1,sourceDigest:sourceDigest(),sourceRevision,sourceVerified,files:Object.fromEntries(files.map(file=>[file,hash(fs.readFileSync(path.join(build,file)))]))};
  fs.writeFileSync(path.join(build,'activity/release-state.json'),JSON.stringify(state,null,2)+'\n');return state;
}
async function check(request=fetch,expected=sourceDigest()) {
  try {
    const response=await request('https://billock.org/activity/release-state.json',{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
    if(!response.ok) return false;
    const marker=await response.json();
    if(!C.keys(marker,['version','sourceDigest','sourceRevision','sourceVerified','files']) || marker.version!==1 || marker.sourceDigest!==expected || !marker.files || Object.keys(marker.files).length>20 || !marker.files['index.html'] || !marker.files['activity/feed.json'])return false;
    for(const [file,digest] of Object.entries(marker.files)){
      if(!/^(?:index\.html|activity\/feed\.json|static\/(?:js|css)\/[a-zA-Z0-9_.-]+)$/.test(file) || !/^[a-f0-9]{64}$/.test(digest))return false;
      const url=new URL(file,'https://billock.org/');url.searchParams.set('activity',digest.slice(0,12));
      const item=await request(url,{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
      if(!item.ok || hash(Buffer.from(await item.arrayBuffer()))!==digest)return false;
    }
    return true;
  }catch{return false;}
}
async function verify(build=path.join(__dirname,'../build'),request=fetch) {
  const manifest=JSON.parse(fs.readFileSync(path.join(build,'asset-manifest.json')));
  const files=['index.html','activity/feed.json','activity/release-state.json',...manifest.entrypoints];
  C.validateFeed(JSON.parse(fs.readFileSync(path.join(build,'activity/feed.json'),'utf8')));
  for(const file of files){
    const bytes=fs.readFileSync(path.join(build,file));const url=new URL(file,'https://billock.org/');url.searchParams.set('activity',hash(bytes).slice(0,12));
    const response=await request(url,{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
    if(!response.ok || hash(Buffer.from(await response.arrayBuffer()))!==hash(bytes))throw Error('Public activity build does not match');
  }
  return {matches:true,files:files.length};
}
if(require.main===module){
  if(process.argv[2]==='prepare')prepare();
  else if(process.argv[2]==='check')check().then(matches=>{if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`deploy=${!matches}\n`);console.log(JSON.stringify({matches}));});
  else verify().then(x=>console.log(JSON.stringify(x))).catch(()=>{console.error('Activity deployment verification failed');process.exitCode=1;});
}
module.exports={verify,sourceDigest,prepare,check,hash};
