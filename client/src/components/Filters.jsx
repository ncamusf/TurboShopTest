import { useState, useEffect } from 'react'
import './Filters.css'

function Filters({ filters, onFilterChange, products }) {
  const [localFilters, setLocalFilters] = useState({
    brand: filters.brand || '',
    model: filters.model || '',
    year: filters.year || ''
  })

  // Extract unique values from products
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()
  const models = [...new Set(products.map(p => p.model).filter(Boolean))].sort()
  const years = [...new Set(products.map(p => p.year).filter(Boolean))].sort((a, b) => b - a)

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClear = () => {
    const clearedFilters = { brand: '', model: '', year: '' }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = localFilters.brand || localFilters.model || localFilters.year

  return (
    <div className="filters">
      <div className="filters-header">
        <h3 className="filters-title">Filtros</h3>
        {hasActiveFilters && (
          <button className="btn-clear-filters" onClick={handleClear}>
            Limpiar
          </button>
        )}
      </div>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="brand-filter" className="filter-label">Marca</label>
          <select
            id="brand-filter"
            className="select"
            value={localFilters.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="model-filter" className="filter-label">Modelo</label>
          <select
            id="model-filter"
            className="select"
            value={localFilters.model}
            onChange={(e) => handleChange('model', e.target.value)}
          >
            <option value="">Todos los modelos</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year-filter" className="filter-label">Año</label>
          <select
            id="year-filter"
            className="select"
            value={localFilters.year}
            onChange={(e) => handleChange('year', e.target.value)}
          >
            <option value="">Todos los años</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default Filters

