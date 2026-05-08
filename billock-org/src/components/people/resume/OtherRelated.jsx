import React, { Component } from 'react'
import {v4 as uuidv4} from 'uuid'
import { otherRelated } from './data'

export default class OtherRelated extends Component {
  render() {
    const item_list = otherRelated.map((item) =>
      <div key={uuidv4()} className='resume-entry'>
        <span className='company-location'>{item['data']}</span>
        <ul>
          {item['children'].map((child) => <li key={uuidv4()}>{child}</li>)}
        </ul>
      </div>
    )
    return (
      <div>
        <h2>Other organizations and employment</h2>
          {item_list}
      </div>
    )
  }
}
