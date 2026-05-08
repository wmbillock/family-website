import React, { Component } from 'react'
import Skills from './Skills'
import EmploymentHistory from './EmploymentHistory'
import Education from './Education'
import OtherRelated from './OtherRelated'
import '../../../stylesheets/resume.sass'
import jsPDF from 'jspdf'

export default class Resume extends Component {
  generatePDF() {
    var report = new jsPDF('p', 'pt', 'letter')
    var source = window.document.getElementById("resume-content")
    report.html(source, {
      callback: function (doc) {
        var iframe = document.createElement('iframe')
        iframe.setAttribute('style', 'position:absolute;right:0; top:0; bottom:0; height:100%; width:500px')
        document.body.appendChild(iframe)
        iframe.src = doc.output('datauristring')
      },
      x: 10,
      y: 10,
      width: 170,
      margin: 40,
      autoPaging: 'text',
      filename: 'willow-billock-generated-resume.pdf'
   });
  }
  render() {
    return (
      <div className='resume'>
        <button onClick={this.generatePDF} type='button'>Export PDF</button>
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
