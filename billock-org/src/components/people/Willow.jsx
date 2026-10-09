import React from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import PersonalInfo from './PersonalInfo'
import HobbyInfo from './HobbyInfo'
import Resume from './resume'
import Blog from './Blog'
import Activity from './Activity'
import '../../stylesheets/willow.sass'
export default function Willow() {
  const location = useLocation()
  const navigate = useNavigate()
  const requestedTab = location.hash.slice(1)
  const activeTab = ['blog', 'personal', 'music', 'resume', 'activity'].includes(requestedTab) ? requestedTab : 'blog'
  return <div className='willow-bg'><div className="main-content"><div>
    <h1>Willow</h1>
    <Tabs activeKey={activeTab} onSelect={key => navigate({ pathname: location.pathname, hash: key === 'blog' ? '' : `#${key}` })} id="willow-page-tabs" className='mb-3' mountOnEnter>
      <Tab eventKey='blog' title='Blog'><Blog /></Tab>
      <Tab eventKey='activity' title='Activity ✨'><Activity active={activeTab === 'activity'} /></Tab>
      <Tab eventKey='personal' title='Personal info'><PersonalInfo /></Tab>
      <Tab eventKey='music' title='Music'><HobbyInfo /></Tab>
      <Tab eventKey='resume' title='Resume'><Resume /></Tab>
    </Tabs>
  </div></div></div>
}
