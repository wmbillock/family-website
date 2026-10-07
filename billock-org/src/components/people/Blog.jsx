import React, { useEffect, useState } from 'react'
export default function Blog() {
  const [posts, setPosts] = useState(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/blog/posts.json', { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error('Could not load posts'); return response.json() })
      .then(setPosts).catch(error => { if (error.name !== 'AbortError') setFailed(true) })
    return () => controller.abort()
  }, [])
  return <section className="willow-blog" aria-labelledby="blog-heading">
    <h2 id="blog-heading">Technically Writing</h2>
    <p><a href="/blog/feed.xml">RSS</a> · <a href="/blog/">Blog archive</a></p>
    {failed ? <p>Posts could not be loaded. <a href="/blog/">Open the blog archive.</a></p> : posts === null ? <p role="status">Loading posts…</p> : posts.length === 0 ? <p>No posts published yet.</p> :
      <ol>{posts.map(post => <li key={post.slug}><h3><a href={`/blog/${post.slug}/`}>{post.title}</a></h3><time dateTime={post.date}>{post.date}</time><p>{post.summary}</p></li>)}</ol>}
  </section>
}
