import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'

export default class Skills extends Component {
  getData() {
    return [
      {
        'skill':'Ruby development',
        'level':'Advanced'
      },
      {
        'skill':'Python development',
        'level':'Advanced'
      },
      {
        'skill':'JavaScript development',
        'level':'Intermediate'
      },
      {
        'skill':'React development',
        'level':'Intermediate'
      },
      {
        'skill':'C++ development',
        'level':'Advanced'
      },
      {
        'skill':'Agile methodologies',
        'level':'Advanced'
      },
      {
        'skill':'Software architecture and design',
        'level':'Advanced'
      },
      {
        'skill': 'Engineering management and leadership',
        'level': 'Intermediate'
      }
    ]
  }
  render() {
    var skills_list = this.getData().map((item => 
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
