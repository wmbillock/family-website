import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'


export default class Education extends Component {
  getData() {
    return ([
      {
        'school': 'DePaul University',
        'degree': 'Master of Science',
        'major': 'Computer Graphics and Animation (developer concentration)',
        'graduationDate': '06/2007',
        'city': 'Chicago, IL',
        'notes': 'Graduated with distinction. Member of Upsilon Pi Epsilon Computer Science Honor Society'
      },
      {
        'school': 'Iowa State University',
        'degree': 'Bachelor of Science',
        'major': 'Computer Science',
        'graduationDate': '12/2003',
        'city': 'Ames, IA',
        'notes': 'Minor in Philosophy. Member of the ISUCF"V"MB, Leader of the Hockey Pep Band, Member of the ISU Karate Club, Member of the ISU Game Development Club, Member of Tau Beta Sigma'
      }
    ]);
  }
  render() {
    var education_list = this.getData().map( (item) => 
      <div key={uuidv4()}>
        <div>
          <span className="degree">
            {item['degree']}
          </span> - <span className="major">
            {item['major']}
          </span>
        </div>

        <div>
          <ul>
          <li><div><span className='school'>{item['school']}</span>, <span className='city'>{item['city']}</span></div></li>
          <li><div><span className='notes'>{item['notes']}</span></div></li>
          </ul>
        </div>
      </div>
    );
    return (
      <div>
        <h2>Education</h2>
        { education_list }
      </div>
    )
  }
}
