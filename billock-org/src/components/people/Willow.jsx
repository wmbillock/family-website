import React, { Component } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import PersonalInfo from './PersonalInfo'
import HobbyInfo from './HobbyInfo'
import Resume from './resume'
import '../../stylesheets/willow.sass'

export default class Willow extends Component {

  render() {
    return (
      <div className='willow-bg'>
        <div className="main-content">
          <div>
            <h1>Willow</h1>
            <Tabs defaultActiveKey="resume" id="willow-page-tabs" className='mb-3'>
              <Tab eventKey='personal' title='Personal info'>
                <PersonalInfo />
              </Tab>
              <Tab eventKey='music' title='Music'>
                <HobbyInfo />
              </Tab>
              <Tab eventKey='resume' title='Resume'>
                <Resume />
              </Tab>
            </Tabs>
            
          </div>
        </div>
      </div>
    )
  }
}
