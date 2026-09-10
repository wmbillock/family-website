import React, { Component } from 'react'
import '../../stylesheets/willow-party.sass'

const schedule = [
  {
    time: '2:00 PM',
    title: 'Come on over',
    text: 'Show up, mingle, grab a drink, have a blast.'
  },
  {
    time: '2:30 PM',
    title: 'Lakeside memorial',
    text: 'Bring something to burn in effigy, or a memory to sacrifice to the flames in honor of others.. We honor the passing of my dead name, while also celebrating the path forward.'
  },
  {
    time: '3:00 PM',
    title: 'Local Legends',
    text: 'Local Legends making a special guest appearance. Wanna join in? Hit me up beforehand!'
  },
  {
    time: 'After the set',
    title: 'Open jam and housewarming',
    text: 'Once the concert is done, the music\'s just getting started. Join us to jam out to some backing tracks on the lake, hang out around the house, enjoy food, and socialize'
  },
  {
    time: 'After dark',
    title: 'Still hanging out',
    text: 'Darkness is no obstacle! The party goes until the party is finished, be that 3 PM or 3 AM. Let\'s shoot for the latter :)'
  }
]

export default class WillowParty extends Component {
  render() {
    return (
      <div className='willow-party-bg'>
        <main className='willow-party-page'>
          <section className='willow-hero'>
            <p className='event-kicker'>Willow's birthday party, and the Billock's Housewarming</p>
            <h1>Lakeside Legends</h1>
            <div className='hero-meta'>
              <span>Saturday, September 26</span>
              <span>2 PM until whenever</span>
              <span><a href="https://maps.app.goo.gl/ZK7atePmnkUaAoS38">34386 N Lakeside Drive, Grayslake, IL 60030 (use this pin)</a></span>
            </div>
            <br />
            <p>We'll be giving a proper sendoff to the me that was, and play some music to welcome the life going forward. Plus fire and food and lake!</p>
            <p>Use <a href="https://maps.app.goo.gl/ZK7atePmnkUaAoS38">THIS PIN</a> for GPS directions!</p>
          </section>

          <section className='party-callouts' aria-label='What to bring'>
            <div>
              <strong>Burning rage and catharsis</strong>
              <p>A memory of who I used to be, or something anti-trans to burn in angry effigy. Suggestions: MAGA hat, harry potter book, anything where watching it burn will feel satisfying.</p>
            </div>
            <div>
              <strong>A way to make noise</strong>
              <p>We'll all provide the music today. I'll have horns on hand, but bring your axe and let's jam!</p>
            </div>
            <div>
              <strong>No presents. just *presence*.</strong>
              <p>If there's something specific you absolutely must have, bring it with! But we neither want nor need much. In lieu of gifts, please make a donation to the LGBTQ Center of Lake County at https://lgbtqlc.com/</p>
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
              Nothing explosive, and probably nothing that's too toxic when it burns. Probably rules out most trump shit, but we'll burn that shit anyway just for fun.
            </p>
          </section>
        </main>
      </div>
    )
  }
}
