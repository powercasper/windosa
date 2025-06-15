// Client-side service for server-based pricing calculations
// This replaces all local client calculations with server API calls
import { withPerformanceMonitoring, performanceMonitor } from '../utils/performanceMonitor';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

class PricingService {
  
  // Calculate pricing for a single item configuration
  static calculateItem = withPerformanceMonitoring(async (item) => {
    const response = await fetch(`${API_BASE}/api/quotes/calculate-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ item })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
  }, '/api/quotes/calculate-item');

  // Calculate quote totals with additional costs and margins
  static calculateQuoteTotals = withPerformanceMonitoring(async (items, additionalCosts = {}) => {
    const response = await fetch(`${API_BASE}/api/quotes/calculate-quote-totals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items, additionalCosts })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
  }, '/api/quotes/calculate-quote-totals');

  // Calculate metrics for a specific system type
  static calculateTypeMetrics = withPerformanceMonitoring(async (items, systemType, additionalCosts = {}) => {
    const response = await fetch(`${API_BASE}/api/quotes/calculate-type-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items, systemType, additionalCosts })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
  }, '/api/quotes/calculate-type-metrics');

  // Calculate final prices for all items (for PDF generation)
  static calculateItemFinalPrices = withPerformanceMonitoring(async (items, additionalCosts = {}) => {
    const response = await fetch(`${API_BASE}/api/quotes/calculate-item-final-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items, additionalCosts })
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
  }, '/api/quotes/calculate-item-final-prices');

  // Batch calculate multiple system type metrics
  static async calculateAllTypeMetrics(items, additionalCosts = {}) {
    const systemTypes = ['Windows', 'Entrance Doors', 'Sliding Doors'];
    
    try {
      const promises = systemTypes.map(type => 
        this.calculateTypeMetrics(items, type, additionalCosts)
      );
      
      const results = await Promise.all(promises);
      
      // Return as object keyed by system type
      return systemTypes.reduce((acc, type, index) => {
        acc[type] = results[index];
        return acc;
      }, {});
    } catch (error) {
      console.error('Error calculating all type metrics:', error);
      throw error;
    }
  }
}

export default PricingService; 