import './Pagination.css'

function Pagination({ currentPage, totalPages, onPageChange, onNext, onPrev }) {
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <span>←</span>
        <span className="pagination-btn-text">Anterior</span>
      </button>

      <div className="pagination-pages">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Ir a página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        className="pagination-btn"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        <span className="pagination-btn-text">Siguiente</span>
        <span>→</span>
      </button>
    </div>
  )
}

export default Pagination

