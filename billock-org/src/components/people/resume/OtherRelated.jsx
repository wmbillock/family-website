import React from 'react'
import { otherRelated } from './data'

const groups = [
  { title: 'Music, volunteering & performing', items: otherRelated.slice(0, 4) },
  { title: 'Teaching & curriculum development', items: otherRelated.slice(4, 7) },
  { title: 'Recognition', items: otherRelated.slice(7) },
]

export default function OtherRelated() {
  return <>{groups.map(group => <section key={group.title}>
    <h2>{group.title}</h2>
    {group.items.map(item => <article className='resume-entry' key={item.data}>
      <h3>{item.data}</h3>
      {item.children.length > 0 && <ul>{item.children.map(child => <li key={child}>{child}</li>)}</ul>}
    </article>)}
  </section>)}</>
}
