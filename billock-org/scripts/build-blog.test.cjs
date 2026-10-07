const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {buildBlog} = require('./build-blog.cjs');
const {approvalHash,validateTarget,loadQueue,outputState} = require('./publication-queue.cjs');
function fixture(run) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'blog-queue-test-'));
  const posts=path.join(root,'posts'),out=path.join(root,'out');fs.mkdirSync(posts);
  try {run(posts,out);} finally {fs.rmSync(root,{recursive:true,force:true});}
}
function write(posts, slug, html, options={}) {
  const post={slug,title:`Title ${slug}`,summary:'Summary <&>',date:'2013-04-19',originalPublished:'2013-04-19T06:52:00.000-05:00',...options};
  post.publication={state:'approved',publishAt:null,timezone:'America/Chicago',...options.publication};
  post.publication.approvedSha256=approvalHash(post,html);
  fs.writeFileSync(path.join(posts,`${slug}.json`),JSON.stringify(post));fs.writeFileSync(path.join(posts,`${slug}.html`),html);return post;
}

test('only exact approved due content enters pages, manifest and RSS; draft and review clocks never release',()=>fixture((posts,out)=>{
  write(posts,'ready','<p>READY</p>');
  write(posts,'draft','<p>PRIVATE DRAFT</p>',{publication:{state:'draft',publishAt:'2020-01-01T10:00:00-06:00'}});
  write(posts,'review','<p>PRIVATE REVIEW</p>',{publication:{state:'review',publishAt:'2020-01-01T10:00:00-06:00'}});
  write(posts,'future','<p>FUTURE BODY</p>',{publication:{publishAt:'2026-10-08T10:00:00-05:00'}});
  assert.equal(buildBlog(out,posts,'2026-10-08T14:59:59Z'),1);
  for(const file of ['index.html','posts.json','feed.xml','release-state.json']) assert.doesNotMatch(fs.readFileSync(path.join(out,file),'utf8'),/PRIVATE|FUTURE|Title future|Title draft|Title review/);
  assert.equal(fs.existsSync(path.join(out,'future')),false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'posts.json'),'utf8')).map(p=>p.slug),['ready']);
  assert.match(fs.readFileSync(path.join(out,'feed.xml'),'utf8'),/Fri, 19 Apr 2013 11:52:00 GMT/);
  assert.match(fs.readFileSync(path.join(out,'feed.xml'),'utf8'),/Summary &lt;&amp;&gt;/);
  assert.equal(buildBlog(out,posts,'2026-10-08T15:00:00Z'),2);
  assert.match(fs.readFileSync(path.join(out,'future/index.html'),'utf8'),/FUTURE BODY/);
  assert.equal(fs.existsSync(path.join(out,'draft')),false);
  assert.equal(fs.existsSync(path.join(out,'review')),false);
}));

test('scheduled holding replaces prior body; due rebuild restores source and links idempotently',()=>fixture((posts,out)=>{
  const source='<p>Read <b><a href="/blog/later/">last post</a></b> and <a href="https://example.org/">source</a>.</p>';
  write(posts,'first',source);
  const later=write(posts,'later','<p>LATER BODY</p>',{holding:true});
  buildBlog(out,posts,'2026-10-07T15:00:00Z');assert.match(fs.readFileSync(path.join(out,'later/index.html'),'utf8'),/LATER BODY/);
  later.publication.publishAt='2026-10-08T10:00:00-05:00';later.publication.approvedSha256=approvalHash(later,'<p>LATER BODY</p>');fs.writeFileSync(path.join(posts,'later.json'),JSON.stringify(later));
  buildBlog(out,posts,'2026-10-07T15:00:00Z');
  const held=fs.readFileSync(path.join(out,'later/index.html'),'utf8');assert.match(held,/awaiting its scheduled release/);assert.match(held,/name="robots" content="noindex"/);assert.doesNotMatch(held,/LATER BODY|Summary/);
  const first=fs.readFileSync(path.join(out,'first/index.html'),'utf8');assert.match(first,/<b>last post<\/b>/);assert.match(first,/href="https:\/\/example.org\/"/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(out,'posts.json'),'utf8')).length,1);
  buildBlog(out,posts,'2026-10-08T15:00:00Z');assert.ok(fs.readFileSync(path.join(out,'first/index.html'),'utf8').includes(source));assert.match(fs.readFileSync(path.join(out,'later/index.html'),'utf8'),/LATER BODY/);
  const state=outputState(out);buildBlog(out,posts,'2026-10-09T15:00:00Z');assert.deepEqual(outputState(out),state);
  assert.equal(fs.readFileSync(path.join(posts,'first.html'),'utf8'),source);
}));

