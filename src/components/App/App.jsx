import { Component } from 'react'
import { Tabs } from 'antd'

import MoviesList from '../MoviesList'
import Preloader from '../Preloader'
import ErrorMessage from '../ErrorMessage'
import SearchForm from '../SearchForm'
import Paginate from '../Paginate'
import MoviedbService from '../../services/moviedb-service'
import { GenresProvider } from '../../context/context'

import './App.css'

export default class App extends Component {
  moviedbService = new MoviedbService()

  genres = []

  state = {
    currentMovies: false,
    totalResults: 1,
    page: 1,
    ratedMovies: [],
    totalRatedResults: 0,
    pageRated: 1,
    queryParam: false,
    loading: true,
    error: false,
    guestSessionId: '',
    ownRating: {},
  }

  componentDidMount() {
    this.moviedbService
      .getGuestSession() // получаем гостевую сессию
      .then((guestSessionId) => {
        this.setState({ guestSessionId })
        return guestSessionId
      })
      .then((guestSessionId) => this.moviedbService.getOwnRating(guestSessionId)) // получаем свои оценки, если есть
      .then((ownRating) => {
        this.setState({ ownRating })
      })
      .catch(this.onError)
    this.moviedbService // получаем жанры
      .getGenres()
      .then((genres) => {
        this.genres = genres
      })
      .catch(this.onError)
    this.moviedbService.getMoviesAPI().then(this.onMoviesLoaded).catch(this.onError) // получаем фильмы с высоким рейтингом
  }

  onMoviesLoaded = ([muvies, totalResults, page]) => {
    this.setState({
      currentMovies: muvies,
      totalResults,
      page,
      loading: false,
    })
  }

  onRatingMoviesLoaded = ([muvies, totalResults, page]) => {
    this.setState({
      ratedMovies: muvies,
      totalRatedResults: totalResults,
      pageRated: page,
      loading: false,
    })
  }

  onError = () => {
    this.setState({
      error: true,
      loading: false,
    })
  }

  getMovies = (queryParam, page) => {
    this.setState({
      queryParam,
      error: false,
      loading: true,
      page,
    })
    this.moviedbService.getMoviesAPI(queryParam, page).then(this.onMoviesLoaded).catch(this.onError)
  }

  getRatedMovies = (guestSessionId, page) => {
    this.setState({
      error: false,
      loading: true,
      pageRated: page,
    })
    this.moviedbService.getRatedMoviesAPI(guestSessionId, page).then(this.onRatingMoviesLoaded).catch(this.onError)
  }

  addRating = (id, rate) => {
    const { guestSessionId } = this.state
    this.moviedbService
      .addRatingAPI(id, rate, guestSessionId)
      .then(
        this.setState(({ ownRating }) => {
          return { ownRating: { ...ownRating, [id]: rate } }
        })
      )
      .catch(this.onError)
  }

  onChange = (key) => {
    if (key === '2') {
      const { guestSessionId, pageRated } = this.state
      this.getRatedMovies(guestSessionId, pageRated)
    }
  }

  render() {
    const {
      currentMovies,
      loading,
      error,
      page,
      totalResults,
      queryParam,
      ratedMovies,
      totalRatedResults,
      pageRated,
      guestSessionId,
      ownRating,
    } = this.state

    const hasData = !(loading || error)
    const errorMessage = error ? <ErrorMessage /> : null
    const movies = hasData ? (
      <MoviesList currentMovies={currentMovies} addRating={this.addRating} ownRating={ownRating} />
    ) : null
    const ratingMovies = hasData ? (
      <MoviesList currentMovies={ratedMovies} addRating={this.addRating} ownRating={ownRating} />
    ) : null
    const preloader = loading ? <Preloader /> : null
    const items = [
      {
        key: '1',
        label: 'Search',
        children: (
          <div>
            <SearchForm getMovies={this.getMovies} />
            <div className="page-content">
              {movies} {preloader} {errorMessage}
            </div>
            {hasData && (
              <Paginate page={page} totalResults={totalResults} getMovies={this.getMovies} queryParam={queryParam} />
            )}
          </div>
        ),
      },
      {
        key: '2',
        label: 'Rated',
        children: (
          <div>
            <div className="page-content">
              {ratingMovies} {preloader} {errorMessage}
            </div>
            {hasData && (
              <Paginate
                page={pageRated}
                totalResults={totalRatedResults}
                getMovies={this.getRatedMovies}
                guestSessionId={guestSessionId}
              />
            )}
          </div>
        ),
      },
    ]

    return (
      <div className="container">
        <GenresProvider value={this.genres}>
          <Tabs defaultActiveKey="1" items={items} centered size="large" onChange={this.onChange} />
        </GenresProvider>
      </div>
    )
  }
}
