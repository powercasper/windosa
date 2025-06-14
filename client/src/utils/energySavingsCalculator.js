// Energy Savings Calculator for Glass Performance
// Calculates annual cost savings, ROI, and climate-specific impact

// Climate zone data and energy costs
const climateZones = {
  'Hot': {
    name: 'Hot Climate (Zone 1-2)',
    coolingDays: 150,
    heatingDays: 30,
    avgElectricityCost: 0.13, // $/kWh
    avgGasCost: 1.20, // $/therm
    description: 'Hot summers, mild winters'
  },
  'Mixed': {
    name: 'Mixed Climate (Zone 3-4)',
    coolingDays: 90,
    heatingDays: 120,
    avgElectricityCost: 0.12,
    avgGasCost: 1.15,
    description: 'Moderate seasons'
  },
  'Cold': {
    name: 'Cold Climate (Zone 5-8)',
    coolingDays: 45,
    heatingDays: 180,
    avgElectricityCost: 0.11,
    avgGasCost: 1.10,
    description: 'Cold winters, mild summers'
  }
};

// Default climate zone if not specified
const DEFAULT_CLIMATE = 'Mixed';

// Energy performance calculations
const calculateEnergyPerformance = (glass, glassArea, climateZone = DEFAULT_CLIMATE) => {
  const climate = climateZones[climateZone] || climateZones[DEFAULT_CLIMATE];
  
  // Base energy consumption calculations (simplified model)
  // These are industry-standard approximations
  const baseHeatingLoad = glassArea * 15; // BTU/hr per sq ft (winter)
  const baseCoolingLoad = glassArea * 25; // BTU/hr per sq ft (summer)
  
  // Glass performance factors
  const uValue = glass.specifications?.thermalTransmission || 0.5; // Default for legacy glass
  const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6; // Default for legacy glass
  
  // Heating energy (lower U-value = better insulation)
  const heatingEnergyUse = (baseHeatingLoad * uValue * climate.heatingDays * 24) / 100000; // therms
  const heatingCost = heatingEnergyUse * climate.avgGasCost;
  
  // Cooling energy (lower SHGC = less solar heat gain)
  const coolingEnergyUse = (baseCoolingLoad * shgc * climate.coolingDays * 24) / 3412; // kWh
  const coolingCost = coolingEnergyUse * climate.avgElectricityCost;
  
  return {
    heating: {
      energyUse: heatingEnergyUse,
      cost: heatingCost
    },
    cooling: {
      energyUse: coolingEnergyUse,
      cost: coolingCost
    },
    totalAnnualCost: heatingCost + coolingCost,
    climate: climate
  };
};

// Compare two glass options and calculate savings
export const calculateGlassSavings = (baselineGlass, upgradeGlass, glassArea, climateZone = DEFAULT_CLIMATE) => {
  const baselinePerformance = calculateEnergyPerformance(baselineGlass, glassArea, climateZone);
  const upgradePerformance = calculateEnergyPerformance(upgradeGlass, glassArea, climateZone);
  
  const annualSavings = baselinePerformance.totalAnnualCost - upgradePerformance.totalAnnualCost;
  const glassCostDifference = (upgradeGlass.price - baselineGlass.price) * glassArea;
  
  // ROI calculation
  const paybackPeriod = glassCostDifference > 0 ? glassCostDifference / Math.max(annualSavings, 1) : 0;
  const tenYearSavings = (annualSavings * 10) - glassCostDifference;
  
  return {
    baseline: {
      glass: baselineGlass,
      performance: baselinePerformance
    },
    upgrade: {
      glass: upgradeGlass,
      performance: upgradePerformance
    },
    savings: {
      annual: annualSavings,
      tenYear: tenYearSavings,
      glassCostDifference: glassCostDifference,
      paybackPeriod: paybackPeriod,
      roiPercentage: glassCostDifference > 0 ? (annualSavings / glassCostDifference) * 100 : 0
    },
    climate: baselinePerformance.climate
  };
};

// Get smart glass recommendations based on project requirements
export const getGlassRecommendations = (glassOptions, projectRequirements = {}) => {
  const {
    climateZone = DEFAULT_CLIMATE,
    priority = 'balanced', // 'cost', 'performance', 'balanced'
    glassArea = 100
  } = projectRequirements;
  
  // Find baseline (typically Double Pane for comparison)
  const baseline = glassOptions.find(g => g.type === 'Double Pane') || glassOptions[0];
  
  // Calculate savings for all glass options
  const recommendations = glassOptions
    .filter(glass => glass.id !== baseline.id) // Exclude baseline
    .map(glass => calculateGlassSavings(baseline, glass, glassArea, climateZone))
    .sort((a, b) => {
      // Sort based on priority
      switch (priority) {
        case 'cost':
          return a.savings.paybackPeriod - b.savings.paybackPeriod;
        case 'performance':
          return b.savings.annual - a.savings.annual;
        default: // balanced
          return (b.savings.annual / Math.max(a.savings.paybackPeriod, 1)) - 
                 (a.savings.annual / Math.max(b.savings.paybackPeriod, 1));
      }
    });
  
  return {
    baseline,
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
    climateZone,
    priority
  };
};

// Format savings for display
export const formatSavings = (savings) => {
  return {
    annual: `$${Math.abs(savings.annual).toFixed(0)}`,
    tenYear: `$${Math.abs(savings.tenYear).toFixed(0)}`,
    paybackPeriod: savings.paybackPeriod > 0 ? `${savings.paybackPeriod.toFixed(1)} years` : 'Immediate',
    roiPercentage: `${savings.roiPercentage.toFixed(1)}%`,
    isPositiveSavings: savings.annual > 0,
    costDifference: `$${Math.abs(savings.glassCostDifference).toFixed(0)}`
  };
};

// Climate zone detection (simplified - could be enhanced with zip code lookup)
export const detectClimateZone = (zipCode) => {
  // Simplified climate zone detection
  // In a real implementation, this would use a zip code database
  const zones = {
    'Hot': ['FL', 'TX', 'AZ', 'CA', 'NV'],
    'Cold': ['MN', 'WI', 'ME', 'VT', 'NH', 'MT', 'ND', 'SD'],
    'Mixed': [] // Default for everything else
  };
  
  // This is a placeholder - in reality you'd use proper zip code mapping
  return DEFAULT_CLIMATE;
};

export { climateZones };

export default {
  calculateGlassSavings,
  getGlassRecommendations,
  formatSavings,
  detectClimateZone,
  climateZones
}; 