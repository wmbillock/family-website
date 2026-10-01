import React from 'react'
import { employment } from './data'

export default function EmploymentHistory({ jobs = employment, compact = false, heading = 'Employment' }) {
  return (
    <section>
      <h2>{heading}</h2>
      {jobs.map(job => (
        <article className={`resume-entry${compact ? ' resume-entry-compact' : ''}`} key={`${job.company}-${job['start-date']}`}>
          <h3>{job.title} <span>· {job.company}</span></h3>
          <p className='career-meta'>{job['start-date']}–{job['end-date'] || 'Present'} · {job.location}</p>
          {!compact && job.responsibilities.length > 0 && <ul>{job.responsibilities.map(item => <li key={item}>{item}</li>)}</ul>}
        </article>
      ))}
    </section>
  )
}
