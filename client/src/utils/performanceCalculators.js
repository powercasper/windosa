// Advanced Glass Performance Calculators
// Professional-grade calculations for thermal comfort, condensation, glare, and compliance

// Building codes and standards data
export const buildingCodes = {
  'IECC_2021': {
    name: 'International Energy Conservation Code 2021',
    zones: {
      '1': { maxUFactor: 1.2, maxSHGC: 0.25, description: 'Very Hot - Humid (1A), Very Hot - Dry (1B)' },
      '2': { maxUFactor: 0.65, maxSHGC: 0.25, description: 'Hot - Humid (2A), Hot - Dry (2B)' },
      '3': { maxUFactor: 0.50, maxSHGC: 0.25, description: 'Warm - Humid (3A), Warm - Dry (3B), Warm - Marine (3C)' },
      '4': { maxUFactor: 0.40, maxSHGC: 0.40, description: 'Mixed - Humid (4A), Mixed - Dry (4B), Mixed - Marine (4C)' },
      '5': { maxUFactor: 0.35, maxSHGC: 0.40, description: 'Cool - Humid (5A), Cool - Dry (5B), Cool - Marine (5C)' },
      '6': { maxUFactor: 0.35, maxSHGC: 0.40, description: 'Cold - Humid (6A), Cold - Dry (6B)' },
      '7': { maxUFactor: 0.35, maxSHGC: 0.40, description: 'Very Cold (7)' },
      '8': { maxUFactor: 0.35, maxSHGC: 0.40, description: 'Subarctic (8)' }
    }
  },
  'ENERGY_STAR': {
    name: 'ENERGY STAR Most Efficient 2024',
    zones: {
      'Northern': { maxUFactor: 0.22, maxSHGC: 0.40, description: 'Northern climates' },
      'North_Central': { maxUFactor: 0.25, maxSHGC: 0.40, description: 'North-Central climates' },
      'South_Central': { maxUFactor: 0.30, maxSHGC: 0.25, description: 'South-Central climates' },
      'Southern': { maxUFactor: 0.40, maxSHGC: 0.22, description: 'Southern climates' }
    }
  }
};

// Thermal comfort calculations
export const calculateThermalComfort = (glass, roomConditions = {}) => {
  const {
    interiorTemp = 70, // °F
    exteriorTemp = 32, // °F winter condition
    relativeHumidity = 40, // %
    glassArea = 100, // sq ft
    roomVolume = 1000 // cubic feet
  } = roomConditions;

  const uValue = glass.specifications?.thermalTransmission || 0.5;
  const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6;

  // Surface temperature calculation
  const deltaT = interiorTemp - exteriorTemp;
  const interiorSurfaceTemp = interiorTemp - (deltaT * uValue * 0.17); // Simplified calculation

  // Condensation risk assessment
  const dewPoint = calculateDewPoint(interiorTemp, relativeHumidity);
  const condensationRisk = interiorSurfaceTemp < dewPoint ? 'High' : 
                          interiorSurfaceTemp < dewPoint + 5 ? 'Medium' : 'Low';

  // Thermal comfort factors
  const radiantTemperatureEffect = Math.abs(interiorTemp - interiorSurfaceTemp);
  const comfortLevel = radiantTemperatureEffect < 3 ? 'Excellent' :
                      radiantTemperatureEffect < 6 ? 'Good' :
                      radiantTemperatureEffect < 10 ? 'Fair' : 'Poor';

  // Draft risk (simplified)
  const draftRisk = uValue > 0.4 ? 'High' : uValue > 0.3 ? 'Medium' : 'Low';

  return {
    interiorSurfaceTemp: Math.round(interiorSurfaceTemp * 10) / 10,
    condensationRisk,
    comfortLevel,
    draftRisk,
    dewPoint: Math.round(dewPoint * 10) / 10,
    radiantEffect: Math.round(radiantTemperatureEffect * 10) / 10
  };
};

// Dew point calculation helper
const calculateDewPoint = (temp, humidity) => {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
};

