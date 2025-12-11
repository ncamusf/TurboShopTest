const express = require('express');
const router = express.Router();
const providerService = require('../services/providerService');
const normalizationService = require('../services/normalizationService');

/**
 * GET /api/products/:sku
 * Get detailed information for a specific product by SKU
 */
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;

    if (!sku) {
      return res.status(400).json({
        success: false,
        error: 'SKU is required'
      });
    }

    console.log(`🔍 Fetching product details for SKU: ${sku}`);

    // Fetch from all providers in parallel
    const providerResponses = await providerService.getProductBySku(sku);

    // Normalize responses
    const offers = [];
    const productDetails = {
      sku: sku,
      name: '',
      description: '',
      brand: '',
      model: '',
      year: '',
      category: '',
      imageUrl: '',
      offers: []
    };

    providerResponses.forEach(response => {
      if (!response.success || !response.data) return;

      const provider = response.provider;
      let product = null;

      // Extract product from provider-specific response structure
      if (provider === 'AutoPartsPlus') {
        // AutoPartsPlus returns { parts: [...] } or { part: {...} }
        if (response.data.part) {
          product = response.data.part;
        } else if (response.data.parts && response.data.parts.length > 0) {
          product = response.data.parts[0];
        }
      } else if (provider === 'RepuestosMax') {
        // RepuestosMax returns { producto: {...} } or { productos: [...] }
        if (response.data.producto) {
          product = response.data.producto;
        } else if (response.data.productos && response.data.productos.length > 0) {
          product = response.data.productos[0];
        }
      } else if (provider === 'GlobalParts') {
        // GlobalParts has ResponseEnvelope structure
        if (response.data.ResponseEnvelope && response.data.ResponseEnvelope.Body) {
          const body = response.data.ResponseEnvelope.Body;
          if (body.Item) {
            product = body.Item;
          } else if (body.Items && body.Items.length > 0) {
            product = body.Items[0];
          }
        }
      } else {
        // Fallback for unknown providers
        if (Array.isArray(response.data)) {
          product = response.data[0];
        } else if (response.data.product) {
          product = response.data.product;
        } else {
          product = response.data;
        }
      }

      if (!product) return;

      // Normalize product
      const normalized = normalizationService.normalizeProduct(product, provider);
      
      if (normalized) {
        // Fill product details with first available data
        if (!productDetails.name && normalized.name) productDetails.name = normalized.name;
        if (!productDetails.description && normalized.description) productDetails.description = normalized.description;
        if (!productDetails.brand && normalized.brand) productDetails.brand = normalized.brand;
        if (!productDetails.model && normalized.model) productDetails.model = normalized.model;
        if (!productDetails.year && normalized.year) productDetails.year = normalized.year;
        if (!productDetails.category && normalized.category) productDetails.category = normalized.category;
        if (!productDetails.imageUrl && normalized.imageUrl) productDetails.imageUrl = normalized.imageUrl;

        // Add offer
        offers.push({
          name: normalized.provider,
          provider: normalized.provider,
          price: normalized.price,
          stock: normalized.stock,
          availability: normalized.availability,
          available: normalized.availability
        });
      }
    });

    if (offers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        sku: sku
      });
    }

    // Calculate price range
    const prices = offers.map(o => o.price).filter(p => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const totalStock = offers.reduce((sum, o) => sum + o.stock, 0);

    productDetails.providers = offers;
    productDetails.offers = offers;
    productDetails.minPrice = minPrice;
    productDetails.maxPrice = maxPrice;
    productDetails.totalStock = totalStock;
    productDetails.availableProviders = offers.length;

    res.json(productDetails);

  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product details',
      message: error.message
    });
  }
});

module.exports = router;

