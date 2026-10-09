const test=require('node:test'),assert=require('node:assert/strict');const {check,hash}=require('./verify-activity.cjs');
const index=Buffer.from('synthetic isolated page'),feed=Buffer.from('{}'),js=Buffer.from('synthetic isolated js');
const marker={version:1,sourceDigest:'a'.repeat(64),sourceRevision:'b'.repeat(40),sourceVerified:true,files:{'index.html':hash(index),'activity/feed.json':hash(feed),'static/js/main.js':hash(js)}};
function request(overrides={}) {return async url=>{const name=new URL(url).pathname.slice(1);const bytes=overrides[name]||({'index.html':index,'activity/feed.json':feed,'static/js/main.js':js}[name]);return name==='activity/release-state.json'?{ok:true,json:async()=>overrides.marker||marker}:{ok:!!bytes,arrayBuffer:async()=>bytes};};}
test('exact public marker/page/feed/asset bytes match',async()=>assert.equal(await check(request(),marker.sourceDigest),true));
test('partial upload or stale source marker triggers existing deployment retry',async()=>{assert.equal(await check(request({'static/js/main.js':Buffer.from('partial')}),marker.sourceDigest),false);assert.equal(await check(request(),'b'.repeat(64)),false);});
test('external/traversing paths never become public requests',async()=>{const bad={...marker,files:{...marker.files,'../private':'b'.repeat(64)}};assert.equal(await check(request({marker:bad}),marker.sourceDigest),false);});
