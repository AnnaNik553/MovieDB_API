import Movie from '../Movie'

import './MoviesList.css'

const MoviesList = ({ currentMovies, addRating, ownRating }) => {
  if (currentMovies.length === 0) {
    return <h2 className="message">Oops..! Such a movie was not found </h2>
  }
  return currentMovies.map((movie) => {
    const { id, ...movieInfo } = movie
    const ownRate = ownRating[id.toString()]
    return <Movie key={id} {...movieInfo} ownRate={ownRate} addRating={(rate) => addRating(id, rate)} />
  })
}

export default MoviesList
