import React, { Component } from 'react'
import {
  Link
} from 'react-router-dom'
import { push as Menu } from 'react-burger-menu'

const MOBILE_WIDTH = 120
const DESKTOP_WIDTH = 200
const MOBILE_QUERY = '(max-width: 768px)'

const initialMenuWidth = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return DESKTOP_WIDTH
  return window.matchMedia(MOBILE_QUERY).matches ? MOBILE_WIDTH : DESKTOP_WIDTH
}

export default class FamilyNavBar extends Component {
  state = { menuWidth: initialMenuWidth() }

  componentDidMount() {
    if (typeof window === 'undefined' || !window.matchMedia) return
    this.mq = window.matchMedia(MOBILE_QUERY)
    this.onMQChange = (e) => {
      this.setState({ menuWidth: e.matches ? MOBILE_WIDTH : DESKTOP_WIDTH })
    }
    this.mq.addEventListener('change', this.onMQChange)
  }

  componentWillUnmount() {
    if (this.mq) this.mq.removeEventListener('change', this.onMQChange)
    if (typeof document !== 'undefined') document.body.classList.remove('menu-open')
  }

  handleStateChange = ({ isOpen }) => {
    if (typeof document === 'undefined') return
    document.body.classList.toggle('menu-open', isOpen)
    document.body.style.setProperty('--menu-width', `${this.state.menuWidth}px`)
  }

  render() {
    return (
    <div className='menu-frame'>
        <Menu
          pageWrapId={"pagecontent"}
          burgerButtonClassName={'burger-style'}
          width={this.state.menuWidth}
          onStateChange={this.handleStateChange}
        >
            <Link id="home" className="menu-item" to="/"><img className='circleimagerot' src={require('../images/tenor-horn.jpg')} alt="Home" /></Link>
            <Link to="/willow" className="menu-item"><img className="circleimage" src={require("../images/willow.jpg")} alt="Willow" /></Link>
            <Link to="/kiley" className="menu-item"><img className="circleimagerot" src={require("../images/kiley.jpg")} alt="Kiley" /></Link>
            <Link to="/luella" className="menu-item"><img className="circleimage" src={require("../images/luella.jpg")} alt="Luella" /></Link>
            <Link to="/connor" className="menu-item"><img className="circleimage" src={require("../images/connor.jpg")} alt="Connor" /></Link>
        </Menu>
    </div>
    )
  }
}
