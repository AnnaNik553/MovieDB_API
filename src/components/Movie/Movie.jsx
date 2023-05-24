/* eslint-disable no-nested-ternary */
import { Component } from 'react'
import './Movie.css'
import format from 'date-fns/format'
import { Rate } from 'antd'

import { GenresConsumer } from '../../context/context'
import shorten from '../../utils/shorten'

import defaultPoster from './defaultPoster.jpg'
import PreloadIMG from './PreloadIMG.svg'

export default class Movie extends Component {
  state = {
    imageSrc: PreloadIMG,
  }

  componentDidMount() {
    const img = new Image()
    img.onload = () => {
      const { posterPath } = this.props
      const src = posterPath ? `https://image.tmdb.org/t/p/w200${posterPath}` : defaultPoster
      this.setState({
        imageSrc: src,
      })
    }
    img.src = defaultPoster
  }

  render() {
    const { genreIds, originalTitle, overview, releaseDate, addRating, ownRate, voteAverage } = this.props
    const { imageSrc } = this.state

    return (
      <GenresConsumer>
        {(genres) => {
          const color =
            voteAverage < 3 ? '#E90000' : voteAverage < 5 ? '#E97E00' : voteAverage < 7 ? '#E9D100' : '#66E900'
          const borderStyle = {
            border: `2px solid ${color}`,
          }
          const classNameRate = 'card_rate'
          const classNameRateMobile = 'card_rate-mobile'

          return (
            <div className="card">
              <div className="card__box">
                <img src={imageSrc} alt="movie poster" className="card__img" />
                <div className="card__info">
                  <span className="card__vote-average" style={borderStyle}>
                    {Math.round(voteAverage * 10) / 10}
                  </span>
                  <h3 className="card__title">{originalTitle}</h3>
                  <p className="card__date">{releaseDate ? format(new Date(releaseDate), 'MMMM d, y') : 'unknown'}</p>
                  <ul className="card__genres">
                    {genreIds.map((id) => {
                      const genre = genres.find((item) => item.id === id)?.name
                      return (
                        <li key={id} className="card__genre">
                          {genre}
                        </li>
                      )
                    })}
                  </ul>
                  <p className="card__text">{shorten(overview, 100)}</p>
                  <Rate
                    allowHalf
                    defaultValue={0}
                    count={10}
                    value={ownRate}
                    allowClear={false}
                    className={classNameRate}
                    onChange={(value) => addRating(value)}
                  />
                </div>
              </div>
              <p className="card__text-mobile">{shorten(overview, 200)}</p>
              <Rate
                allowHalf
                defaultValue={0}
                count={10}
                value={ownRate}
                allowClear={false}
                className={classNameRateMobile}
                onChange={(value) => addRating(value)}
              />
            </div>
          )
        }}
      </GenresConsumer>
    )
  }
}
