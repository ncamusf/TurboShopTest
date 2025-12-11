import { useState, useEffect } from 'react'
import './SearchBar.css'

function SearchBar({ value, onChange, placeholder = 'Buscar productos...' }) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          className="search-clear"
          onClick={() => {
            setLocalValue('')
            onChange('')
          }}
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar

