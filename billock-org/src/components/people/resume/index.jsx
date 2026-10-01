import React, { useState } from 'react'
import { objective } from './data'
import { shortEmployment, earlierEmployment, careerHighlights, achievements, projects, writingAndSpeaking } from './portfolio'
import EmploymentHistory from './EmploymentHistory'
import Education from './Education'
import OtherRelated from './OtherRelated'
import buildPdf from './buildPdf'
import '../../../stylesheets/resume.sass'

export default function Resume() {
  const [view, setView] = useState(() => new URLSearchParams(window.location.search).get('career') === 'full' ? 'full' : 'short')
  const full = view === 'full'
  return (
    <div className='resume'>
      <div className='career-controls' aria-label='Resume views'>
        <button type='button' aria-pressed={!full} onClick={() => setView('short')}>Short resume</button>
        <button type='button' aria-pressed={full} onClick={() => setView('full')}>Full career & achievements</button>
        <button type='button' onClick={() => buildPdf({ full }).save(`willow-billock-${full ? 'career-portfolio' : 'resume'}.pdf`)}>Export {full ? 'full career' : 'short resume'} PDF</button>
      </div>
      <div id='resume-content'>
        <h1>WILLOW BILLOCK</h1>
        <p className='career-intro'>{full ? 'Career portfolio · 2004–present' : 'Staff / Principal engineering · Distributed systems & applied AI'}</p>
        {full && <p><a href='/willow?career=full'>Permanent link to full career</a></p>}
        <section aria-labelledby='resume-objective'>
          <h2 id='resume-objective'>Objective</h2><p>{objective}</p>
        </section>
        {full ? <>
          <section>
            <h2>Achievement stories</h2>
            <p>The scope, my contribution, and the result behind selected career highlights. Employer metrics below come from my career accounts; public project links provide additional implementation context.</p>
            <div className='achievement-list'>{achievements.map(item => <details key={item.id} id={`achievement-${item.id}`}>
              <summary>{item.title}<span>{item.organization}</span></summary>
              <dl><dt>My contribution</dt><dd>{item.contribution}</dd><dt>Approach</dt><dd>{item.approach}</dd><dt>Result</dt><dd>{item.result}</dd><dt>Context</dt><dd>{item.context}</dd></dl>
            </details>)}</div>
          </section>
          <EmploymentHistory heading='Full employment history' />
          <section><h2>Independent projects</h2>{projects.map(project => <article className='resume-entry' key={project.name}><h3><a href={project.url}>{project.name}</a></h3><p>{project.description}</p></article>)}</section>
          <section><h2>Writing, speaking & developer education</h2><ul>{writingAndSpeaking.map(item => <li key={item}>{item}</li>)}</ul></section>
          <Education /><OtherRelated />
        </> : <>
          <EmploymentHistory jobs={shortEmployment} heading='Recent experience' />
          <section><h2>Selected career highlights</h2><ul>{careerHighlights.map(item => <li key={item}>{item}</li>)}</ul></section>
          <EmploymentHistory jobs={earlierEmployment} compact heading='Earlier experience' />
          <Education />
          <p><button type='button' onClick={() => setView('full')}>Explore achievement stories, projects, teaching, and music leadership</button></p>
        </>}
      </div>
    </div>
  )
}