test('approval binds wording, title and schedule; unsafe metadata and legacy flags fail closed',()=>fixture((posts,out)=>{
  const p=write(posts,'post','<p>Original</p>');
  fs.writeFileSync(path.join(posts,'post.html'),'<p>Edited</p>');assert.throws(()=>buildBlog(out,posts),/Approval no longer matches/);
  fs.writeFileSync(path.join(posts,'post.html'),'<p>Original</p>');p.title='Edited';fs.writeFileSync(path.join(posts,'post.json'),JSON.stringify(p));assert.throws(()=>loadQueue(posts),/Approval no longer matches/);
  p.title='Title post';p.publication.publishAt='2026-10-08T10:00:00-05:00';fs.writeFileSync(path.join(posts,'post.json'),JSON.stringify(p));assert.throws(()=>loadQueue(posts),/Approval no longer matches/);
  p.publication.publishAt=null;p.published=true;fs.writeFileSync(path.join(posts,'post.json'),JSON.stringify(p));assert.throws(()=>loadQueue(posts),/Legacy published/);
  delete p.published;p.slug='../escape';fs.writeFileSync(path.join(posts,'post.json'),JSON.stringify(p));assert.throws(()=>loadQueue(posts),/Invalid slug/);
}));

test('Chicago wall times honor summer, winter, ambiguous fall offsets and missing spring times',()=>{
  assert.equal(validateTarget('2026-10-08T10:00:00-05:00'),Date.parse('2026-10-08T15:00:00Z'));
  assert.equal(validateTarget('2026-12-08T10:00:00-06:00'),Date.parse('2026-12-08T16:00:00Z'));
  assert.equal(validateTarget('2026-11-01T01:30:00-05:00'),Date.parse('2026-11-01T06:30:00Z'));
  assert.equal(validateTarget('2026-11-01T01:30:00-06:00'),Date.parse('2026-11-01T07:30:00Z'));
  for(const time of ['2026-10-08T10:00:00','2026-10-08T10:00:00-06:00','2026-12-08T10:00:00-05:00','2026-03-08T02:30:00-06:00','2026-02-30T10:00:00-06:00']) assert.throws(()=>validateTarget(time));
  assert.throws(()=>validateTarget('2026-10-08T10:00:00-05:00','UTC'));
});

test('unapproved holding requests fail closed without rendering draft titles',()=>fixture((posts,out)=>{
  for(const state of ['draft','review']) {
    write(posts,'secret','<p>PRIVATE</p>',{title:'PRIVATE TITLE',holding:true,publication:{state}});
    assert.throws(()=>buildBlog(out,posts),/Holding pages require exact approved/);
    assert.equal(fs.existsSync(out),false);
  }
}));

test('live verifier catches partial upload even when marker matches, then recognizes retry success',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'blog-verify-'));
  try {
    const posts=path.join(root,'posts'),out=path.join(root,'out');fs.mkdirSync(posts);write(posts,'ready','<p>READY</p>');buildBlog(out,posts);
    const {verifyLive}=require('./blog-queue.cjs');let broken=true;
    const request=async url=>{
      const name=decodeURIComponent(new URL(url).pathname.slice('/blog/'.length));
      return new Response(broken && name==='ready/index.html' ? '<p>Stale body</p>' : fs.readFileSync(path.join(out,name)),{status:200});
    };
    const partial=await verifyLive(out,'https://example.org/blog/',request);assert.equal(partial.matches,false);assert.deepEqual(partial.differences,['ready/index.html']);
    broken=false;assert.equal((await verifyLive(out,'https://example.org/blog/',request)).matches,true);
    const unavailable=await verifyLive(out,'https://example.org/blog/',async()=>{throw Error('network outage');});assert.equal(unavailable.matches,false);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});

test('holding behavior requires approval and removed remote paths are not falsely verified',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'blog-retired-'));
  try {
    const posts=path.join(root,'posts'),out=path.join(root,'out');fs.mkdirSync(posts);
    const post=write(posts,'ready','<p>READY</p>');post.holding=true;fs.writeFileSync(path.join(posts,'ready.json'),JSON.stringify(post));assert.throws(()=>buildBlog(out,posts),/Approval no longer matches/);
    post.holding=false;fs.writeFileSync(path.join(posts,'ready.json'),JSON.stringify(post));buildBlog(out,posts);
    const {verifyLive}=require('./blog-queue.cjs');const remote=outputState(out);remote.files['previously-public/index.html']='a'.repeat(64);
    const request=async url=>{const name=new URL(url).pathname.slice('/blog/'.length);return new Response(name==='release-state.json' ? JSON.stringify(remote) : fs.readFileSync(path.join(out,name)));};
    const result=await verifyLive(out,'https://example.org/blog/',request);assert.equal(result.matches,false);assert.deepEqual(result.retired,['previously-public/index.html']);
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
