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
    const metadata = {published:true,slug:'fixture',date:'2026-10-06',title:'Test <&>',summary:'A & B'};
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    fs.writeFileSync(path.join(posts,'fixture.html'), '<p>Test body.</p>');
    assert.equal(buildBlog(out, posts), 1);
    assert.match(fs.readFileSync(path.join(out,'fixture/index.html'),'utf8'), /https:\/\/billock.org\/blog\/fixture\//);
    assert.match(fs.readFileSync(path.join(out,'feed.xml'),'utf8'), /Test &lt;&amp;&gt;/);
    metadata.published = false;
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    buildBlog(out, posts);
    assert.equal(fs.existsSync(path.join(out,'fixture')), false);
    metadata.published = true; metadata.slug = '../escape';
    fs.writeFileSync(path.join(posts,'fixture.json'), JSON.stringify(metadata));
    assert.throws(() => buildBlog(out, posts), /Invalid slug/);
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});
