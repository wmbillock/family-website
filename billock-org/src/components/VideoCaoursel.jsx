import React, { Component } from 'react'
import ReactPlayer from 'react-player'
import { Carousel } from 'react-responsive-carousel'
import {v4 as uuidv4} from 'uuid'
import "react-responsive-carousel/lib/styles/carousel.min.css";


const external_links = {
  'chicago_brass_band': 'https://www.chicagobrassband.org',
  'kilties': 'https://www.kilties.com',
  'sacramento_freelancers': 'https://www.freelancers-alumni.org/',
  'illinois_brass_band': 'https://www.illinoisbrassband.org/',
  'glassmen': 'https://www.dci.org',
  'madison_brass_band': 'https://www.mbbweb.net/',
  'colts': 'https://www.colts.org',
  'isucfvmb': 'https://music.iastate.edu',
  'pioneer': 'https://www.dci.org',
  'sinewave': 'https://www.dca-corps.org'

}

export default class VideoCarousel extends Component {
  getData() {
    return [ 
      {
        'group': 'chicago_brass_band',
        'video_id': 'TvxihI_QbQ0',
        'type': 'video',
        'legend': 'Finale from Symphony No. 4 (P.I. Tchaikovsky), Chicago Brass Band, Crystal Lake, IL, October 2021. First Tenor Horn'
      },
      {
        'group': 'chicago_brass_band',
        'video_id': '9ZPgw1KdqbM',
        'type': 'video',
        'legend': 'Mephistopheles, Chicago Brass Band, St Louis, November 2019, First Tenor Horn'
      },
      {
        'group': 'sacramento_freelancers',
        'video_id': 'yBNaUF9jfR8',
        'type': 'video',
        'legend': 'A Tribute to the Madison Scouts, Sacramento Freelancers, Rochester, NY, 2017. Euphonium'
      },
      {
        'group': 'kilties',
        'video_id': 'Fk7R4W0nIOU',
        'type': 'video',
        'legend': 'Overture to Le Nozze Di Figaro, Kilties Baritones, Rochester NY, 2009. Arranger and 2nd Baritone'
      },
      {
        'group': 'sacramento_freelancers',
        'video_id': 'Koinu1HUhpw',
        'type': 'video',
        'legend': 'Wayne\'s World, Sacramento Freelancers Minicorps, Rochester, NY, 2016. Euphonium'
      },
      {
        'group': 'chicago_brass_band',
        'video_id': 'mH0GMwCCq_Y',
        'type': 'video',
        'legend': 'Chicago, That Toddlin\' Town, Chicago Brass Band, 2020. First Tenor Horn'
      },
      {
        'group': 'chicago_brass_band',
        'video_id': 'b32IQO4sqwY',
        'type': 'video',
        'legend': 'The Nutcracker Sweet, Chicago Brass Band, Crystal Lake, IL, December, 2021. First Tenor Horn'
      },
      {
        'group': 'chicago_brass_band',
        'video_id': 'b36kt6Ad95U',
        'type': 'video',
        'legend': 'West Side Story, Chicago Brass Band, Crystal Lake, IL, October 2021. First Tenor Horn'
      },
      {
        'group': 'illinois_brass_band',
        'video_id': '6ltlWvz9Rl0',
        'type': 'video',
        'legend': 'O Magnum Mysterium, Illinois Brass Band, St Charles, IL, 2017. Solo horn'
      },
      {
        'group': 'madison_brass_band',
        'video_id': 'DRwaO7WxUTE',
        'type': 'video',
        'legend': 'The Stars and Stripes Forever, Madison Brass Band, Waupun, WI, 2012. Repiano Cornet'
      },
      {
        'group': 'glassmen',
        'video_id': 'eeT8AV_MK9M',
        'type': 'video',
        'legend': 'The Age of Gold, Glassmen Drum and Bugle Corps, Orlando, FL, 1997. 2nd Soprano'
      },
      {
        'group': 'colts',
        'video_id': 'htbOaiLF2jk',
        'type': 'video',
        'legend': 'Chivalry, Colts Drum and Bugle Corps, Buffalo, NY, 2001. 3rd Baritone'
      },
      {
        'group': 'kilties',
        'video_id': 'xMF9Lu35X8s',
        'type': 'video',
        'legend': 'Final run through, Kilties Drum and Bugle Corps, Kenosha, WI, 2014. Lead Mellophone'
      },
      {
        'group': 'isucfvmb',
        'video_id': 'DIsP5gKQoIo',
        'type': 'video',
        'legend': 'Pregame show, Iowa State University Cyclone Football "Varsity" Marching Band, Ames, IA, 2000. 1st trumpet'
      },
      {
        'group': 'sinewave',
        'video_id': 'gkLBnoXYI90',
        'type': 'video',
        'legend': 'Jersey Boys, Sine Wave Minicorps, Rochester, NY, 2010. Baritone'
      },
      {
        'group': 'pioneer',
        'video_id': 'y2bPNcyPX2g',
        'legend': 'Shades of the Emerald, Pioneer Drum and Bugle Corps, Milwaukee, WI, 1995. 3rd Soprano'
      }
    ]
  }


  getVideoUrl(video_id) {
    return `https://www.youtube.com/embed/${video_id}`
  }
  
  getYoutubeSlide(video_id, isSelected, legend, group) {
    //return <iframe key={uuidv4()} width="560" height="315" src={url} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
    return (
      <div key={uuidv4()} className='player-wrapper'>
        <ReactPlayer 
        url={this.getVideoUrl(video_id)} 
        id={video_id}
        playing={isSelected} 
        className='react-player'
        width='90%' 
        height='90%'
        />
        <h3><em>{legend}</em></h3>
        <p>More info <a href={external_links[group]} >available here</a>!</p>
        
      </div>)
  }
  
  render() {    
    const getVideoThumb = (videoId) => `https://img.youtube.com/vi/${videoId}/default.jpg`
    const customRenderThumb = (children) => {
      children.map((item) => {
        const videoId = item.props.id;
        return <img src={getVideoThumb(videoId)} alt="video thumbnail" />
      });
    }
    return (
        <Carousel infiniteLoop renderThumbs={customRenderThumb} >
          {
            this.getData().map((item) => {return this.getYoutubeSlide(item['video_id'], false, item['legend'], item['group'])})
          }
        </Carousel>
    );
  };
}
