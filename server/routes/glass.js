const express = require('express');
const router = express.Router();
const {
  getAllGlassOptions,
  getAllGlassOptionsWithArea,
  getGlassByCategory,
  getGlassByType,
  getPremiumGlassOptions,
  getStandardGlassOptions,
  getGlassCategories,
  searchGlass,
  filterGlassByPrice,
  filterGlassByClimate,
  iguConfigurationData,
  calculateIguPrice
} = require('../db/glassDatabase');

// GET /api/glass - Get all glass options
router.get('/', (req, res) => {
  try {
    const allGlass = getAllGlassOptions();
    res.json({
      success: true,
      data: allGlass,
      count: Object.keys(allGlass).length
    });
  } catch (error) {
    console.error('Error fetching all glass options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glass options'
    });
  }
});

// GET /api/glass/with-area - Get all glass options with area-based pricing
router.get('/with-area', (req, res) => {
  try {
    const { areaSqm, panelInfo } = req.query;
    
    if (!areaSqm || isNaN(areaSqm)) {
      return res.status(400).json({
        success: false,
        error: 'Valid areaSqm parameter is required'
      });
    }
    
    const area = parseFloat(areaSqm);
    let panelData = null;
    
    // Parse panel info if provided (for sliding doors)
    if (panelInfo) {
      try {
        panelData = JSON.parse(panelInfo);
      } catch (e) {
        console.warn('Invalid panelInfo JSON:', panelInfo);
      }
    }
    
    const allGlass = getAllGlassOptionsWithArea(area, panelData);
    
    // Calculate surcharge info based on panel data or total area
    let surchargeInfo = {
      applied: false,
      percentage: 0,
      reason: null
    };
    
    if (panelData && panelData.panels && panelData.panels.length > 0) {
      // For sliding doors and windows: check each panel size individually
      const maxPanelAreaSqm = Math.max(...panelData.panels.map(panel => {
        const panelWidthInches = panel.width || (panelData.totalWidth / panelData.panels.length);
        const panelHeightInches = panelData.totalHeight;
        const panelAreaSqIn = panelWidthInches * panelHeightInches;
        return panelAreaSqIn * 0.00064516; // Convert to sqm
      }));
      
      if (maxPanelAreaSqm > 6) {
        surchargeInfo = {
          applied: true,
          percentage: 50,
          reason: `Panel over 6 sqm (${maxPanelAreaSqm.toFixed(2)} sqm)`
        };
      } else if (maxPanelAreaSqm > 4) {
        surchargeInfo = {
          applied: true,
          percentage: 30,
          reason: `Panel over 4 sqm (${maxPanelAreaSqm.toFixed(2)} sqm)`
        };
      }
    } else {
      // For other systems: use total area
      surchargeInfo = {
        applied: area > 4,
        percentage: area > 6 ? 50 : area > 4 ? 30 : 0,
        reason: area > 6 ? 'Glass over 6 sqm' : area > 4 ? 'Glass over 4 sqm' : null
      };
    }
    
    res.json({
      success: true,
      data: allGlass,
      count: Object.keys(allGlass).length,
      areaSqm: area,
      largeIguSurcharge: surchargeInfo
    });
  } catch (error) {
    console.error('Error fetching glass options with area:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glass options with area'
    });
  }
});

// GET /api/glass/premium - Get premium glass options only
router.get('/premium', (req, res) => {
  try {
    const premiumGlass = getPremiumGlassOptions();
    res.json({
      success: true,
      data: premiumGlass,
      count: Object.keys(premiumGlass).length
    });
  } catch (error) {
    console.error('Error fetching premium glass options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch premium glass options'
    });
  }
});

// GET /api/glass/standard - Get standard glass options only
router.get('/standard', (req, res) => {
  try {
    const standardGlass = getStandardGlassOptions();
    res.json({
      success: true,
      data: standardGlass,
      count: Object.keys(standardGlass).length
    });
  } catch (error) {
    console.error('Error fetching standard glass options:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch standard glass options'
    });
  }
});

// GET /api/glass/categories - Get all glass categories
router.get('/categories', (req, res) => {
  try {
    const categories = getGlassCategories();
    res.json({
      success: true,
      data: categories,
      count: Object.keys(categories).length
    });
  } catch (error) {
    console.error('Error fetching glass categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glass categories'
    });
  }
});

