import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'
import { skills } from './data'

export default class Skills extends Component {
  render() {
    var skills_list = skills.map((item =>
      <div key={uuidv4()}>
        <li >
          {item['skill']} - {item['level']}
        </li>
      </div>
    ))
    return (
      <div>
        <h2>Skills</h2>
        <div >
          <ul>
          {skills_list}
          </ul>
        </div>
      </div>
    )
  }
}
