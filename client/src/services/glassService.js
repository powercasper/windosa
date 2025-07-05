// Client-side Glass Service
// Fetches glass data from server API with fallback to local data

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5001/api';

// Fallback glass data (simplified version for emergencies)
const fallbackGlassData = {
  'SKN 183': { id: 'skn-183', productCode: 'SKN 183', type: 'SKN 183 High Performance', price: 22.50 },
  'SKN 154': { id: 'skn-154', productCode: 'SKN 154', type: 'SKN 154 Balanced Performance', price: 20.75 },
  '70/33': { id: '70-33', productCode: '70/33', type: 'XTREME 70/33 Maximum Light', price: 23.00 },
  '61-29': { id: '61-29', productCode: '61-29', type: 'XTREME 61-29 Balanced', price: 21.50 },
  '50-22': { id: '50-22', productCode: '50-22', type: 'XTREME 50-22 Solar Control', price: 24.25 },
  'Double Pane': { id: 'double-pane', productCode: 'Standard Double Pane', type: 'Double Pane', price: 12.50 },
  'Triple Pane': { id: 'triple-pane', productCode: 'Standard Triple Pane', type: 'Triple Pane', price: 18.75 }
};

class GlassService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Helper method to make API requests
  async apiRequest(endpoint) {
    const cacheKey = endpoint;
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/glass${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.warn(`Glass API request failed for ${endpoint}:`, error);
      
      // Return fallback data for basic endpoints
      if (endpoint === '' || endpoint === '/') {
        return {
          success: true,
          data: fallbackGlassData,
          fallback: true
        };
      }
      
      throw error;
    }
  }

  // Get all glass options
  async getAllGlassOptions(areaSqm = null, panelInfo = null) {
    try {
      let url = '';
      if (areaSqm && areaSqm > 0) {
        url = `/with-area?areaSqm=${areaSqm}`;
        if (panelInfo) {
          url += `&panelInfo=${encodeURIComponent(JSON.stringify(panelInfo))}`;
        }
      }
      
      const response = await this.apiRequest(url);
      return response.data;
    } catch (error) {
      console.warn('Glass options request failed:', error);
      // Return fallback glass data
      return {
        'SKN 183': {
          id: 'skn-183',
          productCode: 'SKN 183',
          type: 'SKN 183 High Performance',
          category: 'High Performance Glazing',
          price: 13.25, // Updated to match factory pricing (supplier $10.60 + 25% markup)
          specifications: {
            lightTransmittance: 68,
            solarHeatGainCoefficient: 0.36,
            thermalTransmission: '0.2 W/m²K',
            acousticRating: 'Rw 33(-1;-5) dB',
            energyRating: 'A+'
          },
          description: 'Premium high-performance glass with excellent thermal and acoustic properties.'
        },
        'Double Pane': {
          id: 'double-pane',
          productCode: 'Standard Double Pane',
          type: 'Double Pane',
          category: 'Standard Glazing',
          price: 12.00, // Keep standard price
          specifications: {
            lightTransmittance: 82,
            solarHeatGainCoefficient: 0.76,
            thermalTransmission: '2.8 W/m²K',
            acousticRating: 'Rw 28 dB',
            energyRating: 'C'
          },
          description: 'Standard double pane insulated glass unit for basic applications.'
        }
      };
    }
  }

  // Get glass options with area-based pricing
  async getGlassOptionsWithArea(areaSqm) {
    try {
      const response = await this.apiRequest(`/with-area?areaSqm=${areaSqm}`);
      return response.data;
    } catch (error) {
      console.warn('Glass options with area request failed:', error);
      throw error;
    }
  }

  // Get premium glass options only
  async getPremiumGlassOptions() {
    try {
      const response = await this.apiRequest('/premium');
      return response.data;
    } catch (error) {
      console.warn('Falling back to local premium glass data:', error);
      const { 'Double Pane': _, 'Triple Pane': __, ...premium } = fallbackGlassData;
      return premium;
    }
  }

  // Get standard glass options only
  async getStandardGlassOptions() {
    try {
      const response = await this.apiRequest('/standard');
      return response.data;
    } catch (error) {
      console.warn('Falling back to local standard glass data:', error);
      return {
        'Double Pane': fallbackGlassData['Double Pane'],
        'Triple Pane': fallbackGlassData['Triple Pane']
      };
    }
  }

  // Get glass categories
  async getGlassCategories() {
    try {
      const response = await this.apiRequest('/categories');
      return response.data;
    } catch (error) {
      console.warn('Glass categories request failed:', error);
      return {};
    }
  }

  // Get glass by category
  async getGlassByCategory(category) {
    try {
      const encodedCategory = encodeURIComponent(category);
      const response = await this.apiRequest(`/category/${encodedCategory}`);
      return response.data;
    } catch (error) {
      console.warn(`Glass by category request failed for ${category}:`, error);
      return [];
    }
  }

  // Get specific glass by type
  async getGlassByType(glassType) {
    try {
      const encodedType = encodeURIComponent(glassType);
      const response = await this.apiRequest(`/type/${encodedType}`);
      return response.data;
    } catch (error) {
      console.warn(`Glass by type request failed for ${glassType}:`, error);
      return fallbackGlassData[glassType] || null;
    }
  }

  // Search glass options
  async searchGlass(query) {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await this.apiRequest(`/search?q=${encodedQuery}`);
      return response.data;
    } catch (error) {
      console.warn(`Glass search failed for ${query}:`, error);
      // Simple fallback search
      const lowercaseQuery = query.toLowerCase();
      const results = Object.values(fallbackGlassData).filter(glass =>
        glass.productCode.toLowerCase().includes(lowercaseQuery) ||
        glass.type.toLowerCase().includes(lowercaseQuery)
      );
      return results;
    }
  }

  // Filter glass by price range
  async filterGlassByPrice(minPrice, maxPrice) {
    try {
      const response = await this.apiRequest(`/filter/price?min=${minPrice}&max=${maxPrice}`);
      return response.data;
    } catch (error) {
      console.warn(`Glass price filter failed for ${minPrice}-${maxPrice}:`, error);
      // Simple fallback filter
      const results = Object.values(fallbackGlassData).filter(glass =>
        glass.price >= minPrice && glass.price <= maxPrice
      );
      return results;
    }
  }

  // Filter glass by climate zone
  async filterGlassByClimate(climateZone) {
    try {
      const response = await this.apiRequest(`/filter/climate?zone=${climateZone}`);
      return response.data;
    } catch (error) {
      console.warn(`Glass climate filter failed for ${climateZone}:`, error);
      return [];
    }
  }

  // Get IGU configuration data
  async getIguConfigurationData() {
    try {
      const response = await this.apiRequest('/igu-config');
      return response.data;
    } catch (error) {
      console.warn('IGU configuration data request failed:', error);
      // Return fallback IGU configuration data
      return {
        basePrice: 27.98,
        exchangeRate: 1.18,
        exteriorCoatings: [
          { id: 'None', name: 'None', surcharge: 0 },
          { id: 'SKN_165', name: 'Cool-Lite SKN 165', surcharge: 36.35 },
          { id: 'SKN_176', name: 'Cool-Lite SKN 176', surcharge: 36.35 },
          { id: 'SKN_183', name: 'Cool-Lite SKN 183', surcharge: 36.35 },
          { id: 'XTREME_61_29', name: 'Cool-Lite XTREME 61/29', surcharge: 37.85 },
          { id: 'XTREME_70_33', name: 'Cool-Lite XTREME 70/33', surcharge: 37.85 },
        ],
        spacers: [
          { id: 'SWISSPACER_AD_GREY', name: 'SWISSPACER AD: titan-grey; black', surcharge: 1.50 },
          { id: 'SWISSPACER_AD_BROWN', name: 'SWISSPACER AD: light brown, dark brown, white', surcharge: 2.50 },
          { id: 'SWISSPACER_ULTIMATE_GREY', name: 'SWISSPACER ULTIMATE: titan-grey; black', surcharge: 2.50 },
        ],
        interiorGlass: [
          { id: 'PLANITHERM_XN_4MM', name: 'PLANITHERM XN 4mm (Ug=1.1)', surcharge: 20.72 },
          { id: 'PLANITHERM_XN_6MM', name: 'PLANITHERM XN 6mm (Ug=1.1)', surcharge: 28.34 },
          { id: 'PLANITHERM_XN_8MM', name: 'PLANITHERM XN 8mm (Ug=1.1)', surcharge: 38.86 },
          { id: 'PLANITHERM_XN_10MM', name: 'PLANITHERM XN 10mm (Ug=1.1)', surcharge: 38.48 },
          { id: 'PLANITHERM_ONE_4MM', name: 'PLANITHERM ONE 4mm (Ug=1.0)', surcharge: 39.99 },
          { id: 'PLANITHERM_ONE_6MM', name: 'PLANITHERM ONE 6mm (Ug=1.0)', surcharge: 43.32 },
        ],
        defaultConfiguration: {
          type: 'Double',
          composition: 'sgg CLIMAPLUS ECLAZ',
          exteriorThickness: 6,
          exteriorCoating: 'None',
          spacer: 'SWISSPACER_AD_GREY',
          interiorGlass: 'PLANITHERM_XN_4MM'
        }
      };
    }
  }

  // Calculate IGU price
  async calculateIguPrice(configuration, dimensions) {
    try {
      const response = await fetch(`${API_BASE_URL}/glass/igu-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuration, dimensions })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'IGU price calculation failed');
      }

      return result.data;
    } catch (error) {
      console.warn('IGU price calculation request failed:', error);
      throw error;
    }
  }

  // Check API health
  async checkHealth() {
    try {
      const response = await this.apiRequest('/health');
      return response;
    } catch (error) {
      console.warn('Glass API health check failed:', error);
      return { success: false, status: 'unhealthy', error: error.message };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache status
  getCacheStatus() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

// Create and export singleton instance
const glassService = new GlassService();

export default glassService;

// Named exports for convenience
export const {
  getAllGlassOptions,
  getPremiumGlassOptions,
  getStandardGlassOptions,
  getGlassCategories,
  getGlassByCategory,
  getGlassByType,
  searchGlass,
  filterGlassByPrice,
  filterGlassByClimate,
  checkHealth,
  clearCache,
  getCacheStatus,
  getGlassOptionsWithArea
} = glassService; 