import React, { Component } from 'react'
import Skills from './Skills'
import EmploymentHistory from './EmploymentHistory'
import Education from './Education'
import OtherRelated from './OtherRelated'
import '../../../stylesheets/resume.sass'

export default class Resume extends Component {
  generatePDF = () => {
    const originalTitle = document.title
    document.title = 'willow-billock-resume'
    const restore = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
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
