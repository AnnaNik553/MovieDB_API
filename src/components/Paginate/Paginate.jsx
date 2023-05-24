import { Pagination } from 'antd'

import './Paginate.css'

const Paginate = ({ page, totalResults, getMovies, queryParam, guestSessionId }) => {
  const onChange = (currentPage) => {
    if (guestSessionId) {
      getMovies(guestSessionId, currentPage)
    } else {
      getMovies(queryParam, currentPage)
    }
  }

  return (
    <div className="pagination">
      <Pagination current={page} defaultCurrent={1} total={totalResults} defaultPageSize={20} onChange={onChange} />
    </div>
  )
}
export default Paginate
