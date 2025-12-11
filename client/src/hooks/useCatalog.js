import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useRealTimeUpdate } from './useRealTimeUpdate'

export function useCatalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    brand: '',
    model: '',
    year: ''
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  })

  const fetchCatalog = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const data = await api.getCatalog(filters)
      
      setProducts(data.products || [])
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1
      })
    } catch (err) {
      console.error('Error fetching catalog:', err)
      setError('Error al cargar el catálogo. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial fetch
  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  // Real-time updates (every 30 seconds)
  useRealTimeUpdate(
    useCallback(() => fetchCatalog(false), [fetchCatalog]),
    30000,
    !loading && !error
  )

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change (except explicit page change)
    }))
  }

  const nextPage = () => {
    if (pagination.page < pagination.totalPages) {
      updateFilters({ page: pagination.page + 1 })
    }
  }

  const prevPage = () => {
    if (pagination.page > 1) {
      updateFilters({ page: pagination.page - 1 })
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      updateFilters({ page })
    }
  }

  return {
    products,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    nextPage,
    prevPage,
    goToPage,
    refresh: fetchCatalog
  }
}

