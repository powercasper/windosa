// Server-side Glass Database
// Professional glass specifications with enhanced technical data

const glassDatabase = {
  'SKN 184': {
    id: 'skn-184',
    productCode: 'SKN 184',
    type: 'SKN 184 High Performance',
    category: 'High Performance Glazing',
    price: 22.50,
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 68,
      solarHeatGainCoefficient: 0.36,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
      spacer: 'Swisspacer Ultimate Pro',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial', 'High-end Projects'],
      climateZones: ['Hot', 'Mixed', 'Cold'],
      uValue: 0.2,
      gValue: 0.36
    },
    features: [
      'Superior thermal insulation',
      'Excellent light transmission',
      'Enhanced acoustic performance',
      'Energy efficient solar control',
      'Premium argon gas fill'
    ],
    description: 'Premium high-performance glass with excellent thermal and acoustic properties. Ideal for luxury residential and commercial applications.',
    pdfSpecSheet: 'SKN-184-spec.pdf'
  },
  
  'SKN 154': {
    id: 'skn-154',
    productCode: 'SKN 154',
    type: 'SKN 154 Balanced Performance',
    category: 'Balanced Performance Glazing',
    price: 20.75,
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 44,
      solarHeatGainCoefficient: 0.24,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
      spacer: 'Swisspacer Ultimate Pro',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial'],
      climateZones: ['Hot', 'Mixed'],
      uValue: 0.2,
      gValue: 0.24
    },
    features: [
      'Balanced light and heat control',
      'Superior thermal insulation',
      'Enhanced acoustic performance',
      'Energy efficient design',
      'Premium argon gas fill'
    ],
    description: 'Balanced performance glass offering optimal combination of light transmission and solar control.',
    pdfSpecSheet: 'SKN-154-spec.pdf'
  },
  
  '70/33': {
    id: '70-33',
    productCode: '70/33',
    type: 'XTREME 70/33 Maximum Light',
    category: 'Maximum Light Glazing',
    price: 23.00,
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 67,
      solarHeatGainCoefficient: 0.29,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
      spacer: 'Swisspacer Ultimate Pro',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial', 'Daylighting'],
      climateZones: ['Mixed', 'Cold'],
      uValue: 0.2,
      gValue: 0.29
    },
    features: [
      'Maximum natural light',
      'Superior thermal insulation',
      'Moderate solar control',
      'Enhanced visual comfort',
      'Premium argon gas fill'
    ],
    description: 'High light transmission glass perfect for maximizing natural daylight while maintaining thermal efficiency.',
    pdfSpecSheet: '70-33-spec.pdf'
  },
  
  '61-29': {
    id: '61-29',
    productCode: '61-29',
    type: 'XTREME 61-29 Balanced',
    category: 'Balanced Performance Glazing',
    price: 21.50,
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 58,
      solarHeatGainCoefficient: 0.26,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
      spacer: 'Swisspacer Ultimate Pro',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial'],
      climateZones: ['Hot', 'Mixed', 'Cold'],
      uValue: 0.2,
      gValue: 0.26
    },
    features: [
      'Balanced performance',
      'Superior thermal insulation',
      'Good light transmission',
      'Effective solar control',
      'Premium argon gas fill'
    ],
    description: 'Well-balanced glass offering good light transmission with effective solar heat gain control.',
    pdfSpecSheet: '61-29-spec.pdf'
  },
  
  '50-22': {
    id: '50-22',
    productCode: '50-22',
    type: 'XTREME 50-22 Solar Control',
    category: 'Solar Control Glazing',
    price: 24.25,
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 44,
      solarHeatGainCoefficient: 0.20,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
      spacer: 'Swisspacer Ultimate Pro',
      energyRating: 'A+',
      applications: ['Commercial', 'Hot Climate', 'Solar Control'],
      climateZones: ['Hot'],
      uValue: 0.2,
      gValue: 0.20
    },
    features: [
      'Maximum solar control',
      'Superior thermal insulation',
      'Reduced cooling costs',
      'Enhanced comfort',
      'Premium argon gas fill'
    ],
    description: 'High-performance solar control glass designed for hot climates and applications requiring maximum heat rejection.',
    pdfSpecSheet: '50-22-spec.pdf'
  }
};

