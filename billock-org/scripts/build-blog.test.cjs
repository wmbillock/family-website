const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {buildBlog} = require('./build-blog.cjs');

test('empty launch; drafts stay private; published URLs and RSS agree; stale output removed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-test-'));
  try {
    const posts = path.join(root, 'posts'), out = path.join(root, 'output');
    fs.mkdirSync(posts);
    fs.writeFileSync(path.join(posts, 'draft.json'), JSON.stringify({published:false, title:'PRIVATE DRAFT'}));
    assert.equal(buildBlog(out, posts), 0);
    assert.match(fs.readFileSync(path.join(out,'index.html'),'utf8'), /No posts published yet/);
    assert.doesNotMatch(fs.readFileSync(path.join(out,'feed.xml'),'utf8'), /PRIVATE DRAFT|<item>/);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'posts.json'),'utf8')), []);
    const metadata = {published:true,slug:'fixture',date:'2026-10-06',originalPublished:'2026-10-06T08:30:00-06:00',title:'Test <&>',summary:'A & B'};
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    fs.writeFileSync(path.join(posts,'fixture.html'), '<p>Test body.</p>');
    assert.equal(buildBlog(out, posts), 1);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'posts.json'),'utf8')), [{slug:'fixture',title:'Test <&>',date:'2026-10-06',summary:'A & B'}]);
    assert.match(fs.readFileSync(path.join(out,'fixture/index.html'),'utf8'), /https:\/\/billock.org\/blog\/fixture\//);
    assert.match(fs.readFileSync(path.join(out,'feed.xml'),'utf8'), /Test &lt;&amp;&gt;/);
    assert.match(fs.readFileSync(path.join(out,'feed.xml'),'utf8'), /Tue, 06 Oct 2026 14:30:00 GMT/);
    metadata.published = false;
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    buildBlog(out, posts);
    assert.equal(fs.existsSync(path.join(out,'fixture')), false);
    metadata.published = true; metadata.originalPublished = '2026-10-06T08:30:00';
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    assert.throws(() => buildBlog(out, posts), /Invalid original publication timestamp/);
    metadata.originalPublished = '2026-10-06T08:30:00-06:00'; metadata.slug = '../escape';
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    assert.throws(() => buildBlog(out, posts), /Invalid slug/);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});


test('staged internal references preserve words and restore links when target publishes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-links-'));
  try {
    const posts = path.join(root, 'posts'), out = path.join(root, 'output');
    fs.mkdirSync(posts);
    const source = '<p>Read <b><a href="/blog/later/">the previous post</a></b> and <a href="https://example.org/">the source</a>.</p>';
    fs.writeFileSync(path.join(posts,'first.json'), JSON.stringify({published:true,slug:'first',date:'2026-10-06',title:'First',summary:'First summary'}));
    fs.writeFileSync(path.join(posts,'first.html'), source);
    const target = {published:false,slug:'later',date:'2026-10-05',title:'Later',summary:'Later summary'};
    fs.writeFileSync(path.join(posts,'later.json'), JSON.stringify(target));
    fs.writeFileSync(path.join(posts,'later.html'), '<p>Later body.</p>');
    buildBlog(out, posts);
    const pending = fs.readFileSync(path.join(out,'first/index.html'),'utf8');
    assert.match(pending, /Read <b>the previous post<\/b> and <a href="https:\/\/example.org\/">the source<\/a>/);
    assert.doesNotMatch(pending, /href="\/blog\/later\/"/);
    assert.equal(fs.existsSync(path.join(out,'later')),false);
    assert.equal(JSON.parse(fs.readFileSync(path.join(out,'posts.json'),'utf8')).length,1);
    target.published = true;
    fs.writeFileSync(path.join(posts,'later.json'), JSON.stringify(target));
    buildBlog(out, posts);
    assert.ok(fs.readFileSync(path.join(out,'first/index.html'),'utf8').includes(source));
    assert.equal(fs.readFileSync(path.join(posts,'first.html'),'utf8'),source);
    assert.equal(fs.existsSync(path.join(out,'later/index.html')),true);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});

test('recoverable holding replaces a previously published body without listing it', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-hold-'));
  try {
    const posts = path.join(root, 'posts'), out = path.join(root, 'output');
    fs.mkdirSync(posts);
    const metadata = {published:true,slug:'held',date:'2026-10-06',title:'Held article',summary:'Private summary'};
    fs.writeFileSync(path.join(posts,'held.json'),JSON.stringify(metadata));
    fs.writeFileSync(path.join(posts,'held.html'),'<p>BODY SENTINEL</p>');
    buildBlog(out,posts);
    assert.match(fs.readFileSync(path.join(out,'held/index.html'),'utf8'),/BODY SENTINEL/);
    metadata.published=false;metadata.holding=true;
    fs.writeFileSync(path.join(posts,'held.json'),JSON.stringify(metadata));
    assert.equal(buildBlog(out,posts),0);
    const held=fs.readFileSync(path.join(out,'held/index.html'),'utf8');
    assert.match(held,/awaiting its scheduled release/);
    assert.match(held,/name="robots" content="noindex"/);
    assert.doesNotMatch(held,/BODY SENTINEL|Private summary/);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out,'posts.json'),'utf8')),[]);
    assert.doesNotMatch(fs.readFileSync(path.join(out,'feed.xml'),'utf8'),/Held article|BODY SENTINEL|<item>/);
    metadata.published=true;
    fs.writeFileSync(path.join(posts,'held.json'),JSON.stringify(metadata));
    buildBlog(out,posts);
    assert.match(fs.readFileSync(path.join(out,'held/index.html'),'utf8'),/BODY SENTINEL/);
    assert.doesNotMatch(fs.readFileSync(path.join(out,'held/index.html'),'utf8'),/awaiting its scheduled release/);
    assert.equal(fs.readFileSync(path.join(posts,'held.html'),'utf8'),'<p>BODY SENTINEL</p>');
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
