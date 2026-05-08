import React, { Component } from 'react'
import VideoCarousel from '../VideoCaoursel'

export default class HobbyInfo extends Component {
  render() {
    return (
      <div>
        <VideoCarousel />
        <div className='spotify-embed'>
          <h2>Listen on Spotify</h2>
          <iframe
            title='Spotify artist player'
            style={{ borderRadius: '12px' }}
            src='https://open.spotify.com/embed/artist/7DDKBf8FjApiQMhTKR2nkZ?utm_source=generator'
            width='100%'
            height='352'
            frameBorder='0'
            allowFullScreen
            allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
            loading='lazy'
          />
        </div>
      </div>
    )
  }
}
