class NormalizationService {
  /**
   * Helper: Extract year from vehicle string like "Lexus ES350 2000-2006"
   */
  extractYear(vehicleString) {
    if (!vehicleString) return '';
    const yearMatch = vehicleString.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : '';
  }

  /**
   * Helper: Convert example.com URLs to actual placeholder images
   */
  getValidImageUrl(imageUrl, sku) {
    if (!imageUrl || imageUrl.includes('example.com')) {
      // Return a placeholder service URL instead
      return `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(sku || 'Product')}`;
    }
    return imageUrl;
  }

  /**
   * Normalize a product from any provider to a unified format
   */
  normalizeProduct(product, provider) {
    switch (provider) {
      case 'AutoPartsPlus':
        return this.normalizeAutoPartsPlus(product);
      case 'RepuestosMax':
        return this.normalizeRepuestosMax(product);
      case 'GlobalParts':
        return this.normalizeGlobalParts(product);
      default:
        return null;
    }
  }

  normalizeAutoPartsPlus(product) {
    if (!product) return null;
    
    const sku = product.sku || '';
    const imageUrl = (product.img_urls && product.img_urls.length > 0) ? product.img_urls[0] : '';
    
    return {
      sku: sku,
      name: product.title || product.name || '',
      description: product.desc || product.description || '',
      price: parseFloat(product.unit_price || product.unitPrice || product.price || 0),
      stock: parseInt(product.qty_available || product.stock || 0),
      provider: 'AutoPartsPlus',
      brand: product.brand_name || product.brand || '',
      model: (product.fits_vehicles && product.fits_vehicles.length > 0) ? product.fits_vehicles[0].split(' ')[1] || '' : '',
      year: (product.fits_vehicles && product.fits_vehicles.length > 0) ? this.extractYear(product.fits_vehicles[0]) : '',
      category: product.category_name || product.category || '',
      imageUrl: this.getValidImageUrl(imageUrl, sku),
      availability: parseInt(product.qty_available || 0) > 0
    };
  }

  normalizeRepuestosMax(product) {
    if (!product) return null;
    
    // Extract vehicle info from first compatible vehicle
    let model = '';
    let year = '';
    if (product.compatibilidad && product.compatibilidad.vehiculos && product.compatibilidad.vehiculos.length > 0) {
      const firstVehicle = product.compatibilidad.vehiculos[0];
      model = firstVehicle.modelo || '';
      year = firstVehicle.anios ? `${firstVehicle.anios.desde}-${firstVehicle.anios.hasta}` : '';
    }
    
    const sku = product.identificacion?.sku || '';
    const imageUrl = (product.multimedia?.imagenes && product.multimedia.imagenes.length > 0) ? product.multimedia.imagenes[0].url : '';
    
    return {
      sku: sku,
      name: product.informacionBasica?.nombre || '',
      description: product.informacionBasica?.descripcion || '',
      price: parseFloat(product.precio?.valor || 0),
      stock: parseInt(product.inventario?.cantidad || 0),
      provider: 'RepuestosMax',
      brand: product.informacionBasica?.marca?.nombre || '',
      model: model,
      year: year,
      category: product.informacionBasica?.categoria?.nombre || '',
      imageUrl: this.getValidImageUrl(imageUrl, sku),
      availability: product.inventario?.estado === 'disponible'
    };
  }

  normalizeGlobalParts(product) {
    if (!product) return null;
    
    // Extract SKU from nested structure
    const sku = product.ItemHeader?.ExternalReferences?.SKU?.Value || '';
    
    // Extract name from ProductDetails.NameInfo
    const name = product.ProductDetails?.NameInfo?.DisplayName || 
                 product.ProductDetails?.NameInfo?.ShortName || '';
    
    // Extract description from ProductDetails.Description
    const description = product.ProductDetails?.Description?.FullText || '';
    
    // Extract price from PricingInfo.ListPrice
    const price = parseFloat(product.PricingInfo?.ListPrice?.Amount || NaN);
    
    // Extract stock from AvailabilityInfo.QuantityInfo
    const stock = parseInt(product.AvailabilityInfo?.QuantityInfo?.AvailableQuantity || 0);
    
    // Extract brand from ProductDetails.BrandInfo
    const brand = product.ProductDetails?.BrandInfo?.BrandName || '';
    
    // Extract vehicle info from VehicleCompatibility
    let model = '';
    let year = '';
    if (product.VehicleCompatibility?.CompatibleVehicles && product.VehicleCompatibility.CompatibleVehicles.length > 0) {
      const firstVehicle = product.VehicleCompatibility.CompatibleVehicles[0];
      model = firstVehicle.Model?.Name;
      
      // Handle year range
      if (firstVehicle.YearRange) {
        const startYear = firstVehicle.YearRange.StartYear;
        const endYear = firstVehicle.YearRange.EndYear;
        year = startYear === endYear ? startYear.toString() : `${startYear}-${endYear}`;
      }
    }
    
    // Extract category from ProductDetails.CategoryInfo
    const category = product.ProductDetails?.CategoryInfo?.PrimaryCategory?.Name || '';
    
    // Extract primary image from MediaAssets.Images
    let imageUrl = product.MediaAssets?.Images?.[0]?.ImageUrl || '';
    
    
    return {
      sku: sku,
      name: name,
      description: description,
      price: price,
      stock: stock,
      provider: 'GlobalParts',
      brand: brand,
      model: model,
      year: year,
      category: category,
      imageUrl: this.getValidImageUrl(imageUrl, sku),
      availability: stock > 0
    };
  }

