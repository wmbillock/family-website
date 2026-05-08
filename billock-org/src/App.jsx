import { Component, default as React } from 'react';

import { Route, Routes } from 'react-router-dom';
import {BrowserRouter as Router} from 'react-router-dom';

import Home from './components/Home'
import Willow from './components/people/Willow'
import Kiley from './components/people/Kiley'
import Luella from './components/people/Luella'
import Connor from './components/people/Connor'
import FamilyNavBar from './components/FamilyNavBar';
import './stylesheets/main.sass'
export default class App extends Component {
  
  render() {
  
    return (
      <div id="outer-container">
      <Router>
        <div className="App-container">
          <div id="main">
            <FamilyNavBar />
            <div id="pagecontent" className='content-frame'>
              <Routes>
                <Route exact path='/' element={<Home />} />
                <Route path='/willow' element={<Willow />} />
                <Route path='/kiley' element={<Kiley />} />
                <Route path='/luella' element={<Luella />} />
                <Route path='/connor' element={<Connor />} />
              </Routes>
            </div>
          </div>
        
        </div>
        
        <footer id="footer" className='footer'>
          <span className="copyright">&copy; 2019 - {new Date().getFullYear()} Sparrow Court Consulting</span>
        </footer>
      </Router>
      </div>
    )
  }
}
