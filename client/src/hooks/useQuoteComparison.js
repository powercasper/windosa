import { useState, useEffect, useMemo } from 'react';
import PricingService from '../services/pricingService';
import { performanceMonitor } from '../utils/performanceMonitor';

// Hook for comparing different pricing scenarios
export const useQuoteComparison = (baseQuoteItems) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  // Add a new scenario to compare
  const addScenario = (name, additionalCosts) => {
    const newScenario = {
      id: Date.now(),
      name,
      additionalCosts,
      results: null
    };
    setScenarios(prev => [...prev, newScenario]);
    return newScenario.id;
  };

  // Remove a scenario
  const removeScenario = (scenarioId) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== scenarioId));
  };

  // Update scenario costs
  const updateScenario = (scenarioId, newAdditionalCosts) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId 
        ? { ...scenario, additionalCosts: newAdditionalCosts }
        : scenario
    ));
  };

  // Calculate all scenarios
  const calculateComparison = async () => {
    if (!baseQuoteItems || baseQuoteItems.length === 0 || scenarios.length === 0) {
      return;
    }

    try {
      setLoading(true);
      performanceMonitor.trackUserAction('quote.comparison.calculate', { 
        scenarioCount: scenarios.length,
        itemCount: baseQuoteItems.length 
      });

      // Calculate all scenarios in parallel
      const promises = scenarios.map(async (scenario) => {
        try {
          const result = await PricingService.calculateQuoteTotals(baseQuoteItems, scenario.additionalCosts);
          return { ...scenario, results: result };
        } catch (error) {
          console.error(`Error calculating scenario ${scenario.name}:`, error);
          return { ...scenario, results: null, error: error.message };
        }
      });

      const updatedScenarios = await Promise.all(promises);
      setScenarios(updatedScenarios);

      // Generate comparison data
      const comparison = generateComparisonData(updatedScenarios);
      setComparisonData(comparison);

    } catch (error) {
      console.error('Error in quote comparison:', error);
      performanceMonitor.trackError(error, 'quote.comparison');
    } finally {
      setLoading(false);
    }
  };

  // Generate comparison analysis
  const generateComparisonData = (scenarios) => {
    const validScenarios = scenarios.filter(s => s.results);
    
    if (validScenarios.length === 0) return null;

    const totals = validScenarios.map(s => s.results.totals.grandTotal);
    const minTotal = Math.min(...totals);
    const maxTotal = Math.max(...totals);
    
    const bestScenario = validScenarios.find(s => s.results.totals.grandTotal === minTotal);
    const worstScenario = validScenarios.find(s => s.results.totals.grandTotal === maxTotal);

    return {
      summary: {
        scenarioCount: validScenarios.length,
        priceRange: {
          min: minTotal,
          max: maxTotal,
          difference: maxTotal - minTotal,
          differencePercent: ((maxTotal - minTotal) / minTotal * 100).toFixed(1)
        },
        bestScenario: bestScenario?.name,
        worstScenario: worstScenario?.name
      },
      scenarios: validScenarios.map(scenario => ({
        ...scenario,
        analysis: {
          totalPrice: scenario.results.totals.grandTotal,
          savingsVsWorst: worstScenario ? worstScenario.results.totals.grandTotal - scenario.results.totals.grandTotal : 0,
          premiumVsBest: bestScenario ? scenario.results.totals.grandTotal - bestScenario.results.totals.grandTotal : 0,
          rank: 0 // Will be calculated next
        }
      }))
        .sort((a, b) => a.analysis.totalPrice - b.analysis.totalPrice)
        .map((scenario, index) => ({
          ...scenario,
          analysis: {
            ...scenario.analysis,
            rank: index + 1
          }
        }))
    };
  };

  // Auto-calculate when scenarios or base items change
  useEffect(() => {
    if (scenarios.length > 0 && baseQuoteItems && baseQuoteItems.length > 0) {
      const timeoutId = setTimeout(calculateComparison, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [scenarios, baseQuoteItems]);

  // Export comparison results
  const exportComparison = () => {
    if (!comparisonData) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      baseItems: baseQuoteItems.length,
      ...comparisonData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-comparison-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    performanceMonitor.trackUserAction('quote.comparison.export');
  };

  // Generate quick comparison scenarios
  const generateQuickScenarios = () => {
    const baseMargin = 30;
    const quickScenarios = [
      { name: 'Conservative (Low Margin)', additionalCosts: { tariff: 0, shipping: 0, delivery: 0, margin: 20 } },
      { name: 'Standard (Current)', additionalCosts: { tariff: 0, shipping: 0, delivery: 0, margin: baseMargin } },
      { name: 'Premium (High Margin)', additionalCosts: { tariff: 0, shipping: 0, delivery: 0, margin: 40 } },
      { name: 'With Shipping & Tariff', additionalCosts: { tariff: 200, shipping: 150, delivery: 100, margin: baseMargin } }
    ];

    setScenarios(quickScenarios.map(scenario => ({
      id: Date.now() + Math.random(),
      ...scenario,
      results: null
    })));

    performanceMonitor.trackUserAction('quote.comparison.quickGenerate');
  };

  return {
    scenarios,
    loading,
    comparisonData,
    addScenario,
    removeScenario,
    updateScenario,
    calculateComparison,
    exportComparison,
    generateQuickScenarios
  };
}; 