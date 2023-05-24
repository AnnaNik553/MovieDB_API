export default class MoviedbService {
  getResource = async (url) => {
    const response = await fetch(`${url}`)

    if (!response.ok) {
      throw new Error(`Error fetching data:  ${url} ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  extractRequiredFields = (data) => {
    return data.results.map((movie) => {
      const {
        id,
        genre_ids: genreIds,
        original_title: originalTitle,
        overview,
        poster_path: posterPath,
        release_date: releaseDate,
        vote_average: voteAverage,
      } = movie
      const newMovie = {
        id,
        genreIds,
        originalTitle,
        overview,
        posterPath,
        releaseDate,
        voteAverage,
      }
      return newMovie
    })
  }

  getDataFields = (data) => {
    const { total_results: totalResults, page, total_pages: totalPages } = data
    const movies = this.extractRequiredFields(data)
    return [movies, totalResults, page, totalPages]
  }

  getMoviesAPI = async (keyword = false, page = 1) => {
    if (keyword) {
      const keywords = keyword.trim().toLowerCase().replaceAll(' ', '+')
      const data = await this.getResource(
        `https://api.themoviedb.org/3/search/movie?api_key=199717ff7c34f5edd03b2504d549ddcd&query=${keywords}&page=${page}`
      )
      return this.getDataFields(data)
    }
    const data = await this.getResource(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=199717ff7c34f5edd03b2504d549ddcd&page=${page}`
    )
    return this.getDataFields(data)
  }

  getRatedMoviesAPI = async (guestSessionId, page = 1) => {
    const data = await this.getResource(
      `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=199717ff7c34f5edd03b2504d549ddcd&page=${page}`
    )
    return this.getDataFields(data)
  }

  addRatingAPI = async (id, rate, guestSessionId) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/rating?api_key=199717ff7c34f5edd03b2504d549ddcd&guest_session_id=${guestSessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
          accept: 'application/json',
        },
        body: JSON.stringify({ value: `${rate}` }),
      }
    )

    if (!response.ok) {
      throw new Error(
        `Error fetching data:  https://api.themoviedb.org/3/movie/${id}/rating?api_key=199717ff7c34f5edd03b2504d549ddcd&guest_session_id=${guestSessionId} ${response.status}`
      )
    }

    const data = await response.json()
    return data
  }

  getGenres = async () => {
    const data = await this.getResource(
      'https://api.themoviedb.org/3/genre/movie/list?api_key=199717ff7c34f5edd03b2504d549ddcd'
    )
    return data.genres
  }

  isSessionExpired(guestSession) {
    if (!guestSession) return true
    return Date.now() > new Date(guestSession.expires_at)
  }

  getGuestSession = async () => {
    // сначала из локалстораж, если ее нет или старая, то по сети
    let guestSession = JSON.parse(localStorage.getItem('TMDBguestSession'))
    if (this.isSessionExpired(guestSession)) {
      const data = await this.getResource(
        'https://api.themoviedb.org/3/authentication/guest_session/new?api_key=199717ff7c34f5edd03b2504d549ddcd'
      )
      guestSession = { id: data.guest_session_id, expires_at: data.expires_at }
      localStorage.setItem('TMDBguestSession', JSON.stringify(guestSession))
      return data.guest_session_id
    }
    return guestSession.id
  }

  getOwnRating = async (guestSessionId) => {
    const [, totalResults, , totalPages] = await this.getRatedMoviesAPI(guestSessionId)
    if (totalResults === 0) return {}
    const requests = new Array(totalPages)
      .fill(0)
      .map((_, i) =>
        this.getResource(
          `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=199717ff7c34f5edd03b2504d549ddcd&page=${
            i + 1
          }`
        )
      )
    const dataArr = await Promise.all(requests)
    const ownRating = {}
    dataArr.forEach((item) => {
      item.results.forEach((movie) => {
        ownRating[movie.id] = movie.rating
      })
    })
    return ownRating
  }
}
