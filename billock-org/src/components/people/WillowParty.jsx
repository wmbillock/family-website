import React, { Component } from 'react'
import '../../stylesheets/willow-party.sass'

const schedule = [
  {
    time: '2:00 PM',
    title: 'Come on over',
    text: 'We start at 2. Come eat, get a drink, and see the house.'
  },
  {
    time: '2:30 PM',
    title: 'Viking funeral for the dead me',
    text: 'Bring a memory of who I used to be, or something anti-trans to burn in angry effigy. We will gather at the fire pit by the lake and burn some shit.'
  },
  {
    time: '3:30 PM',
    title: 'Local Legends',
    text: 'Local Legends plays an open-ended acoustic set. We will put Take the Time at the end and leave the solo section open for a bit, so jump in if you want.'
  },
  {
    time: 'After the set',
    title: 'Backing tracks and open jam',
    text: 'Then we switch to backing tracks and anyone with a horn. Bring an instrument if you want to jam along, horns especially. I wrote out parts for ZKLUPP, so we may pass those out too.'
  },
  {
    time: 'After dark',
    title: 'Still hanging out',
    text: 'When it gets dark we will turn down the amplified stuff and transition away from noise ordinance violations. The party runs until whenever.'
  }
]

export default class WillowParty extends Component {
  render() {
    return (
      <div className='willow-party-bg'>
        <main className='willow-party-page'>
          <section className='willow-hero'>
            <p className='event-kicker'>A birthday, a funeral, a housewarming, and a general party</p>
            <h1>Willow's birthday party</h1>
            <div className='hero-meta'>
              <span>Saturday, September 26</span>
              <span>2 PM until whenever</span>
            </div>
            <p>My birthday is September 22. September 11 marks two years on HRT, and this is my first full year as myself. So we are celebrating all of that, plus the house, with a fire and a lot of music.</p>
          </section>

          <section className='party-callouts' aria-label='What to bring'>
            <div>
              <strong>Bring something to burn</strong>
              <p>A memory of who I used to be, or something anti-trans to burn in angry effigy.</p>
            </div>
            <div>
              <strong>Bring an instrument if you want</strong>
              <p>Horns especially, but bring whatever you play. I want a celebration of joy through music.</p>
            </div>
            <div>
              <strong>No presents. No dishes.</strong>
              <p>Just presence. We will supply food and drinks. If you want something specific, bring it.</p>
            </div>
          </section>

          <section className='party-section'>
            <h2>The plan</h2>
            <div className='schedule-list'>
              {schedule.map((item) => (
                <article className='schedule-item' key={item.time}>
                  <div className='schedule-time'>{item.time}</div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className='party-section burn-guidance'>
            <h2>What can go in the fire</h2>
            <p>
              Keep it to plain paper, uncoated cardboard, or clean untreated wood.
              No plastics, electronics, treated wood, synthetic fabric, painted objects, batteries, aerosols,
              or anything coated. A note on plain paper is fine.
            </p>
          </section>
        </main>
      </div>
    )
  }
}
