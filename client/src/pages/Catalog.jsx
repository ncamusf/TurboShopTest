import { useCatalog } from '../hooks/useCatalog'
import SearchBar from '../components/SearchBar'
import Filters from '../components/Filters'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'
import './Catalog.css'

function Catalog() {
  const {
    products,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    nextPage,
    prevPage,
    goToPage,
    refresh
  } = useCatalog()

  const handleSearchChange = (search) => {
    updateFilters({ search, page: 1 })
  }

  const handleFilterChange = (newFilters) => {
    updateFilters({ ...newFilters, page: 1 })
  }

  if (loading && products.length === 0) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="container">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2 className="error-title">Error al cargar el catálogo</h2>
          <p className="error-message">{error}</p>
          <button className="btn btn-primary" onClick={() => refresh()}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="catalog-header">
        <div className="catalog-title-section">
          <h1 className="catalog-title">Catálogo de Autopartes</h1>
          <p className="catalog-subtitle">
            Encuentra las mejores autopartes de múltiples proveedores
          </p>
        </div>
      </div>

      <div className="catalog-search">
        <SearchBar
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Buscar por nombre, SKU, marca, modelo..."
        />
      </div>

      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        products={products}
      />

      <div className="catalog-results">
        <div className="results-header">
          <p className="results-count">
            {pagination.total > 0 ? (
              <>
                Mostrando <strong>{products.length}</strong> de{' '}
                <strong>{pagination.total}</strong> productos
              </>
            ) : (
              'No se encontraron productos'
            )}
          </p>
          {loading && (
            <span className="updating-badge">
              <div className="updating-spinner"></div>
              Actualizando...
            </span>
          )}
        </div>

        {products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={goToPage}
              onNext={nextPage}
              onPrev={prevPage}
            />
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3 className="empty-title">No se encontraron productos</h3>
            <p className="empty-message">
              Intenta ajustar los filtros o la búsqueda para encontrar lo que necesitas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Catalog

