// Enhanced Glass Database with Technical Specifications
// Based on professional glass performance data

export const glassDatabase = [
  {
    id: 'skn-184',
    type: 'SKN 184 High Performance', // Keeping compatibility with existing 'type' field
    productCode: 'SKN 184',
    name: '6 FT DIAMANT (16 Argon 90) 6 FT',
    manufacturer: 'COOLLITE SKN 183 II #2 / PLANITHERM HN Tempered #1',
    category: 'High Performance',
    description: 'Premium high-performance glass with excellent light transmission',
    specs: '6mm + 16mm Argon + 6mm with DIAMANT coating', // Backward compatibility
    
    // Technical Specifications
    specifications: {
      // Luminous Factors
      lightTransmittance: 68, // TL % - Visible light passing through
      
      // Solar Factors  
      solarHeatGainCoefficient: 0.36, // g-value - Solar energy transmission
      
      // Thermal Transmission
      thermalTransmission: 0.2, // Ug (Btu/(h.ft².F)) - Heat transfer rate
      
      // Acoustics
      acousticRating: '33(-1;-5)', // Rw (C;Ctr) dB - Sound reduction
      acousticValue: 33, // Numeric value for comparisons
      
      // Construction Details
      construction: '6mm + 16mm Argon + 6mm',
      totalThickness: 28, // mm
      gasFill: '90% Argon',
      spacer: 'Swisspacer Ultimate Pro',
      coatings: ['DIAMANT', 'PLANITHERM HN Tempered'],
      
      // Performance Indicators
      energyRating: 'A+',
      climateZones: ['Cold', 'Mixed'],
      applications: ['Residential', 'Commercial', 'High-End']
    },
    
    performance: {
      lightLevel: 'High',
      thermalEfficiency: 'Excellent',
      acousticLevel: 'Very Good',
      solarControl: 'Good'
    },
    
    price: 22.50 // per sq ft - Higher price for premium performance
  },
  
  {
    id: 'skn-154',
    type: 'SKN 154 Balanced Performance',
    productCode: 'SKN 154',
    name: '6 FT (16 Argon 90) 6 FT',
    manufacturer: 'COOL-LITE SKN 154 II #2 / PLANITHERM ONE II #1',
    category: 'Balanced Performance',
    description: 'Balanced performance with good solar control',
    specs: '6mm + 16mm Argon + 6mm with selective coating',
    
    specifications: {
      lightTransmittance: 44,
      solarHeatGainCoefficient: 0.24,
      thermalTransmission: 0.2,
      acousticRating: '33(-1;-5)',
      acousticValue: 33,
      construction: '6mm + 16mm Argon + 6mm',
      totalThickness: 28,
      gasFill: '90% Argon',
      spacer: 'Swisspacer Ultimate Pro',
      coatings: ['SKN 154 II', 'PLANITHERM ONE II'],
      energyRating: 'A+',
      climateZones: ['Hot', 'Mixed', 'Cold'],
      applications: ['Residential', 'Commercial']
    },
    
    performance: {
      lightLevel: 'Moderate',
      thermalEfficiency: 'Excellent',
      acousticLevel: 'Very Good',
      solarControl: 'Excellent'
    },
    
    price: 20.75
  },
  
  {
    id: 'xtreme-50-22',
    type: 'XTREME 50-22 Solar Control',
    productCode: '50-22',
    name: '6 FT (16 Argon 90) 6 FT',
    manufacturer: 'COOL-LITE XTREME 50-22 II #2 / ECLAZ ONE II #1',
    category: 'Solar Control',
    description: 'Superior solar control for hot climates',
    specs: '6mm + 16mm Argon + 6mm with advanced solar control',
    
    specifications: {
      lightTransmittance: 44,
      solarHeatGainCoefficient: 0.20,
      thermalTransmission: 0.2,
      acousticRating: '33(-1;-5)',
      acousticValue: 33,
      construction: '6mm + 16mm Argon + 6mm',
      totalThickness: 28,
      gasFill: '90% Argon',
      spacer: 'Swisspacer Ultimate Pro',
      coatings: ['XTREME 50-22 II', 'ECLAZ ONE II'],
      energyRating: 'A++',
      climateZones: ['Hot', 'Very Hot'],
      applications: ['Commercial', 'High-Rise', 'Residential']
    },
    
    performance: {
      lightLevel: 'Moderate',
      thermalEfficiency: 'Excellent',
      acousticLevel: 'Very Good',
      solarControl: 'Superior'
    },
    
    price: 24.25
  },
  
  {
    id: 'xtreme-61-29',
    type: 'XTREME 61-29 Balanced',
    productCode: '61-29',
    name: '6 FT DIAMANT (16 Argon 90) 6 FT DIAMANT',
    manufacturer: 'COOL-LITE XTREME 61-29 II #2 / ECLAZ ONE II #1',
    category: 'Balanced Performance',
    description: 'Optimal balance of light and solar control',
    specs: '6mm + 16mm Argon + 6mm with dual DIAMANT coating',
    
    specifications: {
      lightTransmittance: 58,
      solarHeatGainCoefficient: 0.26,
      thermalTransmission: 0.2,
      acousticRating: '33(-1;-5)',
      acousticValue: 33,
      construction: '6mm + 16mm Argon + 6mm',
      totalThickness: 28,
      gasFill: '90% Argon',
      spacer: 'Swisspacer Ultimate Pro',
      coatings: ['XTREME 61-29 II', 'ECLAZ ONE II', 'DIAMANT'],
      energyRating: 'A+',
      climateZones: ['Mixed', 'Cold', 'Hot'],
      applications: ['Residential', 'Commercial', 'Institutional']
    },
    
    performance: {
      lightLevel: 'Good',
      thermalEfficiency: 'Excellent',
      acousticLevel: 'Very Good',
      solarControl: 'Very Good'
    },
    
    price: 21.50
  },
  
  {
    id: 'xtreme-70-33',
    type: 'XTREME 70/33 Maximum Light',
    productCode: '70/33',
    name: '6 FT DIAMANT (16 Argon 90) 6 FT DIAMANT',
    manufacturer: 'COOL-LITE XTREME 70-33 II #2 / ECLAZ ONE II #1',
    category: 'High Light Transmission',
    description: 'Maximum natural light with good solar control',
    specs: '6mm + 16mm Argon + 6mm with optimized DIAMANT coating',
    
    specifications: {
      lightTransmittance: 67,
      solarHeatGainCoefficient: 0.29,
      thermalTransmission: 0.2,
      acousticRating: '33(-1;-5)',
      acousticValue: 33,
      construction: '6mm + 16mm Argon + 6mm',
      totalThickness: 28,
      gasFill: '90% Argon',
      spacer: 'Swisspacer Ultimate Pro',
      coatings: ['XTREME 70-33 II', 'ECLAZ ONE II', 'DIAMANT'],
      energyRating: 'A+',
      climateZones: ['Cold', 'Mixed'],
      applications: ['Residential', 'Daylighting', 'Commercial']
    },
    
    performance: {
      lightLevel: 'High',
      thermalEfficiency: 'Excellent',
      acousticLevel: 'Very Good',
      solarControl: 'Good'
    },
    
    price: 23.00
  }
];