  /**
   * Normalize catalog response from a provider
   */
  normalizeCatalog(providerResponse) {
    if (!providerResponse.success || !providerResponse.data) {
      return {
        provider: providerResponse.provider,
        products: [],
        success: false
      };
    }

    const { provider, data } = providerResponse;
    let products = [];

    // Extract products array based on provider-specific structure
    if (provider === 'AutoPartsPlus') {
      products = data.parts || [];
    } else if (provider === 'RepuestosMax') {
      products = data.productos || [];
    } else if (provider === 'GlobalParts') {
      // GlobalParts has ResponseEnvelope structure
      if (data.ResponseEnvelope && data.ResponseEnvelope.Body) {
        products = data.ResponseEnvelope.Body.CatalogListing.Items || [];
      }
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const normalizedProducts = products
      .map(product => this.normalizeProduct(product, provider))
      .filter(product => product !== null);

    return {
      provider,
      products: normalizedProducts,
      success: true,
      total: data.total || data.pagination?.total || normalizedProducts.length
    };
  }

  /**
   * Merge products from multiple providers by SKU
   */
  mergeProductsBySku(normalizedCatalogs) {
    const productMap = new Map();

    normalizedCatalogs.forEach(catalog => {
      if (!catalog.success) return;

      catalog.products.forEach(product => {
        const sku = product.sku;
        if (!sku) return;

        if (productMap.has(sku)) {
          const existing = productMap.get(sku);
          // Add provider offer
          existing.offers.push({
            provider: product.provider,
            price: product.price,
            stock: product.stock,
            availability: product.availability
          });
          // Update min/max prices
          existing.minPrice = Math.min(existing.minPrice, product.price);
          existing.maxPrice = Math.max(existing.maxPrice, product.price);
          // Sum total stock
          existing.totalStock += product.stock;
        } else {
          productMap.set(sku, {
            sku: product.sku,
            name: product.name,
            description: product.description,
            brand: product.brand,
            model: product.model,
            year: product.year,
            category: product.category,
            imageUrl: product.imageUrl,
            minPrice: product.price,
            maxPrice: product.price,
            totalStock: product.stock,
            offers: [{
              provider: product.provider,
              price: product.price,
              stock: product.stock,
              availability: product.availability
            }]
          });
        }
      });
    });

    return Array.from(productMap.values());
  }

  /**
   * Filter products by search criteria
   */
  filterProducts(products, filters = {}) {
    let filtered = [...products];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower)) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
        (p.brand && p.brand.toLowerCase().includes(searchLower))
      );
    }

    // Brand filter
    if (filters.brand) {
      const brandLower = filters.brand.toLowerCase();
      filtered = filtered.filter(p => 
        p.brand && p.brand.toLowerCase().includes(brandLower)
      );
    }

    // Model filter
    if (filters.model) {
      const modelLower = filters.model.toLowerCase();
      filtered = filtered.filter(p => 
        p.model && p.model.toLowerCase().includes(modelLower)
      );
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(p => 
        p.year && p.year.toString() === filters.year.toString()
      );
    }

    return filtered;
  }

  /**
   * Paginate products
   */
  paginateProducts(products, page = 1, limit = 20) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    return {
      products: products.slice(startIndex, endIndex),
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: products.length,
        totalPages: Math.ceil(products.length / limit),
        hasNextPage: endIndex < products.length,
        hasPrevPage: page > 1
      }
    };
  }
}

module.exports = new NormalizationService();