// Standard glass options for backward compatibility
const standardGlassOptions = {
  'Double Pane': {
    id: 'double-pane',
    productCode: 'Standard Double Pane',
    type: 'Double Pane',
    category: 'Standard Glazing',
    price: 12.50,
    specifications: {
      construction: '6mm + 12mm Air + 6mm',
      lightTransmittance: 82,
      solarHeatGainCoefficient: 0.76,
      thermalTransmission: '2.8 W/m²K',
      acousticRating: 'Rw 28 dB',
      acousticValue: 28,
      gasFill: '12mm Air Space',
      spacer: 'Standard Aluminum',
      energyRating: 'C',
      applications: ['Basic Residential'],
      climateZones: ['Mild'],
      uValue: 2.8,
      gValue: 0.76
    },
    features: [
      'Basic insulation',
      'Standard performance',
      'Cost effective'
    ],
    description: 'Standard double pane insulated glass unit for basic applications.',
    pdfSpecSheet: null
  },
  
  'Triple Pane': {
    id: 'triple-pane',
    productCode: 'Standard Triple Pane',
    type: 'Triple Pane',
    category: 'Enhanced Glazing',
    price: 18.75,
    specifications: {
      construction: '4mm + 12mm Air + 4mm + 12mm Air + 4mm',
      lightTransmittance: 74,
      solarHeatGainCoefficient: 0.68,
      thermalTransmission: '1.6 W/m²K',
      acousticRating: 'Rw 31 dB',
      acousticValue: 31,
      gasFill: '12mm Air Spaces',
      spacer: 'Standard Aluminum',
      energyRating: 'B',
      applications: ['Residential', 'Energy Efficient'],
      climateZones: ['Cold', 'Mixed'],
      uValue: 1.6,
      gValue: 0.68
    },
    features: [
      'Enhanced insulation',
      'Better acoustic performance',
      'Improved energy efficiency'
    ],
    description: 'Triple pane insulated glass unit for enhanced thermal and acoustic performance.',
    pdfSpecSheet: null
  }
};

// Glass categories for organization
const glassCategories = {
  'High Performance Glazing': {
    name: 'High Performance Glazing',
    description: 'Premium glass with superior thermal and acoustic properties',
    products: ['SKN 184']
  },
  'Balanced Performance Glazing': {
    name: 'Balanced Performance Glazing', 
    description: 'Optimal balance of light transmission and energy efficiency',
    products: ['SKN 154', '61-29']
  },
  'Maximum Light Glazing': {
    name: 'Maximum Light Glazing',
    description: 'High light transmission for maximum natural daylight',
    products: ['70/33']
  },
  'Solar Control Glazing': {
    name: 'Solar Control Glazing',
    description: 'Maximum solar heat rejection for hot climates',
    products: ['50-22']
  },
  'Standard Glazing': {
    name: 'Standard Glazing',
    description: 'Basic insulated glass units for standard applications',
    products: ['Double Pane', 'Triple Pane']
  }
};

// Helper functions
const getAllGlassOptions = () => {
  return { ...glassDatabase, ...standardGlassOptions };
};

const getGlassByCategory = (category) => {
  const allGlass = getAllGlassOptions();
  return Object.values(allGlass).filter(glass => glass.category === category);
};

const getGlassByType = (type) => {
  const allGlass = getAllGlassOptions();
  
  // Try direct key lookup first
  if (allGlass[type]) {
    return allGlass[type];
  }
  
  // Try searching by type property
  const byType = Object.values(allGlass).find(glass => glass.type === type);
  if (byType) {
    return byType;
  }
  
  // Try searching by productCode
  const byProductCode = Object.values(allGlass).find(glass => glass.productCode === type);
  if (byProductCode) {
    return byProductCode;
  }
  
  // Try partial matching for common variations
  const typeVariations = [
    type.replace(' High Performance', ''),
    type.replace(' Balanced Performance', ''),
    type.replace('XTREME ', '').replace(' Maximum Light', ''),
    type.replace('XTREME ', '').replace(' Balanced', ''),
    type.replace('XTREME ', '').replace(' Solar Control', ''),
    type.replace('Standard ', '')
  ];
  
  for (const variation of typeVariations) {
    if (allGlass[variation]) {
      return allGlass[variation];
    }
  }
  
  return null;
};

const getPremiumGlassOptions = () => {
  return glassDatabase;
};

const getStandardGlassOptions = () => {
  return standardGlassOptions;
};

const getGlassCategories = () => {
  return glassCategories;
};

// Search and filter functions
const searchGlass = (query) => {
  const allGlass = getAllGlassOptions();
  const lowercaseQuery = query.toLowerCase();
  
  return Object.values(allGlass).filter(glass => 
    glass.productCode.toLowerCase().includes(lowercaseQuery) ||
    glass.type.toLowerCase().includes(lowercaseQuery) ||
    glass.category.toLowerCase().includes(lowercaseQuery) ||
    glass.description.toLowerCase().includes(lowercaseQuery)
  );
};

const filterGlassByPrice = (minPrice, maxPrice) => {
  const allGlass = getAllGlassOptions();
  return Object.values(allGlass).filter(glass => 
    glass.price >= minPrice && glass.price <= maxPrice
  );
};

const filterGlassByClimate = (climateZone) => {
  const allGlass = getAllGlassOptions();
  return Object.values(allGlass).filter(glass => 
    glass.specifications.climateZones.includes(climateZone)
  );
};

module.exports = {
  glassDatabase,
  standardGlassOptions,
  glassCategories,
  getAllGlassOptions,
  getGlassByCategory,
  getGlassByType,
  getPremiumGlassOptions,
  getStandardGlassOptions,
  getGlassCategories,
  searchGlass,
  filterGlassByPrice,
  filterGlassByClimate
}; 