// En producción (Firebase Hosting), las rutas /api/* se redirigen automáticamente a las Functions
// En desarrollo, usamos localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3000')

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Catalog endpoints
  async getCatalog(params = {}) {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page)
    // Always send limit without condition
    queryParams.append('limit', params.limit || 20)
    if (params.search) queryParams.append('search', params.search)
    if (params.brand) queryParams.append('brand', params.brand)
    if (params.model) queryParams.append('model', params.model)
    if (params.year) queryParams.append('year', params.year)

    const queryString = queryParams.toString()
    const endpoint = `/api/catalog${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // Product detail endpoint
  async getProductDetail(sku) {
    return this.request(`/api/products/${encodeURIComponent(sku)}`)
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health')
  }
}

export default new ApiService()

