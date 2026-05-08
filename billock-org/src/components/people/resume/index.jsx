import React, { Component } from 'react'
import Skills from './Skills'
import EmploymentHistory from './EmploymentHistory'
import Education from './Education'
import OtherRelated from './OtherRelated'
import '../../../stylesheets/resume.sass'

export default class Resume extends Component {
  generatePDF = () => {
    const resume = document.getElementById('resume-content')
    if (!resume) return

    const w = window.open('', '_blank', 'width=900,height=1100')
    if (!w) {
      alert('Please allow popups for this site to export the resume as PDF.')
      return
    }

    w.document.write(`<!DOCTYPE html>
<html>
<head>
<title>willow-billock-resume</title>
<style>
@page { size: letter; margin: 0.5in; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  color: #000;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.35;
}
h1 { font-size: 18pt; text-align: center; margin: 0 0 0.4em; }
h2 { font-size: 13pt; margin: 0.6em 0 0.25em; border-bottom: 0.5pt solid #000; padding-bottom: 0.1em; page-break-after: avoid; }
ul { margin: 0 0 0.4em; padding-left: 1.2em; }
li { margin: 0.05em 0; page-break-inside: avoid; }
.resume-entry { page-break-inside: avoid; }
.degree, .major, .title { font-weight: bold; font-style: italic; }
.school, .datespan, .company-location { font-weight: bold; }
</style>
</head>
<body>${resume.outerHTML}</body>
</html>`)
    w.document.close()

    const printAndClose = () => {
      try {
        w.focus()
        w.print()
      } finally {
        w.close()
      }
    }

    if (w.document.readyState === 'complete') {
      printAndClose()
    } else {
      w.onload = printAndClose
      setTimeout(() => { if (!w.closed) printAndClose() }, 800)
    }
  }
  render() {
    return (
      <div className='resume'>
        <button onClick={this.generatePDF} type='button' className='resume-print-btn'>Export PDF</button>
        <div id="resume-content">
          <h1>WILLOW BILLOCK</h1>
          <Skills />
          <EmploymentHistory />
          <Education />
          <OtherRelated />
        </div>
      </div>
    )
  }
}