// Glare and visual comfort analysis
export const calculateVisualComfort = (glass, lightingConditions = {}) => {
  const {
    orientationFactor = 1.0, // 1.0 = south, 0.7 = east/west, 0.5 = north
    exteriorIlluminance = 100000, // lux (bright overcast day)
    desiredInteriorIlluminance = 500, // lux (office lighting)
    viewImportance = 'high' // high, medium, low
  } = lightingConditions;

  const lightTransmittance = glass.specifications?.lightTransmittance || 80;
  const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6;

  // Daylight calculations
  const interiorIlluminance = (exteriorIlluminance * lightTransmittance / 100) * orientationFactor * 0.1;
  
  // Glare assessment
  const glareRisk = interiorIlluminance > 10000 ? 'High' :
                   interiorIlluminance > 5000 ? 'Medium' : 'Low';

  // Daylight sufficiency
  const daylightSufficiency = interiorIlluminance > desiredInteriorIlluminance ? 'Excellent' :
                             interiorIlluminance > desiredInteriorIlluminance * 0.7 ? 'Good' :
                             interiorIlluminance > desiredInteriorIlluminance * 0.4 ? 'Fair' : 'Poor';

  // View quality (balance of light transmission and clarity)
  const viewQuality = lightTransmittance > 60 ? 'Excellent' :
                     lightTransmittance > 40 ? 'Good' :
                     lightTransmittance > 25 ? 'Fair' : 'Poor';

  // Recommended solutions
  const recommendations = [];
  if (glareRisk === 'High') {
    recommendations.push('Consider window treatments or exterior shading');
  }
  if (daylightSufficiency === 'Poor') {
    recommendations.push('Consider higher light transmittance glass or larger windows');
  }
  if (lightTransmittance < 30 && viewImportance === 'high') {
    recommendations.push('Consider glass with higher visual light transmittance');
  }

  return {
    interiorIlluminance: Math.round(interiorIlluminance),
    glareRisk,
    daylightSufficiency,
    viewQuality,
    recommendations
  };
};

// Building code compliance checker
export const checkCodeCompliance = (glass, buildingInfo = {}) => {
  const {
    code = 'IECC_2021',
    climateZone = '4',
    buildingType = 'residential', // residential, commercial
    windowToWallRatio = 0.15
  } = buildingInfo;

  const uValue = glass.specifications?.thermalTransmission || 0.5;
  const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6;

  const codeData = buildingCodes[code];
  if (!codeData || !codeData.zones[climateZone]) {
    return { error: 'Invalid code or climate zone' };
  }

  const requirements = codeData.zones[climateZone];
  
  // Compliance checks
  const uFactorCompliant = uValue <= requirements.maxUFactor;
  const shgcCompliant = shgc <= requirements.maxSHGC;
  
  // Overall compliance
  const compliant = uFactorCompliant && shgcCompliant;
  
  // Performance margins
  const uFactorMargin = ((requirements.maxUFactor - uValue) / requirements.maxUFactor * 100);
  const shgcMargin = ((requirements.maxSHGC - shgc) / requirements.maxSHGC * 100);

  // Recommendations for non-compliance
  const recommendations = [];
  if (!uFactorCompliant) {
    recommendations.push(`U-Factor too high. Need ≤ ${requirements.maxUFactor}, currently ${uValue}`);
  }
  if (!shgcCompliant) {
    recommendations.push(`SHGC too high. Need ≤ ${requirements.maxSHGC}, currently ${shgc}`);
  }
  if (compliant) {
    recommendations.push('Glass meets all code requirements');
  }

  return {
    code: codeData.name,
    climateZone,
    zoneDescription: requirements.description,
    compliant,
    uFactorCompliant,
    shgcCompliant,
    uFactorMargin: Math.round(uFactorMargin * 10) / 10,
    shgcMargin: Math.round(shgcMargin * 10) / 10,
    requirements,
    currentValues: { uValue, shgc },
    recommendations
  };
};

