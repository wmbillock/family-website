const fs = require('node:fs');
const path = require('node:path');
const site = 'https://billock.org';
const author = 'Willow Billock';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function loadPosts(directory) {
  return fs.readdirSync(directory).filter(name => name.endsWith('.json')).map(name => {
    const post = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
    // Unpublished files are excluded before loading any article body.
    if (post.published !== true) return null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || '') || name !== `${post.slug}.json`) throw Error(`Invalid slug: ${name}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date || '') || new Date(`${post.date}T00:00:00Z`).toISOString().slice(0, 10) !== post.date) throw Error(`Invalid date: ${name}`);
    if (!post.title || !post.summary || typeof post.title !== 'string' || typeof post.summary !== 'string') throw Error(`Missing title or summary: ${name}`);
    if (post.originalPublished && (typeof post.originalPublished !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(post.originalPublished) || !Number.isFinite(Date.parse(post.originalPublished)) || post.originalPublished.slice(0, 10) !== post.date)) throw Error(`Invalid original publication timestamp: ${name}`);
    const html = fs.readFileSync(path.join(directory, `${post.slug}.html`), 'utf8');
    if (!html.trim()) throw Error(`Empty article: ${name}`);
    return {...post, html};
  }).filter(Boolean).sort((a,b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

function page(title, description, route, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${site}${route}">
<link rel="alternate" type="application/rss+xml" title="Willow Billock — technical blog" href="/blog/feed.xml">
<link rel="stylesheet" href="/blog/style.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header><nav aria-label="Site"><a href="/">Billock family</a> · <a href="/blog/">Technical blog</a> · <a href="/blog/feed.xml">RSS</a></nav></header>
<main id="main">${body}</main>
<footer><p>Willow Billock</p></footer>
</body>
</html>
`;
}

function buildBlog(output, postsDirectory) {
  const posts = loadPosts(postsDirectory);
  fs.rmSync(output, {recursive:true, force:true});
  fs.mkdirSync(output, {recursive:true});
  fs.copyFileSync(path.join(__dirname, '../blog/style.css'), path.join(output, 'style.css'));
  const list = posts.length ? `<ol class="posts">${posts.map(post => `<li><time datetime="${post.date}">${post.date}</time> — <a href="/blog/${post.slug}/">${escape(post.title)}</a><p>${escape(post.summary)}</p></li>`).join('\n')}</ol>` : '<p>No posts published yet.</p>';
  fs.writeFileSync(path.join(output, 'posts.json'), JSON.stringify(posts.map(({slug, title, date, summary}) => ({slug, title, date, summary}))) + '\n');
  fs.writeFileSync(path.join(output, 'index.html'), page(`${author} — technical blog`, 'Technical writing by Willow Billock.', '/blog/', `<h1>${author}</h1><p>Technically Writing</p><h2>Posts</h2>${list}`));
  // Explicit holding pages overwrite previously uploaded bodies during staged releases.
  // They stay out of the archive, manifest and feed; publishing restores the article.
  for (const name of fs.readdirSync(postsDirectory).filter(name => name.endsWith('.json'))) {
    const post = JSON.parse(fs.readFileSync(path.join(postsDirectory, name), 'utf8'));
    if (post.published === true || post.holding !== true) continue;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || '') || name !== `${post.slug}.json` || typeof post.title !== 'string' || !post.title) throw Error(`Invalid holding page: ${name}`);
    const directory = path.join(output, post.slug);
    fs.mkdirSync(directory);
    const holding = page(`${post.title} — ${author}`, 'Article awaiting its scheduled release.', `/blog/${post.slug}/`, `<h1>${escape(post.title)}</h1><p>This article is awaiting its scheduled release.</p><p><a href="/blog/">Read the blog archive</a>.</p>`).replace('<meta name="viewport"', '<meta name="robots" content="noindex">\n<meta name="viewport"');
    fs.writeFileSync(path.join(directory, 'index.html'), holding);
  }
  const publishedSlugs = new Set(posts.map(post => post.slug));
  for (const post of posts) {
    // Keep references to staged posts as plain text until their target is published.
    // Source HTML stays intact so the next build restores links automatically.
    const articleHtml = post.html.replace(/<a\b([^>]*\bhref=["']\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)\/["'][^>]*)>([\s\S]*?)<\/a>/gi, (anchor, attributes, slug, text) => publishedSlugs.has(slug) ? anchor : text);
    const directory = path.join(output, post.slug);
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'index.html'), page(`${post.title} — ${author}`, post.summary, `/blog/${post.slug}/`, `<article><h1>${escape(post.title)}</h1><p>By ${author} · <time datetime="${post.date}">${post.date}</time></p>${articleHtml}</article>`));
  }
  fs.writeFileSync(path.join(output, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Willow Billock — technical blog</title><link>${site}/blog/</link><description>Technical writing by Willow Billock.</description><language>en</language>
<atom:link href="${site}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${posts.map(post => `<item><title>${escape(post.title)}</title><link>${site}/blog/${post.slug}/</link><guid isPermaLink="true">${site}/blog/${post.slug}/</guid><pubDate>${new Date(post.originalPublished || `${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escape(post.summary)}</description></item>`).join('\n')}
</channel></rss>\n`);
  return posts.length;
}

if (require.main === module) {
  const count = buildBlog(path.join(__dirname, '../build/blog'), path.join(__dirname, '../blog/posts'));
  console.log(`Built static blog: ${count} published posts.`);
}
module.exports = {buildBlog, loadPosts};
