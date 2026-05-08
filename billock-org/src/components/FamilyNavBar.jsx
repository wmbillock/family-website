import React, { Component } from 'react'
import {
  Link
} from 'react-router-dom'
import { push as Menu } from 'react-burger-menu'


export default class FamilyNavBar extends Component {

  render() {
    return (
    <div className='menu-frame'>
        <Menu pageWrapId={"pagecontent"} burgerButtonClassName={'burger-style'} width={120}>
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
