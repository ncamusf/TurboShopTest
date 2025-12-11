import { Link } from 'react-router-dom'
import './ProductCard.css'

function ProductCard({ product }) {
  const getStockBadge = (stock) => {
    if (stock > 10) return { className: 'badge-success', text: 'En stock' }
    if (stock > 0) return { className: 'badge-warning', text: 'Stock bajo' }
    return { className: 'badge-danger', text: 'Sin stock' }
  }

  const stockBadge = getStockBadge(product.totalStock)

  return (
    <Link to={`/product/${encodeURIComponent(product.sku)}`} className="product-card">
      <div className="product-card-header">
        <div className="product-icon">🔧</div>
      </div>
      
      <div className="product-card-body">
        <h3 className="product-title">{product.name}</h3>
        
        <div className="product-meta">
          {product.brand && (
            <span className="product-meta-item">
              <span className="meta-label">Marca:</span> {product.brand}
            </span>
          )}
          {product.model && (
            <span className="product-meta-item">
              <span className="meta-label">Modelo:</span> {product.model}
            </span>
          )}
          {product.year && (
            <span className="product-meta-item">
              <span className="meta-label">Año:</span> {product.year}
            </span>
          )}
        </div>

        <div className="product-sku">
          SKU: <code>{product.sku}</code>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="price-label">Desde</span>
            <span className="price-value">${product.minPrice.toLocaleString('es-CL')}</span>
          </div>
          
          <div className="product-badges">
            <span className={`badge ${stockBadge.className}`}>
              {stockBadge.text}
            </span>
            <span className="badge badge-info">
              {product.providerCount} {product.providerCount === 1 ? 'proveedor' : 'proveedores'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

