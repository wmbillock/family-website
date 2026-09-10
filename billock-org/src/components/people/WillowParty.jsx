import React, { Component } from 'react'
import '../../stylesheets/willow-party.sass'

const schedule = [
  {
    time: '2:00 PM',
    title: 'Arrive, eat, drink, exist loudly',
    text: 'Come over any time after 2. Food, drinks, housewarming wandering, and birthday-adjacent hanging out begin immediately.'
  },
  {
    time: '2:30 PM',
    title: 'Viking funeral for the dead self',
    text: 'Bring either a memory of Matt or something anti-trans to burn in angry effigy. We will send the dead name, old expectations, and general anti-trans bullshit where they belong.'
  },
  {
    time: '3:30 PM',
    title: 'Local Legends',
    text: 'Local Legends plays an open-ended acoustic set, closing with Take the Time and leaving the solo section open for whoever wants in.'
  },
  {
    time: 'After the set',
    title: 'Backing tracks and open jam',
    text: 'Bring an instrument if you want to play. Horn players are especially encouraged, and charts for ZKLUPP may be available.'
  },
  {
    time: 'After dark',
    title: 'Lower the volume, keep the party',
    text: 'When it gets dark, amplified chaos gives way to quieter hanging out so we maintain peaceful relations with the noise ordinance.'
  }
]

export default class WillowParty extends Component {
  render() {
    return (
      <div className='willow-party-bg'>
        <main className='willow-party-page'>
          <section className='willow-hero'>
            <p className='event-kicker'>Willow's birthday, deadname funeral, housewarming, and joyful noise department</p>
            <h1>A Wake, A Warming, and a Wall of Sound</h1>
            <div className='hero-meta'>
              <span>Saturday, September 26</span>
              <span>2 PM until whenever</span>
              <span>Lake-side fire, food, music, and friends</span>
            </div>
          </section>

          <section className='party-callouts' aria-label='What to bring'>
            <div>
              <strong>Bring something to burn</strong>
              <p>A memory of Matt, or something anti-trans you would enjoy seeing reduced to ash.</p>
            </div>
            <div>
              <strong>Bring an instrument if you want</strong>
              <p>Horns are especially encouraged. Other reasonable forms of musical noise are welcome.</p>
            </div>
            <div>
              <strong>No presents. No dishes.</strong>
              <p>Just presence. Food and drinks are provided; bring any specific personal preferences for yourself.</p>
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
            <h2>Fire rules, because chemistry is real</h2>
            <p>
              Please keep burnables to paper, cardboard, untreated wood, or similarly fire-safe material.
              No plastics, electronics, treated wood, synthetic fabric, painted objects, batteries, aerosols,
              or mystery substances.
            </p>
          </section>
        </main>
      </div>
    )
  }
}
