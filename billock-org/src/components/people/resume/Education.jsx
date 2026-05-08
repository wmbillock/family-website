import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'
import { education } from './data'

export default class Education extends Component {
  render() {
    var education_list = education.map( (item) =>
      <div key={uuidv4()} className='resume-entry'>
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
