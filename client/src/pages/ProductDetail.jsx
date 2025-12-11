import { useParams, Link } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'
import './ProductDetail.css'

function ProductDetail() {
  const { sku } = useParams()
  const { product, loading, error, refresh } = useProductDetail(sku)

  if (loading && !product) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="container">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2 className="error-title">Error al cargar el producto</h2>
          <p className="error-message">{error}</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => refresh()}>
              Reintentar
            </button>
            <Link to="/" className="btn btn-secondary">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container">
        <div className="error-container">
          <span className="error-icon">🔍</span>
          <h2 className="error-title">Producto no encontrado</h2>
          <p className="error-message">
            No se pudo encontrar el producto con SKU: <code>{sku}</code>
          </p>
          <Link to="/" className="btn btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const getStockBadge = (stock) => {
    if (stock > 10) return { className: 'badge-success', text: 'En stock' }
    if (stock > 0) return { className: 'badge-warning', text: 'Stock bajo' }
    return { className: 'badge-danger', text: 'Sin stock' }
  }

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Catálogo</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-detail-header">
          <div className="product-header-content">
            <div className="product-icon-large">🔧</div>
            <div className="product-header-info">
              <h1 className="product-detail-title">{product.name}</h1>
              <div className="product-sku-badge">
                SKU: <code>{product.sku}</code>
              </div>
            </div>
          </div>
          {loading && (
            <span className="updating-badge">
              <div className="updating-spinner"></div>
              Actualizando...
            </span>
          )}
        </div>

        <div className="product-detail-body">
          <section className="product-section">
            <h2 className="section-title">Información General</h2>
            <div className="info-grid">
              {product.brand && (
                <div className="info-item">
                  <span className="info-label">Marca</span>
                  <span className="info-value">{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="info-item">
                  <span className="info-label">Modelo</span>
                  <span className="info-value">{product.model}</span>
                </div>
              )}
              {product.year && (
                <div className="info-item">
                  <span className="info-label">Año</span>
                  <span className="info-value">{product.year}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Stock Total</span>
                <span className="info-value">
                  <span className={`badge ${getStockBadge(product.totalStock).className}`}>
                    {product.totalStock} unidades
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section className="product-section">
            <h2 className="section-title">
              Ofertas por Proveedor ({product.providers.length})
            </h2>
            <div className="providers-grid">
              {product.providers.map((provider, index) => {
                const stockBadge = getStockBadge(provider.stock)
                const isLowestPrice = provider.price === Math.min(...product.providers.map(p => p.price))

                return (
                  <div key={index} className="provider-card">
                    {isLowestPrice && (
                      <div className="best-price-badge">
                        🏆 Mejor precio
                      </div>
                    )}
                    
                    <div className="provider-header">
                      <h3 className="provider-name">{provider.name}</h3>
                      {provider.available !== undefined && (
                        <span className={`badge ${provider.available ? 'badge-success' : 'badge-danger'}`}>
                          {provider.available ? 'Disponible' : 'No disponible'}
                        </span>
                      )}
                    </div>

                    <div className="provider-price">
                      <span className="price-label">Precio</span>
                      <span className="price-value">
                        ${provider.price.toLocaleString('es-CL')}
                      </span>
                    </div>

                    <div className="provider-info">
                      <div className="provider-info-item">
                        <span className="info-label">Stock</span>
                        <span className={`badge ${stockBadge.className}`}>
                          {provider.stock} unidades
                        </span>
                      </div>

                      {provider.deliveryTime && (
                        <div className="provider-info-item">
                          <span className="info-label">Entrega</span>
                          <span className="info-value">{provider.deliveryTime}</span>
                        </div>
                      )}

                      {provider.warranty && (
                        <div className="provider-info-item">
                          <span className="info-label">Garantía</span>
                          <span className="info-value">{provider.warranty}</span>
                        </div>
                      )}
                    </div>

                    {provider.description && (
                      <div className="provider-description">
                        <p>{provider.description}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {product.providers.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <h3 className="empty-title">No hay proveedores disponibles</h3>
              <p className="empty-message">
                Este producto no tiene proveedores activos en este momento
              </p>
            </div>
          )}
        </div>

        <div className="product-detail-actions">
          <Link to="/" className="btn btn-secondary">
            ← Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

