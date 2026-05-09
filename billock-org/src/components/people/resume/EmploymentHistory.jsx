import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'
import { employment } from './data'

export default class EmploymentHistory extends Component {
  getData() {
    return employment
  }
  render() {
    var employment_list = this.getData().map( (item) =>
      <div key={uuidv4()} className='resume-entry'>
        <div>
          <span className="datespan">{item['start-date']}-{item['end-date'] === undefined ? 'Present' : item['end-date']}</span>
          &nbsp;----&nbsp;
          <span className="title">{item['title']}</span>
          &nbsp;----&nbsp;
          <span className="company-location">{item['company']}, {item['location']}</span>
          &nbsp;&nbsp;&nbsp;&nbsp;
        </div>
        <div>
          <ul>
            {item['responsibilities'].map((sub_item) => <li key={uuidv4()}>{sub_item}</li>)}
          </ul>
        </div>
      </div>
    );
    return (
      <div>
        <h2>Employment</h2>
        <div>
          {employment_list}
        </div>
      </div>
    )
  }
}
