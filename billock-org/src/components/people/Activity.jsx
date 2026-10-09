import React, { useEffect, useState } from 'react'
import contract from '../../activity/contract.js'
export default function Activity({ active = true }) {
  const [feed, setFeed] = useState(null)
  const [failed, setFailed] = useState(false)
  const [clock, setClock] = useState(Date.now())
  useEffect(() => {
    if (!active) return undefined
    let disposed = false
    let controller
    let busy = false
    let timeout
    async function refresh() {
      if (document.hidden || busy) return
      busy = true
      controller = new AbortController()
      timeout = setTimeout(() => controller.abort(), 10000)
      try {
        const response = await fetch('/activity/feed.json', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw Error('Unavailable')
        if (Number(response.headers.get('content-length')) > 131072) throw Error('Oversized')
        const text = await response.text()
        if (text.length > 131072) throw Error('Oversized')
        const data = contract.validateFeed(JSON.parse(text))
        if (!disposed) { setFeed(data); setFailed(false); setClock(Date.now()) }
      } catch (_) { if (!disposed) { setFailed(true); setClock(Date.now()) } }
      finally { clearTimeout(timeout); busy = false }
    }
    refresh()
    const interval = setInterval(() => { setClock(Date.now()); refresh() }, 60000)
    document.addEventListener('visibilitychange', refresh)
    return () => { disposed = true; clearInterval(interval); clearTimeout(timeout); if (controller) controller.abort(); document.removeEventListener('visibilitychange', refresh) }
  }, [active])
  const stale = feed && (!feed.lastSuccessAt || clock - Date.parse(feed.lastSuccessAt) > 15 * 60000)
  const health = failed ? 'disconnected' : !feed ? 'loading' : feed.health === 'offline' ? 'offline' : feed.health === 'stale' || stale ? 'stale' : 'connected'
  return <section className="willow-activity" aria-labelledby="activity-heading">
    <h2 id="activity-heading">Agent activity ✨</h2>
    <p>Little updates from the workbench. Only verified, public-safe project actions appear here.</p>
    <p role="status">{health === 'loading' ? 'Loading activity…' : health === 'connected' ? '🟢 Source connected' : health === 'stale' ? '🟡 Updates are stale' : '⚪ Activity source is offline'}</p>
    {feed && feed.lastSuccessAt ? <p>Last successful source check: <time dateTime={feed.lastSuccessAt}>{new Date(feed.lastSuccessAt).toLocaleString()}</time></p> : <p>No successful source check yet.</p>}
    {feed && feed.generatedAt && <p>Feed generated: <time dateTime={feed.generatedAt}>{new Date(feed.generatedAt).toLocaleString()}</time></p>}
    {failed && <p>We couldn’t refresh activity. Earlier updates, if shown, are historical.</p>}
    {!feed || feed.events.length === 0 ? <p>No verified public updates to show yet.</p> : <ol>{feed.events.filter(e => clock - Date.parse(e.occurredAt) <= 30 * 86400000).map(e => <li key={e.eventId}>
      <p>{e.summary}</p><time dateTime={e.occurredAt}>{new Date(e.occurredAt).toLocaleString()}</time>
      <p className="activity-evidence">Evidence: {e.verification} · verified source receipt</p>
    </li>)}</ol>}
    <p className="activity-evidence">Checks every minute while this tab is visible. Source publication is separate; this view never invents activity or reactions.</p>
  </section>
}
