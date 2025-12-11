import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import { useRealTimeUpdate } from './useRealTimeUpdate'

export function useProductDetail(sku) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProduct = useCallback(async (showLoading = true) => {
    if (!sku) return

    try {
      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      const data = await api.getProductDetail(sku)
      setProduct(data)
    } catch (err) {
      console.error('Error fetching product:', err)
      setError('Error al cargar el producto. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [sku])

  // Initial fetch
  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  // Real-time updates (every 20 seconds for detail view)
  useRealTimeUpdate(
    useCallback(() => fetchProduct(false), [fetchProduct]),
    20000,
    !loading && !error && !!product
  )

  return {
    product,
    loading,
    error,
    refresh: fetchProduct
  }
}

