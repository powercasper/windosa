// Server-side Glass Database
// Professional glass specifications with enhanced technical data

const glassDatabase = {
  'SKN 183': {
    id: 'skn-183',
    productCode: 'SKN 183 (6-16-6)',
    type: 'SKN 183 High Performance',
    category: 'High Performance Glazing',
    composition: {
      exteriorCoating: 'SKN_183',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_6MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 68,
      solarHeatGainCoefficient: 0.36,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
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
    pdfSpecSheet: 'SKN-183-spec.pdf'
  },
  
  'SKN 183 (6-16-4)': {
    id: 'skn-183-lightweight',
    productCode: 'SKN 183 (6-16-4)',
    type: 'SKN 183 High Performance Lightweight',
    category: 'High Performance Glazing',
    composition: {
      exteriorCoating: 'SKN_183',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_4MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 4mm',
      lightTransmittance: 70,
      solarHeatGainCoefficient: 0.37,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 31(-1;-5) dB',
      acousticValue: 31,
      gasFill: '16mm Argon Gas',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial'],
      climateZones: ['Hot', 'Mixed', 'Cold'],
      uValue: 0.2,
      gValue: 0.37
    },
    features: [
      'Superior thermal insulation',
      'Excellent light transmission',
      'Lightweight design',
      'Energy efficient solar control',
      'Premium argon gas fill'
    ],
    description: 'Premium high-performance glass with lightweight 4mm interior pane. Maintains thermal performance while reducing weight.',
    pdfSpecSheet: 'SKN-183-lightweight-spec.pdf'
  },
  
  'SKN 154': {
    id: 'skn-154',
    productCode: 'SKN 154 (6-16-6)',
    type: 'SKN 154 Balanced Performance',
    category: 'Balanced Performance Glazing',
    composition: {
      exteriorCoating: 'SKN_165',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_6MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 44,
      solarHeatGainCoefficient: 0.24,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
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
  
  'SKN 154 (6-16-4)': {
    id: 'skn-154-lightweight',
    productCode: 'SKN 154 (6-16-4)',
    type: 'SKN 154 Balanced Performance Lightweight',
    category: 'Balanced Performance Glazing',
    composition: {
      exteriorCoating: 'SKN_165',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_4MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 4mm',
      lightTransmittance: 46,
      solarHeatGainCoefficient: 0.25,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 31(-1;-5) dB',
      acousticValue: 31,
      gasFill: '16mm Argon Gas',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial'],
      climateZones: ['Hot', 'Mixed'],
      uValue: 0.2,
      gValue: 0.25
    },
    features: [
      'Balanced light and heat control',
      'Superior thermal insulation',
      'Lightweight design',
      'Energy efficient design',
      'Premium argon gas fill'
    ],
    description: 'Balanced performance glass with lightweight 4mm interior pane. Optimal combination of light transmission and solar control.',
    pdfSpecSheet: 'SKN-154-lightweight-spec.pdf'
  },
  
  '70/33': {
    id: '70-33',
    productCode: '70/33 (6-16-6)',
    type: 'XTREME 70/33 Maximum Light',
    category: 'Maximum Light Glazing',
    composition: {
      exteriorCoating: 'XTREME_70_33',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_6MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 67,
      solarHeatGainCoefficient: 0.29,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
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
  
  '70/33 (6-16-4)': {
    id: '70-33-lightweight',
    productCode: '70/33 (6-16-4)',
    type: 'XTREME 70/33 Maximum Light Lightweight',
    category: 'Maximum Light Glazing',
    composition: {
      exteriorCoating: 'XTREME_70_33',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_4MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 4mm',
      lightTransmittance: 69,
      solarHeatGainCoefficient: 0.30,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 31(-1;-5) dB',
      acousticValue: 31,
      gasFill: '16mm Argon Gas',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial', 'Daylighting'],
      climateZones: ['Mixed', 'Cold'],
      uValue: 0.2,
      gValue: 0.30
    },
    features: [
      'Maximum natural light',
      'Superior thermal insulation',
      'Lightweight design',
      'Moderate solar control',
      'Premium argon gas fill'
    ],
    description: 'High light transmission glass with lightweight 4mm interior pane. Perfect for maximizing natural daylight.',
    pdfSpecSheet: '70-33-lightweight-spec.pdf'
  },
  
  '61-29': {
    id: '61-29',
    productCode: '61-29 (6-16-6)',
    type: 'XTREME 61-29 Balanced',
    category: 'Balanced Performance Glazing',
    composition: {
      exteriorCoating: 'XTREME_61_29',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_6MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 58,
      solarHeatGainCoefficient: 0.26,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
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
  
  '61-29 (6-16-4)': {
    id: '61-29-lightweight',
    productCode: '61-29 (6-16-4)',
    type: 'XTREME 61-29 Balanced Lightweight',
    category: 'Balanced Performance Glazing',
    composition: {
      exteriorCoating: 'XTREME_61_29',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_4MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 4mm',
      lightTransmittance: 60,
      solarHeatGainCoefficient: 0.27,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 31(-1;-5) dB',
      acousticValue: 31,
      gasFill: '16mm Argon Gas',
      energyRating: 'A+',
      applications: ['Residential', 'Commercial'],
      climateZones: ['Hot', 'Mixed', 'Cold'],
      uValue: 0.2,
      gValue: 0.27
    },
    features: [
      'Balanced performance',
      'Superior thermal insulation',
      'Lightweight design',
      'Effective solar control',
      'Premium argon gas fill'
    ],
    description: 'Well-balanced glass with lightweight 4mm interior pane. Good light transmission with effective solar control.',
    pdfSpecSheet: '61-29-lightweight-spec.pdf'
  },
  
  '50-22': {
    id: '50-22',
    productCode: '50-22 (6-16-6)',
    type: 'XTREME 50-22 Solar Control',
    category: 'Solar Control Glazing',
    composition: {
      exteriorCoating: 'XTREME_61_29',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_6MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 6mm',
      lightTransmittance: 44,
      solarHeatGainCoefficient: 0.20,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 33(-1;-5) dB',
      acousticValue: 33,
      gasFill: '16mm Argon Gas',
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
  },
  
  '50-22 (6-16-4)': {
    id: '50-22-lightweight',
    productCode: '50-22 (6-16-4)',
    type: 'XTREME 50-22 Solar Control Lightweight',
    category: 'Solar Control Glazing',
    composition: {
      exteriorCoating: 'XTREME_61_29',
      spacer: 'SWISSPACER_ULTIMATE_GREY',
      interiorGlass: 'PLANITHERM_XN_4MM'
    },
    specifications: {
      construction: '6mm + 16mm Argon + 4mm',
      lightTransmittance: 46,
      solarHeatGainCoefficient: 0.21,
      thermalTransmission: '0.2 W/m²K',
      acousticRating: 'Rw 31(-1;-5) dB',
      acousticValue: 31,
      gasFill: '16mm Argon Gas',
      energyRating: 'A+',
      applications: ['Commercial', 'Hot Climate', 'Solar Control'],
      climateZones: ['Hot'],
      uValue: 0.2,
      gValue: 0.21
    },
    features: [
      'Maximum solar control',
      'Superior thermal insulation',
      'Lightweight design',
      'Reduced cooling costs',
      'Premium argon gas fill'
    ],
    description: 'High-performance solar control glass with lightweight 4mm interior pane. Designed for hot climates.',
    pdfSpecSheet: '50-22-lightweight-spec.pdf'
  }
};

// Standard glass options for backward compatibility
const standardGlassOptions = {
  'Double Pane': {
    id: 'double-pane',
    productCode: 'Standard Double Pane',
    type: 'Double Pane',
    category: 'Standard Glazing',
    composition: {
      exteriorCoating: 'None',
      spacer: 'SWISSPACER_AD_GREY',
      interiorGlass: 'PLANICLEAR_4MM',
      // Structure: 4mm exterior - 16mm Argon - 4mm interior
      construction: '4mm + 16mm Argon + 4mm'
    },
    iguConfiguration: {
      type: 'Double Pane IGU',
      structure: '4mm PLANICLEAR | 16mm Argon | 4mm PLANICLEAR',
      materials: {
        exteriorPane: '4mm PLANICLEAR (clear float glass)',
        spacer: 'SWISSPACER AD Grey (warm-edge spacer)',
        gasFill: '16mm Argon Gas (energy efficient)',
        interiorPane: '4mm PLANICLEAR (clear float glass)'
      },
      totalThickness: '24mm',
      performance: {
        uValue: '2.8 W/m²K',
        lightTransmittance: '82%',
        solarHeatGain: '0.76',
        acousticRating: 'Rw 28 dB'
      }
    },
    specifications: {
      construction: '4mm + 16mm Argon + 4mm',
      lightTransmittance: 82,
      solarHeatGainCoefficient: 0.76,
      thermalTransmission: '2.8 W/m²K',
      acousticRating: 'Rw 28 dB',
      acousticValue: 28,
      gasFill: '16mm Argon Gas',
      energyRating: 'C',
      applications: ['Basic Residential'],
      climateZones: ['Mild'],
      uValue: 2.8,
      gValue: 0.76
    },
    features: [
      'Basic insulation',
      'Standard performance',
      'Cost effective',
      'Argon gas fill for energy efficiency',
      'Warm-edge spacer technology'
    ],
    description: 'Standard double pane insulated glass unit with 4mm clear glass, 16mm argon gas fill, and warm-edge spacer for basic applications.',
    pdfSpecSheet: null
  },
  
  'Triple Pane': {
    id: 'triple-pane',
    productCode: 'Standard Triple Pane',
    type: 'Triple Pane',
    category: 'Enhanced Glazing',
    composition: {
      exteriorCoating: 'None',
      spacer: 'SWISSPACER_AD_GREY',
      middleGlass: 'PLANICLEAR_4MM',
      interiorGlass: 'PLANICLEAR_4MM',
      // Structure: 4mm exterior - 16mm Argon - 4mm middle - 16mm Argon - 4mm interior
      construction: '4mm + 16mm Argon + 4mm + 16mm Argon + 4mm'
    },
    iguConfiguration: {
      type: 'Triple Pane IGU',
      structure: '4mm PLANICLEAR | 16mm Argon | 4mm PLANICLEAR | 16mm Argon | 4mm PLANICLEAR',
      materials: {
        exteriorPane: '4mm PLANICLEAR (clear float glass)',
        spacer1: 'SWISSPACER AD Grey (warm-edge spacer)',
        gasFill1: '16mm Argon Gas (energy efficient)',
        middlePane: '4mm PLANICLEAR (clear float glass)',
        spacer2: 'SWISSPACER AD Grey (warm-edge spacer)',
        gasFill2: '16mm Argon Gas (energy efficient)',
        interiorPane: '4mm PLANICLEAR (clear float glass)'
      },
      totalThickness: '40mm',
      performance: {
        uValue: '1.6 W/m²K',
        lightTransmittance: '74%',
        solarHeatGain: '0.68',
        acousticRating: 'Rw 31 dB'
      }
    },
    specifications: {
      construction: '4mm + 16mm Argon + 4mm + 16mm Argon + 4mm',
      lightTransmittance: 74,
      solarHeatGainCoefficient: 0.68,
      thermalTransmission: '1.6 W/m²K',
      acousticRating: 'Rw 31 dB',
      acousticValue: 31,
      gasFill: '16mm Argon Gas',
      energyRating: 'B',
      applications: ['Residential', 'Energy Efficient'],
      climateZones: ['Cold', 'Mixed'],
      uValue: 1.6,
      gValue: 0.68
    },
    features: [
      'Enhanced insulation',
      'Better acoustic performance',
      'Improved energy efficiency',
      'Dual argon gas chambers',
      'Warm-edge spacer technology',
      'Superior thermal performance'
    ],
    description: 'Triple pane insulated glass unit with 4mm clear glass, dual 16mm argon gas chambers, and warm-edge spacers for enhanced thermal and acoustic performance.',
    pdfSpecSheet: null
  }
};

// Glass categories for organization
const glassCategories = {
  'High Performance Glazing': {
    name: 'High Performance Glazing',
    description: 'Premium glass with superior thermal and acoustic properties',
    products: ['SKN 183']
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

// Helper function to inject calculated prices into glass objects
const injectCalculatedPrices = (glassObjects) => {
  const processedObjects = {};
  for (const key in glassObjects) {
    const glass = { ...glassObjects[key] };
    
    // Use dynamic composition-based pricing for all glass types
    glass.price = calculatePriceFromComposition(glass.composition);
    
    // Add standard additional options
    glass.additionalOptions = {
      'Tempered': 12.00,
      'Laminated': 18.00,
      'Tempered + Laminated': 28.00,
      'Custom Size': 8.00,
      'Express Delivery': 15.00
    };
    
    processedObjects[key] = glass;
  }
  return processedObjects;
};

// Helper function to inject calculated prices with area-based surcharges
const injectCalculatedPricesWithArea = (glassObjects, areaSqm, panelInfo = null) => {
  const processedObjects = {};
  for (const key in glassObjects) {
    const glass = { ...glassObjects[key] };
    
    // Use dynamic composition-based pricing with area surcharges
    glass.price = calculatePriceFromComposition(glass.composition, areaSqm, panelInfo);
    
    // Add standard additional options
    glass.additionalOptions = {
      'Tempered': 12.00,
      'Laminated': 18.00,
      'Tempered + Laminated': 28.00,
      'Custom Size': 8.00,
      'Express Delivery': 15.00
    };
    
    processedObjects[key] = glass;
  }
  return processedObjects;
};

// Helper functions
const getAllGlassOptions = () => {
  const allGlass = { ...glassDatabase, ...standardGlassOptions };
  return injectCalculatedPrices(allGlass);
};

// New function to get glass options with area-based pricing
const getAllGlassOptionsWithArea = (areaSqm, panelInfo = null) => {
  const allGlass = { ...glassDatabase, ...standardGlassOptions };
  return injectCalculatedPricesWithArea(allGlass, areaSqm, panelInfo);
};

const getGlassByCategory = (category) => {
  const allGlass = getAllGlassOptions(); // Already has prices
  return Object.values(allGlass).filter(glass => glass.category === category);
};

const getGlassByType = (type) => {
  const allGlass = getAllGlassOptions(); // Already has prices
  
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
  return injectCalculatedPrices(glassDatabase);
};

const getStandardGlassOptions = () => {
  return injectCalculatedPrices(standardGlassOptions);
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

// IGU Configuration Data
const iguConfigurationData = {
  basePrice: 27.98, // Base price per sqm in EUR
  exchangeRate: 1.18,
  basePriceTripplePane: 53.00, // EUR to USD exchange rate
  
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
    { id: 'PLANICLEAR_4MM', name: 'PLANICLEAR 4mm', surcharge: 10.69 },
    { id: 'PLANICLEAR_6MM', name: 'PLANICLEAR 6mm', surcharge: 16.64 },
    { id: 'PLANICLEAR_6MM_ESG', name: 'PLANICLEAR 6mm ESG', surcharge: 18.50 },
    { id: 'PLANICLEAR_8MM', name: 'PLANICLEAR 8mm', surcharge: 25.60 },
    { id: 'PLANICLEAR_10MM', name: 'PLANICLEAR 10mm', surcharge: 37.43 }
  ],

  middleGlass: [
    { id: 'PLANICLEAR_4MM', name: 'PLANICLEAR 4mm', surcharge: 10.69 },
    { id: 'PLANICLEAR_6MM', name: 'PLANICLEAR 6mm', surcharge: 16.64 },
    { id: 'PLANICLEAR_8MM', name: 'PLANICLEAR 8mm', surcharge: 25.60 },
    { id: 'PLANICLEAR_10MM', name: 'PLANICLEAR 10mm', surcharge: 37.43 }
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

// Helper function to calculate price per sq ft from a composition
const calculatePriceFromComposition = (composition, areaSqm = null, panelInfo = null) => {
  if (!composition) return 0;

  const { basePrice, basePriceTripplePane, exchangeRate, exteriorCoatings, spacers, interiorGlass } = iguConfigurationData;

  // Use triple pane base price if middle glass is present
  const effectiveBasePrice = composition.middleGlass ? basePriceTripplePane : basePrice;

  const coatingSurcharge = exteriorCoatings.find(c => c.id === composition.exteriorCoating)?.surcharge || 0;
  const spacerSurcharge = spacers.find(s => s.id === composition.spacer)?.surcharge || 0;
  const interiorSurcharge = interiorGlass.find(g => g.id === composition.interiorGlass)?.surcharge || 0;
  
  // Handle triple pane with middle glass and extra spacer
  let middleGlassSurcharge = 0;
  let extraSpacerSurcharge = 0;
  
  if (composition.middleGlass) {
    // Triple pane: add middle glass and extra spacer
    middleGlassSurcharge = interiorGlass.find(g => g.id === composition.middleGlass)?.surcharge || 0;
    extraSpacerSurcharge = spacerSurcharge; // Second spacer same as first
  }

  const totalSqmPriceEur = effectiveBasePrice + coatingSurcharge + spacerSurcharge + interiorSurcharge + middleGlassSurcharge + extraSpacerSurcharge;
  
  // Apply large IGU surcharge based on panel sizes for sliding doors/windows or total area for other systems
  let largeIguSurcharge = 0;
  
  if (panelInfo && panelInfo.panels && panelInfo.panels.length > 0) {
    // For sliding doors and windows: check each panel size individually
    const maxPanelAreaSqm = Math.max(...panelInfo.panels.map(panel => {
      const panelWidthInches = panel.width || (panelInfo.totalWidth / panelInfo.panels.length);
      const panelHeightInches = panelInfo.totalHeight;
      const panelAreaSqIn = panelWidthInches * panelHeightInches;
      return panelAreaSqIn * 0.00064516; // Convert to sqm
    }));
    
    if (maxPanelAreaSqm > 6) {
      largeIguSurcharge = 0.50; // 50% surcharge for panel over 6 sqm
    } else if (maxPanelAreaSqm > 4) {
      largeIguSurcharge = 0.30; // 30% surcharge for panel over 4 sqm
    }
  } else if (areaSqm && areaSqm > 4) {
    // For other systems: use total area
    if (areaSqm > 6) {
      largeIguSurcharge = 0.50; // 50% surcharge for glass over 6 sqm
    } else {
      largeIguSurcharge = 0.30; // 30% surcharge for glass over 4 sqm
    }
  }
  
  const totalSqmPriceWithSurcharge = totalSqmPriceEur * (1 + largeIguSurcharge);
  
  // Convert EUR/sqm to USD/sqft (supplier price)
  const supplierPriceSqFt = totalSqmPriceWithSurcharge * exchangeRate / 10.764; // 1 sqm = 10.764 sqft
  
  // Add 25% factory markup to get factory price
  const factoryPriceSqFt = supplierPriceSqFt * 1.25;
  
  return factoryPriceSqFt;
};

// Helper function to calculate IGU price
const calculateIguPrice = (configuration, dimensions) => {
  const { basePrice, exchangeRate, exteriorCoatings, spacers, interiorGlass } = iguConfigurationData;
  
  const coatingSurcharge = exteriorCoatings.find(c => c.id === configuration.exteriorCoating)?.surcharge || 0;
  const spacerSurcharge = spacers.find(s => s.id === configuration.spacer)?.surcharge || 0;
  const interiorSurcharge = interiorGlass.find(g => g.id === configuration.interiorGlass)?.surcharge || 0;
  
  const totalSqmPrice = basePrice + coatingSurcharge + spacerSurcharge + interiorSurcharge;
  
  if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
    const { width, height } = dimensions;
    const areaSqIn = width * height;
    const areaSqm = areaSqIn * 0.00064516; // 1 sq inch = 0.00064516 sqm
    
    // Calculate large IGU surcharge
    let largeIguSurcharge = 0;
    let surchargePercentage = 0;
    
    if (areaSqm > 6) {
      largeIguSurcharge = 0.50; // 50% surcharge for glass over 6 sqm
      surchargePercentage = 50;
    } else if (areaSqm > 4) {
      largeIguSurcharge = 0.30; // 30% surcharge for glass over 4 sqm
      surchargePercentage = 30;
    }
    
    const totalSqmPriceWithSurcharge = totalSqmPrice * (1 + largeIguSurcharge);
    const totalEurPrice = areaSqm * totalSqmPriceWithSurcharge;
    const totalUsdPrice = totalEurPrice * exchangeRate;
    
    // Add 25% factory markup to get factory price
    const factoryPriceUsd = totalUsdPrice * 1.25;
    const factoryPricePerSqFt = factoryPriceUsd / (areaSqIn / 144);
    
    return {
      totalEurPrice,
      totalUsdPrice,
      factoryPriceUsd,
      pricePerSqFt: factoryPricePerSqFt, // Now returns factory price per sqft
      supplierPricePerSqFt: totalUsdPrice / (areaSqIn / 144), // Keep supplier price for reference
      pricePerSqm: totalSqmPriceWithSurcharge,
      areaSqFt: areaSqIn / 144,
      areaSqm,
      factoryMarkup: {
        percentage: 25,
        markupAmount: totalUsdPrice * 0.25,
        supplierPrice: totalUsdPrice,
        factoryPrice: factoryPriceUsd
      },
      largeIguSurcharge: {
        applied: largeIguSurcharge > 0,
        percentage: surchargePercentage,
        surchargeAmount: largeIguSurcharge,
        reason: areaSqm > 6 ? 'Glass over 6 sqm' : areaSqm > 4 ? 'Glass over 4 sqm' : null
      },
      breakdown: {
        basePrice,
        coatingSurcharge,
        spacerSurcharge,
        interiorSurcharge,
        totalSqmPrice,
        largeIguSurcharge: largeIguSurcharge > 0 ? totalSqmPrice * largeIguSurcharge : 0,
        totalSqmPriceWithSurcharge
      }
    };
  }
  
  return null;
};

module.exports = {
  // Omit raw database objects from exports to ensure prices are always injected
  // glassDatabase,
  // standardGlassOptions,
  glassCategories,
  iguConfigurationData,
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
  calculateIguPrice
}; 