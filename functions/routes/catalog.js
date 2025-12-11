const express = require('express');
const router = express.Router();
const providerService = require('../services/providerService');
const normalizationService = require('../services/normalizationService');

/**
 * GET /api/catalog
 * Query params:
 *  - page: page number (default: 1)
 *  - limit: items per page (default: 20)
 *  - search: text search
 *  - brand: filter by brand
 *  - model: filter by model
 *  - year: filter by year
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      search: req.query.search,
      brand: req.query.brand,
      model: req.query.model,
      year: req.query.year
    };

    console.log(`📦 Fetching catalog - Page: ${page}, Limit: ${limit}`);

    // Fetch ALL products from all providers (not limited by page/limit)
    // We use a large limit to get all products, then paginate on our side
    const providerResponses = await providerService.getAllCatalogs(1, 1000);
    console.log(JSON.stringify(providerResponses));
    // Normalize each provider's response
    const normalizedCatalogs = providerResponses.map(response => 
      normalizationService.normalizeCatalog(response)
    );
    
    // Merge products by SKU
    let mergedProducts = normalizationService.mergeProductsBySku(normalizedCatalogs);

    // Apply filters
    const filteredProducts = normalizationService.filterProducts(mergedProducts, filters);

    // Paginate results
    const paginatedResult = normalizationService.paginateProducts(filteredProducts, page, limit);

    
    res.json({
      success: true,
      products: paginatedResult.products,
      total: paginatedResult.pagination.totalItems,
      page: paginatedResult.pagination.currentPage,
      totalPages: paginatedResult.pagination.totalPages,
      pagination: paginatedResult.pagination,
      providers: normalizedCatalogs.map(cat => ({
        name: cat.provider,
        success: cat.success,
        productsCount: cat.products.length
      }))
    });

  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch catalog',
      message: error.message
    });
  }
});

module.exports = router;

