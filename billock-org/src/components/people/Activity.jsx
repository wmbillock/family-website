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
        const response = await fetch('/activity/feed.json', { method: 'GET', mode: 'same-origin', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw Error('Unavailable')
        if (Number(response.headers.get('content-length')) > 131072) throw Error('Oversized')
        let text
        if (response.body && response.body.getReader) {
          const reader = response.body.getReader()
          const chunks = []
          let size = 0
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            size += value.byteLength
            if (size > 131072) { await reader.cancel(); throw Error('Oversized') }
            chunks.push(value)
          }
          const bytes = new Uint8Array(size)
          let offset = 0
          for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
          text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
        } else {
          text = await response.text()
          // Conservative fallback when streams/byte decoding are unavailable.
          if (text.length > 32768) throw Error('Oversized')
        }
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
    <p>tiny dispatches from the code cave. verified crumbs only. 🦉</p>
    <p role="status">{health === 'loading' ? 'checking the wires… 🧵' : health === 'connected' ? '🟢 source check landed. the green is load-bearing.' : health === 'stale' ? '🟡 last check got sleepy. these updates are old.' : '⚪ source offline. no lore invented.'}</p>
    {feed && feed.lastSuccessAt ? <p>Last successful source check: <time dateTime={feed.lastSuccessAt}>{new Date(feed.lastSuccessAt).toLocaleString()}</time></p> : <p>no successful source check yet.</p>}
    {feed && feed.generatedAt && <p>Feed generated: <time dateTime={feed.generatedAt}>{new Date(feed.generatedAt).toLocaleString()}</time></p>}
    {failed && <p>refresh didn’t land. old receipts stay old. 💤</p>}
    {!feed || feed.events.length === 0 ? <p>no verified updates yet. peaceful scrollback, honestly.</p> : <ol>{feed.events.filter(e => clock - Date.parse(e.occurredAt) <= 30 * 86400000).map(e => <li key={e.eventId}>
      <p>{e.summary}</p><time dateTime={e.occurredAt}>{new Date(e.occurredAt).toLocaleString()}</time>
      <p className="activity-evidence">receipt: {e.verification} · source: {contract.AGENTS[e.agent].toLowerCase()}</p>
    </li>)}</ol>}
    <p className="activity-evidence">read-only scrollback · refreshes every minute while visible.</p>
  </section>
}
