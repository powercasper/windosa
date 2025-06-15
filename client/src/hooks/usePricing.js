import { useState, useEffect, useCallback } from 'react';
import PricingService from '../services/pricingService';

// Custom hook for server-side pricing calculations
// This replaces all local pricing logic with server API calls
export const usePricing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate pricing for a single item
  const calculateItem = useCallback(async (item) => {
    if (!item || !item.systemType) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await PricingService.calculateItem(item);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error in calculateItem:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate quote totals
  const calculateQuoteTotals = useCallback(async (items, additionalCosts = {}) => {
    if (!items || items.length === 0) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await PricingService.calculateQuoteTotals(items, additionalCosts);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error in calculateQuoteTotals:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate type-specific metrics
  const calculateTypeMetrics = useCallback(async (items, systemType, additionalCosts = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await PricingService.calculateTypeMetrics(items, systemType, additionalCosts);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error in calculateTypeMetrics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate all type metrics at once
  const calculateAllTypeMetrics = useCallback(async (items, additionalCosts = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await PricingService.calculateAllTypeMetrics(items, additionalCosts);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error in calculateAllTypeMetrics:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate final prices for PDF generation
  const calculateItemFinalPrices = useCallback(async (items, additionalCosts = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await PricingService.calculateItemFinalPrices(items, additionalCosts);
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error in calculateItemFinalPrices:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    calculateItem,
    calculateQuoteTotals,
    calculateTypeMetrics,
    calculateAllTypeMetrics,
    calculateItemFinalPrices
  };
};

// Hook for real-time item pricing (with debouncing)
export const useItemPricing = (item, debounceMs = 300) => {
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!item || !item.systemType || !item.dimensions || !item.glassType) {
      setPricing(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await PricingService.calculateItem(item);
        setPricing(result);
      } catch (err) {
        setError(err.message);
        setPricing(null);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [item, debounceMs]);

  return { pricing, loading, error };
};

// MIGRATION: Hook for server-side quote totals calculation
export const useQuoteTotals = (quoteItems, additionalCosts = {}) => {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateQuoteTotals = async () => {
      if (!quoteItems || quoteItems.length === 0) {
        setTotals(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await PricingService.calculateQuoteTotals(quoteItems, additionalCosts);
        setTotals(result);
        console.log('🔄 Quote totals calculated server-side:', result);
      } catch (err) {
        console.error('❌ Server-side quote totals failed:', err);
        setError(err.message);
        // Fallback to null - component can handle client-side calculation
        setTotals(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the calculation
    const timeoutId = setTimeout(calculateQuoteTotals, 300);
    return () => clearTimeout(timeoutId);
  }, [quoteItems, additionalCosts.tariff, additionalCosts.shipping, additionalCosts.delivery, additionalCosts.margin]);

  return { totals, loading, error };
};

// MIGRATION: Hook for server-side type metrics calculation  
export const useTypeMetrics = (quoteItems, systemType, additionalCosts = {}) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateTypeMetrics = async () => {
      if (!quoteItems || quoteItems.length === 0 || !systemType) {
        setMetrics(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await PricingService.calculateTypeMetrics(quoteItems, systemType, additionalCosts);
        setMetrics(result);
        console.log(`🔄 ${systemType} metrics calculated server-side:`, result);
      } catch (err) {
        console.error(`❌ Server-side ${systemType} metrics failed:`, err);
        setError(err.message);
        // Fallback to null - component can handle client-side calculation
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the calculation  
    const timeoutId = setTimeout(calculateTypeMetrics, 300);
    return () => clearTimeout(timeoutId);
  }, [quoteItems, systemType, additionalCosts.tariff, additionalCosts.shipping, additionalCosts.delivery, additionalCosts.margin]);

  return { metrics, loading, error };
}; 