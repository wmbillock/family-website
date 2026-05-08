import React, { Component } from 'react'

const groups = {
  chicago_brass_band: { name: 'Chicago Brass Band', url: 'https://www.chicagobrassband.org' },
  kilties: { name: 'Kilties Drum and Bugle Corps', url: 'https://www.kilties.com' },
  sacramento_freelancers: { name: 'Sacramento Freelancers', url: 'https://www.freelancers-alumni.org/' },
  illinois_brass_band: { name: 'Illinois Brass Band', url: 'https://www.illinoisbrassband.org/' },
  glassmen: { name: 'Glassmen Drum and Bugle Corps', url: 'https://www.dci.org' },
  madison_brass_band: { name: 'Madison Brass Band', url: 'https://www.mbbweb.net/' },
  colts: { name: 'Colts Drum and Bugle Corps', url: 'https://www.colts.org' },
  isucfvmb: { name: 'Iowa State University Cyclone Football "Varsity" Marching Band', url: 'https://music.iastate.edu' },
  pioneer: { name: 'Pioneer Drum and Bugle Corps', url: 'https://www.dci.org' },
  sinewave: { name: 'Sine Wave Minicorps', url: 'https://www.dca-corps.org' },
  nabbss: { name: 'North American Brass Band Summer School', url: 'https://www.nabba.org' },
  local_legends_mke: { name: 'Local Legends (MKE)', url: 'https://open.spotify.com/artist/7DDKBf8FjApiQMhTKR2nkZ' }
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const monthIdx = (date) => {
  if (!date) return 0
  for (let i = 0; i < MONTHS.length; i++) {
    if (date.includes(MONTHS[i])) return i + 1
  }
  return 0
}

const videos = [
  { video_id: 'K--uJHNUIyc', group: 'chicago_brass_band', title: 'Crazy Twenties (Thierry Deleruyelle)', year: 2025, date: 'March 2025', location: 'Fort Wayne, IN', role: 'First Baritone', context: '2025 NABBA Championships' },
  { video_id: 'VRNjYEm2Uyo', group: 'chicago_brass_band', title: 'The World Rejoicing (Edward Gregson)', year: 2025, date: 'March 2025', location: 'Fort Wayne, IN', role: 'First Baritone', context: '2025 NABBA Championships' },
  { video_id: 'H159CRMZydk', group: 'chicago_brass_band', title: 'Other Lives (Oliver Waespi)', year: 2024, date: 'March 2024', location: 'Huntsville, AL', role: 'Solo Tenor Horn', context: '2024 NABBA Championships' },
  { video_id: 'yin1582SZcQ', group: 'chicago_brass_band', title: 'Metropolis 1927 (Peter Graham)', year: 2024, date: 'March 2024', location: 'Huntsville, AL', role: 'Solo Tenor Horn', context: '2024 NABBA Championships' },
  { video_id: 'T0pn_TSSj9s', group: 'nabbss', title: 'Lord of the Dance', year: 2022, location: 'Halifax, NS', role: 'Solo Tenor Horn' },
  { video_id: 'ZpXTLs8gv4I', group: 'local_legends_mke', title: 'C.E. Open Season', year: 2025, location: 'X-Ray Arcade, Cudahy, WI', role: 'Trombone, composer, lyricist' },
  { video_id: 'TvxihI_QbQ0', group: 'chicago_brass_band', title: 'Finale from Symphony No. 4 (Tchaikovsky)', year: 2021, date: 'October 2021', location: 'Crystal Lake, IL', role: 'First Tenor Horn' },
  { video_id: 'b32IQO4sqwY', group: 'chicago_brass_band', title: 'The Nutcracker Sweet', year: 2021, date: 'December 2021', location: 'Crystal Lake, IL', role: 'First Tenor Horn' },
  { video_id: 'b36kt6Ad95U', group: 'chicago_brass_band', title: 'West Side Story', year: 2021, date: 'October 2021', location: 'Crystal Lake, IL', role: 'First Tenor Horn' },
  { video_id: 'mH0GMwCCq_Y', group: 'chicago_brass_band', title: "Chicago, That Toddlin' Town", year: 2020, role: 'First Tenor Horn' },
  { video_id: '9ZPgw1KdqbM', group: 'chicago_brass_band', title: 'Mephistopheles', year: 2019, date: 'November 2019', location: 'St Louis', role: 'First Tenor Horn' },
  { video_id: 'yBNaUF9jfR8', group: 'sacramento_freelancers', title: 'A Tribute to the Madison Scouts', year: 2017, location: 'Rochester, NY', role: 'Euphonium' },
  { video_id: '6ltlWvz9Rl0', group: 'illinois_brass_band', title: 'O Magnum Mysterium', year: 2017, location: 'St Charles, IL', role: 'Solo Horn' },
  { video_id: 'Koinu1HUhpw', group: 'sacramento_freelancers', title: "Wayne's World", year: 2016, location: 'Rochester, NY', role: 'Euphonium' },
  { video_id: 'xMF9Lu35X8s', group: 'kilties', title: 'Final run-through', year: 2014, location: 'Kenosha, WI', role: 'Lead Mellophone' },
  { video_id: 'DRwaO7WxUTE', group: 'madison_brass_band', title: 'The Stars and Stripes Forever', year: 2012, location: 'Waupun, WI', role: 'Repiano Cornet' },
  { video_id: 'gkLBnoXYI90', group: 'sinewave', title: 'Jersey Boys', year: 2010, location: 'Rochester, NY', role: 'Baritone' },
  { video_id: 'Fk7R4W0nIOU', group: 'kilties', title: 'Overture to Le Nozze di Figaro', year: 2009, location: 'Rochester, NY', role: 'Arranger and 2nd Baritone' },
  { video_id: 'htbOaiLF2jk', group: 'colts', title: 'Chivalry', year: 2001, location: 'Buffalo, NY', role: '3rd Baritone' },
  { video_id: 'DIsP5gKQoIo', group: 'isucfvmb', title: 'Pregame show', year: 2000, location: 'Ames, IA', role: '1st Trumpet' },
  { video_id: 'eeT8AV_MK9M', group: 'glassmen', title: 'The Age of Gold', year: 1997, location: 'Orlando, FL', role: '2nd Soprano' },
  { video_id: 'y2bPNcyPX2g', group: 'pioneer', title: 'Shades of the Emerald', year: 1995, location: 'Milwaukee, WI', role: '3rd Soprano' }
].sort((a, b) => (b.year - a.year) || (monthIdx(b.date) - monthIdx(a.date)))

export default class VideoGrid extends Component {
  state = { playingId: null }

  play = (id) => this.setState({ playingId: id })

  renderCard(video) {
    const isPlaying = this.state.playingId === video.video_id
    const group = groups[video.group]
    return (
      <div key={video.video_id} className='video-card'>
        {isPlaying ? (
          <iframe
            title={video.title}
            src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        ) : (
          <button
            type='button'
            className='video-thumb'
            onClick={() => this.play(video.video_id)}
            aria-label={`Play ${video.title}`}
          >
            <img
              src={`https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}
              alt={video.title}
              loading='lazy'
            />
            <span className='play-icon' aria-hidden='true'>▶</span>
            <span className='year-badge'>{video.year}</span>
          </button>
        )}
        <div className='video-meta'>
          <h3>{video.title}</h3>
          <p className='video-group'>
            {group.url
              ? <a href={group.url} target='_blank' rel='noopener noreferrer'>{group.name}</a>
              : <span>{group.name}</span>}
          </p>
          <p className='video-detail'>{video.role}{video.location ? ` · ${video.location}` : ''}</p>
          {video.context && <p className='video-context'>{video.context}</p>}
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className='video-grid'>
        {videos.map((v) => this.renderCard(v))}
      </div>
    )
  }
}