// GET /api/glass/category/:categoryName - Get glass by category
router.get('/category/:categoryName', (req, res) => {
  try {
    const { categoryName } = req.params;
    const decodedCategory = decodeURIComponent(categoryName);
    const glassOptions = getGlassByCategory(decodedCategory);
    
    if (glassOptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No glass options found for category: ${decodedCategory}`
      });
    }
    
    res.json({
      success: true,
      data: glassOptions,
      category: decodedCategory,
      count: glassOptions.length
    });
  } catch (error) {
    console.error('Error fetching glass by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glass by category'
    });
  }
});

// GET /api/glass/type/:glassType - Get specific glass by type
router.get('/type/:glassType', (req, res) => {
  try {
    const { glassType } = req.params;
    const decodedType = decodeURIComponent(glassType);
    const glass = getGlassByType(decodedType);
    
    if (!glass) {
      return res.status(404).json({
        success: false,
        error: `Glass type '${decodedType}' not found`
      });
    }
    
    res.json({
      success: true,
      data: glass
    });
  } catch (error) {
    console.error('Error fetching glass by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glass by type'
    });
  }
});

// GET /api/glass/search - Search glass options
router.get('/search', (req, res) => {
  try {
    const { q, query } = req.query;
    const searchQuery = q || query;
    
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required. Use ?q=searchterm or ?query=searchterm'
      });
    }
    
    const results = searchGlass(searchQuery);
    
    res.json({
      success: true,
      data: results,
      query: searchQuery,
      count: results.length
    });
  } catch (error) {
    console.error('Error searching glass:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search glass options'
    });
  }
});

// GET /api/glass/filter/price - Filter glass by price range
router.get('/filter/price', (req, res) => {
  try {
    const { min, max } = req.query;
    
    if (!min || !max) {
      return res.status(400).json({
        success: false,
        error: 'Both min and max price parameters are required'
      });
    }
    
    const minPrice = parseFloat(min);
    const maxPrice = parseFloat(max);
    
    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({
        success: false,
        error: 'Price parameters must be valid numbers'
      });
    }
    
    if (minPrice > maxPrice) {
      return res.status(400).json({
        success: false,
        error: 'Minimum price cannot be greater than maximum price'
      });
    }
    
    const results = filterGlassByPrice(minPrice, maxPrice);
    
    res.json({
      success: true,
      data: results,
      filters: { minPrice, maxPrice },
      count: results.length
    });
  } catch (error) {
    console.error('Error filtering glass by price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter glass by price'
    });
  }
});

// GET /api/glass/filter/climate - Filter glass by climate zone
router.get('/filter/climate', (req, res) => {
  try {
    const { zone } = req.query;
    
    if (!zone) {
      return res.status(400).json({
        success: false,
        error: 'Climate zone parameter is required. Use ?zone=Hot|Mixed|Cold|Mild'
      });
    }
    
    const validZones = ['Hot', 'Mixed', 'Cold', 'Mild'];
    if (!validZones.includes(zone)) {
      return res.status(400).json({
        success: false,
        error: `Invalid climate zone. Valid zones are: ${validZones.join(', ')}`
      });
    }
    
    const results = filterGlassByClimate(zone);
    
    res.json({
      success: true,
      data: results,
      climateZone: zone,
      count: results.length
    });
  } catch (error) {
    console.error('Error filtering glass by climate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter glass by climate'
    });
  }
});

// GET /api/glass/health - Health check endpoint
router.get('/health', (req, res) => {
  try {
    const allGlass = getAllGlassOptions();
    const premiumGlass = getPremiumGlassOptions();
    const standardGlass = getStandardGlassOptions();
    const categories = getGlassCategories();
    
    res.json({
      success: true,
      status: 'healthy',
      data: {
        totalGlassOptions: Object.keys(allGlass).length,
        premiumOptions: Object.keys(premiumGlass).length,
        standardOptions: Object.keys(standardGlass).length,
        categories: Object.keys(categories).length,
        availableGlassTypes: Object.keys(allGlass),
        availableCategories: Object.keys(categories)
      }
    });
  } catch (error) {
    console.error('Glass API health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Glass API health check failed'
    });
  }
});

// GET /api/glass/igu-config - Get IGU configuration data
router.get('/igu-config', (req, res) => {
  try {
    res.json({
      success: true,
      data: iguConfigurationData
    });
  } catch (error) {
    console.error('Error fetching IGU configuration data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IGU configuration data'
    });
  }
});

// POST /api/glass/igu-price - Calculate IGU price
router.post('/igu-price', (req, res) => {
  try {
    const { configuration, dimensions } = req.body;
    
    if (!configuration || !dimensions) {
      return res.status(400).json({
        success: false,
        error: 'Configuration and dimensions are required'
      });
    }
    
    const priceCalculation = calculateIguPrice(configuration, dimensions);
    
    if (!priceCalculation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dimensions provided'
      });
    }
    
    res.json({
      success: true,
      data: priceCalculation
    });
  } catch (error) {
    console.error('Error calculating IGU price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate IGU price'
    });
  }
});

module.exports = router; 