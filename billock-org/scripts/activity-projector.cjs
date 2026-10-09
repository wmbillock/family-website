'use strict';
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const C=require('../src/activity/contract.js');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
// This is an offline projection boundary, not a verifier or permission grant.
// A source-specific trusted integration must supply pinned receipts. Never feed
// agent prose, entire Console responses or vault notes into this function.
function project(receipts,policy,observation=null,now=new Date()) {
  const ms=now.getTime();if(!Number.isFinite(ms))throw Error('Invalid clock');
  if(!C.keys(policy,['schemaVersion','sources','observationSha256']) || policy.schemaVersion!==1 || !Array.isArray(policy.sources) || policy.sources.length>1000 || !Array.isArray(receipts) || receipts.length>1000)throw Error('Invalid private policy');
  const pins=new Map();
  for(const p of policy.sources) {
    if(!C.keys(p,['sourceId','receiptSha256','project','agent','action']) || !/^[a-z0-9-]{1,64}$/.test(p.sourceId) || !/^[a-f0-9]{64}$/.test(p.receiptSha256) || !Object.hasOwn(C.PROJECTS,p.project) || !Object.hasOwn(C.AGENTS,p.agent) || !Object.hasOwn(C.ACTIONS,p.action)) throw Error('Unapproved source policy');
    if(pins.has(p.sourceId))throw Error('Duplicate source pin');pins.set(p.sourceId,p);
  }
  let checkedAt=null;
  if(pins.size) {
    if(typeof observation!=='string' || Buffer.byteLength(observation)>4096 || !/^[a-f0-9]{64}$/.test(policy.observationSha256) || digest(observation)!==policy.observationSha256)throw Error('Missing verified source observation');
    const o=JSON.parse(observation);
    const sourceSet=JSON.stringify([...policy.sources].sort((a,b)=>a.sourceId.localeCompare(b.sourceId)));
    if(!C.keys(o,['schemaVersion','checkedAt','sourceSetSha256','evidenceSha256']) || o.schemaVersion!==1 || !C.date(o.checkedAt,ms) || o.sourceSetSha256!==digest(sourceSet) || !/^[a-f0-9]{64}$/.test(o.evidenceSha256))throw Error('Invalid source observation');
    checkedAt=o.checkedAt;
  } else if(observation!==null || policy.observationSha256!==null)throw Error('Unconfigured observation');
  const events=new Map();const observed=new Set();
  for(const item of receipts) {
    if(!C.keys(item,['sourceId','bytes']) || typeof item.bytes!=='string' || Buffer.byteLength(item.bytes)>4096)throw Error('Invalid receipt envelope');
    const pin=pins.get(item.sourceId);if(!pin || digest(item.bytes)!==pin.receiptSha256)throw Error('Receipt pin mismatch');
    observed.add(item.sourceId);
    const r=JSON.parse(item.bytes);
    if(!C.keys(r,['schemaVersion','taskId','attemptId','revision','occurredAt','verification','evidenceSha256']) || r.schemaVersion!==1 || !/^[a-zA-Z0-9-]{1,64}$/.test(r.taskId) || !/^[a-zA-Z0-9-]{1,64}$/.test(r.attemptId) || !/^[a-f0-9]{40,64}$/.test(r.revision) || !/^[a-f0-9]{64}$/.test(r.evidenceSha256) || !C.date(r.occurredAt,Date.parse(checkedAt)) || r.verification!==C.ACTIONS[pin.action].verification)throw Error('Unverified transition receipt');
    // Pins must come from independently verified receipts and are private. A hash
    // binds bytes; it does not prove the actual test/review/deployment happened.
    if(ms-Date.parse(r.occurredAt)>30*86400000)continue;
    const e={eventId:digest([item.sourceId,r.taskId,r.attemptId,r.revision,pin.action].join('|')),occurredAt:r.occurredAt,project:pin.project,agent:pin.agent,action:pin.action,verification:r.verification,provenance:'verified-source-receipt'};e.summary=C.summary(e);
    if(events.has(e.eventId) && JSON.stringify(events.get(e.eventId))!==JSON.stringify(e))throw Error('Conflicting transition');events.set(e.eventId,e);
  }
  if(observed.size!==pins.size)throw Error('Missing pinned source observation');
  const at=now.toISOString();const feed={schemaVersion:1,generatedAt:at,sourceObservedAt:checkedAt,lastSuccessAt:checkedAt,health:checkedAt && ms-Date.parse(checkedAt)<=15*60000?'healthy':'stale',events:[...events.values()].sort((a,b)=>(b.occurredAt+'|'+b.eventId).localeCompare(a.occurredAt+'|'+a.eventId)).slice(0,100)};
  // An empty unconfigured policy is disconnected, not a successful observation.
  if(pins.size===0){feed.health='offline';feed.sourceObservedAt=null;feed.lastSuccessAt=null;}
  return C.validateFeed(feed,ms);
}
function writeAtomic(file,feed) {
  C.validateFeed(feed);const raw=JSON.stringify(feed,null,2)+'\n';if(Buffer.byteLength(raw)>131072)throw Error('Feed too large');
  const tmp=file+'.'+crypto.randomUUID()+'.tmp';try {fs.writeFileSync(tmp,raw,{flag:'wx',mode:0o600});if(fs.readFileSync(tmp,'utf8')!==raw)throw Error('Write mismatch');fs.renameSync(tmp,file);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
}
function markFailure(previous,now=new Date()) {
  const ms=now.getTime();if(!Number.isFinite(ms))throw Error('Invalid clock');
  const feed={...previous,generatedAt:now.toISOString(),sourceObservedAt:now.toISOString(),health:previous.lastSuccessAt?'stale':'offline',events:previous.events.filter(e=>ms-Date.parse(e.occurredAt)<=30*86400000)};
  return C.validateFeed(feed,ms);
}
if(require.main===module){
  // Explicit offline inputs/output only. No network, daemon, automatic activation.
  const [input,policy,observation,output]=process.argv.slice(2);if(!input || !policy || !observation || !output || process.argv.length!==6)throw Error('Usage: node activity-projector.cjs PRIVATE_RECEIPTS_JSON PRIVATE_PIN_POLICY_JSON PRIVATE_OBSERVATION_JSON NEW_OUTPUT_JSON');
  for(const f of [input,policy,observation])if(fs.statSync(f).size>2*1024*1024 || fs.lstatSync(f).isSymbolicLink())throw Error('Unsafe input');
  if([input,policy,observation].some(f=>path.resolve(output)===path.resolve(f)))throw Error('Input overwrite');
  writeAtomic(output,project(JSON.parse(fs.readFileSync(input,'utf8')),JSON.parse(fs.readFileSync(policy,'utf8')),fs.readFileSync(observation,'utf8')));
}
module.exports={project,writeAtomic,digest,markFailure};
