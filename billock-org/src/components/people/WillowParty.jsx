import React, { Component } from 'react'
import '../../stylesheets/willow-party.sass'

const schedule = [
  {
    time: '2:00 PM',
    title: 'Come on over',
    text: 'Show up, mingle, grab a drink, see the house, and settle in by the lake.'
  },
  {
    time: '2:15 PM',
    title: 'The fire starts',
    text: 'If you want to take part in the ceremony, bring a small combustible offering to the universe in pursuit of understanding and peace: a memory of Matt, an old expectation, or something representing anti-trans hatred you would enjoy seeing become ash. Participation is completely optional.'
  },
  {
    time: '2:45 PM',
    title: 'Lakeside memorial',
    text: 'I will say a few words by the fire, we will sacrifice our offerings, and then I will play Broken Pieces from the deck. Five years ago this piece spoke to me before I fully understood why. Today its shape — melody, variation, evolution, return, and question — feels like the right way to mark a life rebuilt while still remaining my own.'
  },
  {
    time: '3:30-ish',
    title: 'Local Legends: the housewarming begins',
    text: 'Local Legends makes a special guest appearance and kicks off the real housewarming. We open with Speed of Blight as I shed the wrap and cape and reveal the light. From there: party. Wanna join in? Hit me up beforehand!'
  },
  {
    time: 'End of the set',
    title: 'Take the Time → open jam',
    text: 'We will put Take the Time at the end and leave the solo section open for a while. After that we switch to backing tracks and anyone with an instrument can jump in. Horns especially. I also have parts written out for ZKLUPP, so those may make an appearance.'
  },
  {
    time: 'After dark',
    title: 'Still hanging out, just quieter',
    text: 'When it gets dark we will turn down the amplified stuff and transition away from noise ordinance violations. The party itself runs until whenever.'
  }
]

export default class WillowParty extends Component {
  render() {
    return (
      <div className='willow-party-bg'>
        <main className='willow-party-page'>
          <section className='willow-hero'>
            <p className='event-kicker'>Willow's birthday party, and the Billocks' housewarming</p>
            <h1>Lakeside Legends</h1>
            <div className='hero-meta'>
              <span>Saturday, September 26</span>
              <span>2 PM until whenever</span>
              <span><a href="https://maps.app.goo.gl/ZK7atePmnkUaAoS38">34386 N Lakeside Drive, Grayslake, IL 60030 (use this pin)</a></span>
            </div>
            <br />
            <p>We'll be giving a proper sendoff to the me that was, celebrating Willow and the life going forward, and warming the house with music, food, fire, and friends.</p>
            <p>The ceremony is personal and completely optional. Come for any or all of it. The music is the real kickoff for the housewarming.</p>
            <p>Use <a href="https://maps.app.goo.gl/ZK7atePmnkUaAoS38">THIS PIN</a> for GPS directions!</p>
          </section>

          <section className='party-callouts' aria-label='What to bring'>
            <div>
              <strong>Optional: bring something to burn</strong>
              <p>A memory of Matt, an old expectation, or something anti-trans you would like to reduce to ash. A written note works beautifully.</p>
            </div>
            <div>
              <strong>A way to make noise</strong>
              <p>We'll all provide the music today. I'll have horns on hand, but bring your axe and let's jam!</p>
            </div>
            <div>
              <strong>No presents. Just <em>presence</em>.</strong>
              <p>Food and beverages provided from Big Jack's, no need to bring anything. If there's something specific you absolutely must have, bring it with! In lieu of gifts, please make a donation to <a href="https://lgbtqlc.com/">the LGBTQ Center of Lake County</a>.</p>
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

          <section className='party-section ceremony-note'>
            <h2>About the fire</h2>
            <p>
              This part is personal, symbolic, and entirely optional. If the ceremony is not your thing, have a cocktail,
              enjoy the house and lake, or simply arrive closer to the music. There is no required philosophy exam for coming to our housewarming.
            </p>
          </section>

          <section className='party-section burn-guidance'>
            <h2>What can go in the fire</h2>
            <p>
              Keep it to plain paper, uncoated cardboard, or clean untreated wood. No plastics, electronics,
              treated wood, synthetic fabric, painted objects, batteries, aerosols, or anything coated. A note on plain paper is perfect.
            </p>
          </section>
        </main>
      </div>
    )
  }
}
