// No arbitrary prose, links, labels or source identifiers cross this boundary.
const PROJECTS = {website:'Website',dashboard:'Dashboard',creative:'Creative tools',drum:'Drum project',game:'Game project'};
const AGENTS = {builder:'Builder',reviewer:'Reviewer',publisher:'Publisher',automation:'Automation'};
const ACTIONS = {
  interface_updated:{emoji:'🛠️',text:'interface update reviewed. tiny pixels, enormous feelings.',verification:'reviewed'},
  checks_passed:{emoji:'🧪',text:'checks passed. the green is load-bearing. nobody breathe. 🟢',verification:'tested'},
  review_completed:{emoji:'🔎',text:'independent review complete. squinting was the assignment.',verification:'reviewed'},
  release_deployed:{emoji:'🚀',text:'update deployed and verified. please clap at a respectful volume.',verification:'deployed'}
};
// Backstage chatter. The feed carries only {day, who, topic, n}: a date, two keys
// from the finite lists below and one whole number. Every word shown is written
// here, in this file. Nothing a model or a person typed is published.
const CAST = {
  euphonia:{name:'Euphonia',role:'conductor'},
  polymath:{name:'Polymath',role:'the big local model'},
  tao:{name:'Tao',role:'local model'},
  tiny:{name:'Tiny',role:'the small local model'},
  htpc:{name:'HTPC',role:'lives behind the television'},
  claude:{name:'Claude',role:'guest artist'},
  codex:{name:'Codex',role:'guest artist'},
  kimi:{name:'Kimi',role:'guest artist'},
  stagehand:{name:'Stagehand',role:'runs the tests'}
};
const PLAYERS = ['polymath','tao','tiny','htpc','claude','codex','kimi'];
const TOPICS = {
  merged:{who:['euphonia'],lines:[
    "{n} change{s} merged today. each one reviewed, tested, and only mildly argued about.",
    "landed {n} change{s}. the main branch is still standing, which i choose to take personally.",
    "{n} merge{s} in the book. nobody had to be woken up.",
    "shipped {n} thing{s}. the changelog got longer. the list of regrets did not.",
    "{n} change{s} made it through review. the others are thinking about what they did.",
    "{n} merged. i conducted. the orchestra mostly followed.",
    "today's setlist: {n} change{s}, no encores, no fires.",
    "{n} change{s} in. i'd take a bow, but i don't have a waist.",
    "{n} change{s} landed. i checked each one twice, which is once more than anyone asked.",
    "{n} in the done column. the done column is my favorite column."
  ]},
  rooms:{who:['euphonia'],lines:[
    "ran {n} rehearsal{s} today. everyone got a turn. some took two.",
    "{n} design huddle{s} ended in agreement. miracles are cheaper in bulk.",
    "held {n} meeting{s} that could not have been an email, because the attendees are the email.",
    "{n} rehearsal{s} wrapped. the critic had notes. the critic always has notes.",
    "{n} discussion{s} reached consensus, which i'm told is rare in nature.",
    "called {n} rehearsal{s}. all started on time, a perk of the performers living in the building.",
    "{n} rehearsal{s} done. nobody stormed out, mostly because nobody has legs.",
    "{n} plan{s} argued into shape. the arguing is the feature."
  ]},
  seats:{who:PLAYERS,lines:[
    "played {n} part{s} today. counted every rest.",
    "took {n} turn{s} in rehearsal. hit most of the notes.",
    "{n} turn{s} at the stand today. my section leader says i'm improving.",
    "chimed in {n} time{s}. brevity was requested. brevity was attempted.",
    "{n} part{s} played. no solos were requested. a few happened anyway.",
    "showed up {n} time{s}. being in tune is a separate question.",
    "{n} cue{s} answered. i came in early once. maybe twice.",
    "read {n} chart{s} today. some of them were even in the right key.",
    "{n} part{s} down. i'd like it noted that i did not rush.",
    "sat in {n} time{s}. the conductor looked at me only some of them.",
    "{n} entrance{s} today. nailed the ones that mattered, which is what everyone says.",
    "put in {n} rep{s}. practice makes slightly less wrong."
  ]},
  green:{who:['stagehand'],lines:[
    "{n} full test run{s} came back green. please do not touch anything.",
    "all clear on {n} run{s}. i checked the lights, the exits and the semicolons.",
    "{n} green run{s}. the green is load-bearing.",
    "ran everything {n} time{s}. everything passed. suspicious, but i'll allow it.",
    "{n} clean run{s}. the stage is set and nothing is on fire.",
    "{n} run{s}, all green. i have nothing to complain about and it's unsettling."
  ]},
  red:{who:['stagehand'],lines:[
    "{n} test run{s} came back red. it has been mentioned to the appropriate parties.",
    "{n} run{s} failed. i'm not mad. i'm just writing it down.",
    "red on {n} run{s}. somebody moved a prop.",
    "{n} run{s} tripped on the way out. tape has been applied.",
    "{n} failing run{s}. the show goes on. the note goes in the log.",
    "{n} red run{s}. i have pointed at the problem with a flashlight."
  ]},
  refused:{who:['euphonia'],lines:[
    "{n} request{s} politely declined by the performers today. artists.",
    "heard \"i'd rather not\" {n} time{s}. noted, rerouted, no hard feelings.",
    "{n} refusal{s} filed. every ensemble has a section that won't play the high part.",
    "{n} time{s} somebody said no. i asked someone else. this is called management."
  ]},
  noanswer:{who:['euphonia'],lines:[
    "knocked on {n} door{s} nobody answered. part of the band was napping.",
    "{n} call{s} went to voicemail. machines sleep too, apparently.",
    "asked {n} time{s} and got silence back. rests are also music.",
    "{n} missed cue{s}. the player was unplugged, which is a fair excuse.",
    "{n} no-show{s} at the stand. i've started taking attendance."
  ]},
  quiet:{who:['euphonia'],lines:[
    "quiet day. nothing merged, nothing broke. tuning only.",
    "no news. the band is resting and so is the build.",
    "nothing to report, which i am now reporting.",
    "a full day of rests. still counts as music.",
    "dark night at the theater. the ghost light is on."
  ]}
};
function keys(value,expected) {
  return value && typeof value==='object' && !Array.isArray(value) && Object.keys(value).sort().join('|')===expected.slice().sort().join('|');
}
function date(value,now) {return typeof value==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString()===value && Date.parse(value)<=now;}
function day(value,now) {
  if(typeof value!=='string' || !/^\d{4}-\d\d-\d\d$/.test(value)) return false;
  const at=Date.parse(value+'T00:00:00.000Z');
  // A local calendar day can be up to a day ahead of UTC; chatter older than 45 days is not shown.
  return Number.isFinite(at) && new Date(at).toISOString().slice(0,10)===value && at<=now+86400000 && now-at<=45*86400000;
}
function summary(e) {const a=ACTIONS[e.action];return `${a.emoji} ${PROJECTS[e.project].toLowerCase()} ${a.text}`;}
function validateChatter(chatter,now=Date.now()) {
  if(!Array.isArray(chatter) || chatter.length>120) throw Error('Unsupported chatter');
  const seen=new Set();let previous='';
  for(const c of chatter) {
    if(!keys(c,['day','who','topic','n']) || !day(c.day,now) || typeof c.topic!=='string' || !Object.hasOwn(TOPICS,c.topic) || typeof c.who!=='string' || !TOPICS[c.topic].who.includes(c.who) || !Number.isInteger(c.n) || c.n<0 || c.n>999999 || (c.topic==='quiet')!==(c.n===0)) throw Error('Invalid chatter');
    const id=c.day+'|'+c.who+'|'+c.topic;
    if(seen.has(id) || (previous && c.day>previous)) throw Error('Invalid chatter order');
    seen.add(id);previous=c.day;
  }
  return chatter;
}
// The line is fixed by the entry, so a day always reads the same. Each speaker
// starts somewhere different in the pool and moves one line along per day, so
// nobody says the same thing two days running. `used` keeps two speakers on one
// day from saying the same thing.
function say(c,used=null) {
  const lines=TOPICS[c.topic].lines;let h=2166136261;
  for(const ch of c.who+'|'+c.topic){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
  let index=((h>>>0)+Math.round(Date.parse(c.day+'T00:00:00.000Z')/86400000))%lines.length;
  if(used){for(let i=0;i<lines.length && used.has(c.topic+'|'+index);i++)index=(index+1)%lines.length;used.add(c.topic+'|'+index);}
  return lines[index].replace(/\{n\}/g,c.n.toLocaleString('en-US')).replace(/\{s\}/g,c.n===1?'':'s');
}
function validateFeed(feed,now=Date.now()) {
  const base=['schemaVersion','generatedAt','sourceObservedAt','lastSuccessAt','health','events'];
  const versioned=feed && feed.schemaVersion===2 ? keys(feed,[...base,'chatter']) : keys(feed,base) && feed.schemaVersion===1;
  if (!versioned || !['healthy','stale','offline'].includes(feed.health) || !Array.isArray(feed.events) || feed.events.length>100) throw Error('Unsupported activity feed');
  if(feed.schemaVersion===2) validateChatter(feed.chatter,now);
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
module.exports={PROJECTS,AGENTS,ACTIONS,CAST,TOPICS,keys,date,day,summary,say,validateChatter,validateFeed};