// Annual energy performance calculator
export const calculateAnnualPerformance = (glass, buildingData = {}) => {
  const {
    glassArea = 100,
    orientation = 'south', // north, south, east, west
    climateData = 'mixed', // hot, mixed, cold
    heatingSetpoint = 68,
    coolingSetpoint = 76,
    electricityRate = 0.12, // $/kWh
    gasRate = 1.15 // $/therm
  } = buildingData;

  const uValue = glass.specifications?.thermalTransmission || 0.5;
  const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6;
  const lightTransmittance = glass.specifications?.lightTransmittance || 80;

  // Climate factors
  const climateFactors = {
    'hot': { heatingDays: 1000, coolingDays: 2500, avgSolarGain: 1200 },
    'mixed': { heatingDays: 2000, coolingDays: 1500, avgSolarGain: 1000 },
    'cold': { heatingDays: 3500, coolingDays: 500, avgSolarGain: 800 }
  };

  const climate = climateFactors[climateData];
  
  // Orientation factors
  const orientationFactors = {
    'south': 1.0,
    'east': 0.7,
    'west': 0.7,
    'north': 0.3
  };

  const orientationFactor = orientationFactors[orientation] || 1.0;

  // Annual energy calculations
  const annualHeatLoss = uValue * glassArea * climate.heatingDays * 24 / 100000; // therms
  const annualSolarGain = shgc * glassArea * climate.avgSolarGain * orientationFactor / 3412; // kWh equivalent
  
  // Heating energy (reduced by solar gains)
  const netHeatingEnergy = Math.max(0, annualHeatLoss - (annualSolarGain * 0.8)); // 80% utilization of solar gains
  const heatingCost = netHeatingEnergy * gasRate;
  
  // Cooling energy (increased by solar gains)
  const coolingEnergy = (annualSolarGain * 0.3) + (uValue * glassArea * climate.coolingDays * 0.1); // Simplified
  const coolingCost = coolingEnergy * electricityRate;

  // Lighting energy offset by daylight
  const daylightOffset = (lightTransmittance / 100) * glassArea * 0.5; // Simplified daylight calculation
  const lightingEnergySavings = daylightOffset * 8 * 250; // 8 hours, 250 work days
  const lightingSavings = lightingEnergySavings * electricityRate;

  const totalAnnualCost = heatingCost + coolingCost - lightingSavings;

  return {
    annualHeatLoss: Math.round(annualHeatLoss * 100) / 100,
    annualSolarGain: Math.round(annualSolarGain),
    heatingCost: Math.round(heatingCost),
    coolingCost: Math.round(coolingCost),
    lightingSavings: Math.round(lightingSavings),
    totalAnnualCost: Math.round(totalAnnualCost),
    netEnergyCost: Math.round(totalAnnualCost),
    orientation,
    climateData
  };
};

// Glass filtering and recommendation engine
export const getAdvancedRecommendations = (glassOptions, requirements = {}) => {
  const {
    climateZone = '4',
    buildingCode = 'IECC_2021',
    priorities = ['energy', 'comfort', 'cost'], // energy, comfort, view, cost, compliance
    budget = 'medium', // low, medium, high
    application = 'residential' // residential, commercial, specialty
  } = requirements;

  // Score each glass option
  const scoredGlass = glassOptions.map(glass => {
    let totalScore = 0;
    const scores = {};

    // Energy efficiency score
    const uValue = glass.specifications?.thermalTransmission || 0.5;
    const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6;
    scores.energy = Math.max(0, 100 - (uValue * 100) - (shgc * 50));

    // Comfort score (thermal and visual)
    const comfort = calculateThermalComfort(glass);
    scores.comfort = comfort.comfortLevel === 'Excellent' ? 100 :
                    comfort.comfortLevel === 'Good' ? 80 :
                    comfort.comfortLevel === 'Fair' ? 60 : 40;

    // View quality score
    const lightTrans = glass.specifications?.lightTransmittance || 80;
    scores.view = lightTrans > 70 ? 100 : lightTrans > 50 ? 80 : lightTrans > 30 ? 60 : 40;

    // Cost score (inverse of price)
    const maxPrice = Math.max(...glassOptions.map(g => g.price));
    scores.cost = Math.max(0, 100 - ((glass.price / maxPrice) * 100));

    // Compliance score
    const compliance = checkCodeCompliance(glass, { code: buildingCode, climateZone });
    scores.compliance = compliance.compliant ? 100 : 50;

    // Calculate weighted total based on priorities
    const weights = {
      energy: priorities.includes('energy') ? 0.3 : 0.1,
      comfort: priorities.includes('comfort') ? 0.25 : 0.1,
      view: priorities.includes('view') ? 0.2 : 0.1,
      cost: priorities.includes('cost') ? 0.15 : 0.1,
      compliance: priorities.includes('compliance') ? 0.1 : 0.05
    };

    totalScore = Object.keys(scores).reduce((sum, key) => {
      return sum + (scores[key] * (weights[key] || 0.1));
    }, 0);

    return {
      glass,
      totalScore: Math.round(totalScore),
      scores
    };
  });

  // Sort by total score
  const ranked = scoredGlass.sort((a, b) => b.totalScore - a.totalScore);

  return {
    recommendations: ranked.slice(0, 3), // Top 3
    criteria: requirements,
    scoringWeights: {
      energy: priorities.includes('energy') ? 'High' : 'Low',
      comfort: priorities.includes('comfort') ? 'High' : 'Low',
      view: priorities.includes('view') ? 'High' : 'Low',
      cost: priorities.includes('cost') ? 'High' : 'Low',
      compliance: priorities.includes('compliance') ? 'High' : 'Low'
    }
  };
};

export default {
  calculateThermalComfort,
  calculateVisualComfort,
  checkCodeCompliance,
  calculateAnnualPerformance,
  getAdvancedRecommendations,
  buildingCodes
}; 