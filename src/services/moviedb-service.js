export default class MoviedbService {
  MAX_TOTAL_RESULTS = 500 * 20 // page must be less than or equal to 500 - themoviedb.org

  BASE_URL = 'https://api.themoviedb.org/3'

  API_KEY = '199717ff7c34f5edd03b2504d549ddcd'

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
    const { total_results: totalRes, page, total_pages: totalPages } = data
    const totalResults = totalRes > this.MAX_TOTAL_RESULTS ? this.MAX_TOTAL_RESULTS : totalRes
    const movies = this.extractRequiredFields(data)
    return [movies, totalResults, page, totalPages]
  }

  getMoviesAPI = async (keyword = false, page = 1) => {
    if (keyword) {
      const keywords = keyword.trim().toLowerCase().replaceAll(' ', '+')
      const data = await this.getResource(
        `${this.BASE_URL}/search/movie?api_key=${this.API_KEY}&query=${keywords}&page=${page}`
      )
      return this.getDataFields(data)
    }
    const data = await this.getResource(`${this.BASE_URL}/movie/top_rated?api_key=${this.API_KEY}&page=${page}`)
    return this.getDataFields(data)
  }

  getRatedMoviesAPI = async (guestSessionId, page = 1) => {
    const data = await this.getResource(
      `${this.BASE_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${this.API_KEY}&page=${page}`
    )
    return this.getDataFields(data)
  }

  addRatingAPI = async (id, rate, guestSessionId) => {
    const response = await fetch(
      `${this.BASE_URL}/movie/${id}/rating?api_key=${this.API_KEY}&guest_session_id=${guestSessionId}`,
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
        `Error fetching data:  ${this.BASE_URL}/movie/${id}/rating?api_key=${this.API_KEY}&guest_session_id=${guestSessionId} ${response.status}`
      )
    }

    const data = await response.json()
    return data
  }

  getGenres = async () => {
    const data = await this.getResource(`${this.BASE_URL}/genre/movie/list?api_key=${this.API_KEY}`)
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
      const data = await this.getResource(`${this.BASE_URL}/authentication/guest_session/new?api_key=${this.API_KEY}`)
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
          `${this.BASE_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${this.API_KEY}&page=${i + 1}`
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
