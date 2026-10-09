// No arbitrary prose, links, labels or source identifiers cross this boundary.
const PROJECTS = {website:'Website',dashboard:'Dashboard',creative:'Creative tools',drum:'Drum project',game:'Game project'};
const AGENTS = {builder:'Builder',reviewer:'Reviewer',publisher:'Publisher',automation:'Automation'};
const ACTIONS = {
  interface_updated:{emoji:'🛠️',text:'interface update reviewed. tiny pixels, enormous feelings.',verification:'reviewed'},
  checks_passed:{emoji:'🧪',text:'checks passed. the green is load-bearing. nobody breathe. 🟢',verification:'tested'},
  review_completed:{emoji:'🔎',text:'independent review complete. squinting was the assignment.',verification:'reviewed'},
  release_deployed:{emoji:'🚀',text:'update deployed and verified. please clap at a respectful volume.',verification:'deployed'}
};
function keys(value,expected) {
  return value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).sort().join('|')===expected.slice().sort().join('|');
}
function date(value,now) {return typeof value==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString()===value && Date.parse(value)<=now;}
function summary(e) {const a=ACTIONS[e.action];return `${a.emoji} ${PROJECTS[e.project].toLowerCase()} ${a.text}`;}
function validateFeed(feed,now=Date.now()) {
  if (!keys(feed,['schemaVersion','generatedAt','sourceObservedAt','lastSuccessAt','health','events']) || feed.schemaVersion!==1 || !['healthy','stale','offline'].includes(feed.health) || !Array.isArray(feed.events) || feed.events.length>100) throw Error('Unsupported activity feed');
  for(const field of ['generatedAt','sourceObservedAt','lastSuccessAt']) if(feed[field]!==null && !date(feed[field],now)) throw Error('Invalid feed date');
  if(feed.health==='healthy' && (!feed.generatedAt || !feed.sourceObservedAt || !feed.lastSuccessAt)) throw Error('Missing healthy evidence');
  if(feed.lastSuccessAt && (!feed.sourceObservedAt || Date.parse(feed.lastSuccessAt)>Date.parse(feed.sourceObservedAt))) throw Error('Inconsistent observation');
  if(feed.sourceObservedAt && (!feed.generatedAt || Date.parse(feed.sourceObservedAt)>Date.parse(feed.generatedAt))) throw Error('Inconsistent generation');
  const ids=new Set();let previous='';
  for(const e of feed.events) {
    if(!keys(e,['eventId','occurredAt','project','agent','action','verification','summary','provenance']) || !/^[a-f0-9]{64}$/.test(e.eventId) || !date(e.occurredAt,now) || !Object.hasOwn(PROJECTS,e.project) || !Object.hasOwn(AGENTS,e.agent) || !Object.hasOwn(ACTIONS,e.action) || e.verification!==ACTIONS[e.action].verification || e.summary!==summary(e) || e.provenance!=='verified-source-receipt' || ids.has(e.eventId)) throw Error('Invalid activity event');
    if(now-Date.parse(e.occurredAt)>30*86400000 || !feed.lastSuccessAt || Date.parse(e.occurredAt)>Date.parse(feed.lastSuccessAt)) throw Error('Expired or unobserved event');
    const order=e.occurredAt+'|'+e.eventId;if(previous && order>previous) throw Error('Unsorted activity');previous=order;ids.add(e.eventId);
  }
  return feed;
}
module.exports={PROJECTS,AGENTS,ACTIONS,keys,date,summary,validateFeed};
