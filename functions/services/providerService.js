const axios = require('axios');

const BASE_URL = 'https://web-production-84144.up.railway.app';
const TIMEOUT = 10000; // 10 seconds timeout
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000; // 1 second between retries

class ProviderService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: TIMEOUT,
    });
  }

  /**
   * Retry helper: executes a function with retries on failure
   */
  async retryRequest(requestFn, providerName, maxRetries = MAX_RETRIES) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await requestFn();
        
        // Success! Return the response
        if (response && response.status === 200) {
          if (attempt > 1) {
            console.log(`✅ ${providerName} succeeded on attempt ${attempt}`);
          }
          return {
            provider: providerName,
            data: response.data,
            success: true
          };
        }
      } catch (error) {
        lastError = error;
        const statusCode = error.response?.status;
        
        // Don't retry on 404 (not found) or 400 (bad request)
        if (statusCode === 404 || statusCode === 400) {
          console.error(`${providerName} error (no retry): ${error.message}`);
          return {
            provider: providerName,
            data: null,
            success: false,
            error: error.message
          };
        }
        
        // Log retry attempt
        if (attempt < maxRetries) {
          console.log(`⚠️  ${providerName} attempt ${attempt}/${maxRetries} failed (${error.message}), retrying...`);
          // Wait before retrying (exponential backoff)
          await this.sleep(RETRY_DELAY * attempt);
        } else {
          console.error(`❌ ${providerName} failed after ${maxRetries} attempts: ${error.message}`);
        }
      }
    }
    
    // All retries failed
    return {
      provider: providerName,
      data: null,
      success: false,
      error: lastError?.message || 'Unknown error'
    };
  }

  /**
   * Sleep helper for delays between retries
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // AutoPartsPlus methods
  async getAutoPartsPlusCatalog(page = 1, limit = 20) {
    return this.retryRequest(
      () => this.client.get('/api/autopartsplus/catalog', { params: { page, limit } }),
      'AutoPartsPlus'
    );
  }

  async getAutoPartsPlusBySku(sku) {
    return this.retryRequest(
      () => this.client.get('/api/autopartsplus/parts', { params: { sku } }),
      'AutoPartsPlus'
    );
  }

  // RepuestosMax methods
  async getRepuestosMaxCatalog(pagina = 1, limite = 20) {
    return this.retryRequest(
      () => this.client.get('/api/repuestosmax/catalogo', { params: { pagina, limite } }),
      'RepuestosMax'
    );
  }

  async getRepuestosMaxByCodigo(codigo) {
    return this.retryRequest(
      () => this.client.get('/api/repuestosmax/productos', { params: { codigo } }),
      'RepuestosMax'
    );
  }

  // GlobalParts methods
  async getGlobalPartsCatalog(page = 1, itemsPerPage = 20) {
    return this.retryRequest(
      () => this.client.get('/api/globalparts/inventory/catalog', { params: { page, itemsPerPage } }),
      'GlobalParts'
    );
  }

  async getGlobalPartsByPartNumber(partNumber) {
    return this.retryRequest(
      () => this.client.get('/api/globalparts/inventory/search', { params: { partNumber } }),
      'GlobalParts'
    );
  }

  // Fetch all catalogs in parallel
  async getAllCatalogs(page = 1, limit = 20) {
    const promises = [
      this.getAutoPartsPlusCatalog(page, limit),
      this.getRepuestosMaxCatalog(page, limit),
      this.getGlobalPartsCatalog(page, limit)
    ];

    return await Promise.all(promises);
  }

  // Fetch product by SKU from all providers
  async getProductBySku(sku) {
    const promises = [
      this.getAutoPartsPlusBySku(sku),
      this.getRepuestosMaxByCodigo(sku),
      this.getGlobalPartsByPartNumber(sku)
    ];

    return await Promise.all(promises);
  }
}

module.exports = new ProviderService();

