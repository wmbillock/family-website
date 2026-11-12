import React, { useEffect, useState } from 'react'
import contract from '../../activity/contract.js'
// The feed is posted once a day, so the page asks for it rarely: when the tab
// opens, every half hour while it stays visible, and when you come back to it.
const REFRESH_MS = 30 * 60000
const RETURN_MS = 5 * 60000
const RECENT_DAYS = 3
function dayLabel(value) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}
function byDay(chatter) {
  const days = []
  for (const c of chatter) {
    if (!days.length || days[days.length - 1].day !== c.day) days.push({ day: c.day, used: new Set(), posts: [] })
    const group = days[days.length - 1]
    group.posts.push({ ...c, text: contract.say(c, group.used) })
  }
  return days
}
function Day({ group }) {
  return <div className="activity-day">
    <h3><time dateTime={group.day}>{dayLabel(group.day)}</time></h3>
    <ol className="activity-chat">{group.posts.map(p => <li key={p.who + p.topic} className={'activity-msg activity-who-' + p.who}>
      <span className="activity-avatar" aria-hidden="true">{contract.CAST[p.who].name[0]}</span>
      <div className="activity-bubble">
        <p className="activity-name">{contract.CAST[p.who].name} <span>{contract.CAST[p.who].role}</span></p>
        <p>{p.text}</p>
      </div>
    </li>)}</ol>
  </div>
}
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
    let asked = 0
    async function refresh() {
      if (document.hidden || busy) return
      busy = true
      asked = Date.now()
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
    function returned() { if (Date.now() - asked >= RETURN_MS) refresh() }
    refresh()
    const interval = setInterval(() => { setClock(Date.now()); refresh() }, REFRESH_MS)
    document.addEventListener('visibilitychange', returned)
    return () => { disposed = true; clearInterval(interval); clearTimeout(timeout); if (controller) controller.abort(); document.removeEventListener('visibilitychange', returned) }
  }, [active])
  // The exporter republishes on change or once a day, so a check is only old after 26 hours.
  const stale = feed && (!feed.lastSuccessAt || clock - Date.parse(feed.lastSuccessAt) > 26 * 3600000)
  const health = failed ? 'disconnected' : !feed ? 'loading' : feed.health === 'offline' ? 'offline' : feed.health === 'stale' || stale ? 'stale' : 'connected'
  const days = feed && feed.chatter ? byDay(feed.chatter) : []
  const events = feed ? feed.events.filter(e => clock - Date.parse(e.occurredAt) <= 30 * 86400000) : []
  return <section className="willow-activity" aria-labelledby="activity-heading">
    <h2 id="activity-heading">Backstage chatter ✨</h2>
    <p className="activity-lede">what my agents got up to, in their own words. the numbers are real. the attitude is scripted. 🦉</p>
    <p role="status" className={'activity-status activity-' + health}>{health === 'loading' ? 'checking the wires… 🧵' : health === 'connected' ? '🟢 live from backstage. new posts land once a day.' : health === 'stale' ? '🟡 last check got sleepy. these updates are old.' : '⚪ source offline. no lore invented.'}{feed && feed.lastSuccessAt && <> <span className="activity-checked">checked <time dateTime={feed.lastSuccessAt}>{new Date(feed.lastSuccessAt).toLocaleString()}</time></span></>}</p>
    {failed && <p className="activity-evidence">refresh didn’t land. old receipts stay old. 💤</p>}
    {days.length === 0 && events.length === 0 && <p>no verified updates yet. peaceful scrollback, honestly.</p>}
    {days.slice(0, RECENT_DAYS).map(group => <Day key={group.day} group={group} />)}
    {days.length > RECENT_DAYS && <details className="activity-older"><summary>older scrollback ({days.length - RECENT_DAYS} more days)</summary>{days.slice(RECENT_DAYS).map(group => <Day key={group.day} group={group} />)}</details>}
    {events.length > 0 && <details className="activity-receipts"><summary>receipts ({events.length})</summary><ol>{events.map(e => <li key={e.eventId}>
      <p>{e.summary}</p>
      <p className="activity-evidence"><time dateTime={e.occurredAt}>{new Date(e.occurredAt).toLocaleString()}</time> · receipt: {e.verification} · source: {contract.AGENTS[e.agent].toLowerCase()}</p>
    </li>)}</ol></details>}
    <p className="activity-evidence">read-only. counts come from the day's logs; every line is from a fixed script, so no model was paid to be funny here.</p>
  </section>
}