// Legacy glass options for backward compatibility
export const legacyGlassOptions = [
  {
    type: 'Double Pane',
    description: 'Standard insulation, good for most applications',
    specs: '1" IGU with Low-E coating',
    price: 12.5
  },
  {
    type: 'Triple Pane',
    description: 'Superior insulation for extreme climates',
    specs: '1.5" IGU with double Low-E coating',
    price: 18.75
  },
  {
    type: 'Security Glass',
    description: 'Laminated glass for enhanced security',
    specs: '1" IGU with laminated inner lite',
    price: 22
  },
  {
    type: 'Acoustic Glass',
    description: 'Enhanced sound reduction',
    specs: '1" IGU with acoustic PVB interlayer',
    price: 25
  }
];

// Utility functions
export const getGlassByType = (type) => {
  return glassDatabase.find(glass => glass.type === type) || 
         legacyGlassOptions.find(glass => glass.type === type);
};

export const getGlassById = (id) => {
  return glassDatabase.find(glass => glass.id === id);
};

export const getAllGlassOptions = () => {
  return [...glassDatabase, ...legacyGlassOptions];
};

export const getGlassByCategory = (category) => {
  return glassDatabase.filter(glass => glass.category === category);
};

// Performance level mappings for UI indicators
export const performanceLevels = {
  lightLevel: {
    'Low': { color: '#f44336', range: '0-30%' },
    'Moderate': { color: '#ff9800', range: '30-50%' },
    'Good': { color: '#2196f3', range: '50-65%' },
    'High': { color: '#4caf50', range: '65%+' }
  },
  thermalEfficiency: {
    'Good': { color: '#ff9800', range: 'Ug 0.3+' },
    'Very Good': { color: '#2196f3', range: 'Ug 0.2-0.3' },
    'Excellent': { color: '#4caf50', range: 'Ug <0.2' }
  },
  solarControl: {
    'Fair': { color: '#f44336', range: 'g-value 0.4+' },
    'Good': { color: '#ff9800', range: 'g-value 0.3-0.4' },
    'Very Good': { color: '#2196f3', range: 'g-value 0.25-0.3' },
    'Excellent': { color: '#4caf50', range: 'g-value 0.2-0.25' },
    'Superior': { color: '#9c27b0', range: 'g-value <0.2' }
  }
}; 