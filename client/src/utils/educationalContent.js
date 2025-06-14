// Educational Content and Tooltips for Glass Performance
// User-friendly explanations of technical terms and concepts

export const glossary = {
  // Basic Glass Terms
  'u-factor': {
    term: 'U-Factor (Thermal Transmittance)',
    shortDescription: 'How much heat passes through the glass',
    detailedDescription: 'U-Factor measures how well a window conducts heat. Lower numbers mean better insulation. Think of it like your jacket - a better jacket (lower U-Factor) keeps you warmer by preventing heat loss.',
    units: 'Btu/(h⋅ft²⋅°F)',
    goodRange: '≤ 0.30',
    examples: {
      excellent: '0.15-0.20 (Like a high-tech winter coat)',
      good: '0.20-0.30 (Like a good winter jacket)', 
      poor: '0.50+ (Like a light sweater)'
    },
    impact: 'Lower U-Factor = Less heat loss = Lower heating bills',
    tips: ['Look for triple pane or advanced Low-E coatings for better U-Factors', 'Critical in cold climates']
  },

  'shgc': {
    term: 'SHGC (Solar Heat Gain Coefficient)',
    shortDescription: 'How much sun heat comes through the glass',
    detailedDescription: 'SHGC measures how much solar energy passes through your window and becomes heat inside. Lower numbers block more heat - great for hot climates. Higher numbers let in more warmth - helpful in cold climates.',
    units: 'Ratio (0.0 to 1.0)',
    goodRange: 'Depends on climate',
    examples: {
      hotClimate: '0.20-0.30 (Blocks most sun heat)',
      mixedClimate: '0.30-0.40 (Balanced)',
      coldClimate: '0.40+ (Welcomes solar heating)'
    },
    impact: 'Right SHGC = Comfortable temperatures = Lower cooling/heating costs',
    tips: ['Lower SHGC for hot, sunny climates', 'Higher SHGC for cold climates to capture free solar heating']
  },

  'vlt': {
    term: 'VLT (Visible Light Transmittance)',
    shortDescription: 'How much natural light comes through',
    detailedDescription: 'VLT shows what percentage of visible light passes through the glass. Higher percentages mean brighter, more naturally lit spaces. It\'s like choosing between sunglasses - clear lenses (high VLT) vs. dark sunglasses (low VLT).',
    units: 'Percentage (%)',
    goodRange: '40-70%',
    examples: {
      high: '60-80% (Bright, airy feeling)',
      medium: '40-60% (Balanced light)',
      low: '20-40% (Darker, more private)'
    },
    impact: 'Higher VLT = More natural light = Less artificial lighting needed',
    tips: ['Higher VLT reduces lighting costs', 'Consider glare protection for south-facing windows']
  },

  'r-value': {
    term: 'R-Value (Thermal Resistance)',
    shortDescription: 'How well glass resists heat flow',
    detailedDescription: 'R-Value is the opposite of U-Factor - it measures how well something resists heat flow. Higher R-Values mean better insulation. It\'s like wall insulation ratings you might know.',
    units: 'h⋅ft²⋅°F/Btu',
    goodRange: '3.0+',
    examples: {
      excellent: 'R-5 to R-7 (Premium windows)',
      good: 'R-3 to R-5 (Quality windows)',
      basic: 'R-1 to R-3 (Standard windows)'
    },
    impact: 'Higher R-Value = Better insulation = More comfort',
    tips: ['R-Value = 1/U-Factor', 'Focus on R-Value if you\'re familiar with insulation ratings']
  }
};

export const performanceMetrics = {
  'thermal-comfort': {
    title: 'Thermal Comfort',
    description: 'How comfortable you feel near the window',
    factors: [
      'Surface temperature of the glass',
      'Cold drafts or air movement',
      'Radiant temperature differences'
    ],
    whyItMatters: 'Even with good room temperature, cold windows can make you feel chilly. Quality glass keeps surface temperatures closer to room temperature.',
    improveWith: ['Lower U-Factor glass', 'Proper installation', 'Warm-edge spacers']
  },

  'condensation': {
    title: 'Condensation Control',
    description: 'Preventing water droplets on windows',
    factors: [
      'Indoor humidity levels',
      'Glass surface temperature', 
      'Temperature difference inside/outside'
    ],
    whyItMatters: 'Condensation can cause mold, damage window frames, and block your view. It happens when warm, humid air meets cold glass.',
    improveWith: ['Better insulating glass', 'Humidity control', 'Proper ventilation']
  },

  'glare-control': {
    title: 'Glare and Visual Comfort',
    description: 'Managing bright light for comfortable viewing',
    factors: [
      'Amount of light transmission',
      'Window orientation and size',
      'Time of day and season'
    ],
    whyItMatters: 'Too much bright light can cause eye strain, make screens hard to see, and create uncomfortable glare.',
    improveWith: ['Appropriate VLT selection', 'Window treatments', 'Proper window placement']
  },

  'energy-efficiency': {
    title: 'Energy Efficiency',
    description: 'How much energy your windows save or cost',
    factors: [
      'Heat loss in winter (U-Factor)',
      'Heat gain in summer (SHGC)',
      'Natural lighting (VLT)'
    ],
    whyItMatters: 'Windows can be the biggest source of energy loss in your home. Efficient windows can cut heating and cooling costs significantly.',
    improveWith: ['Climate-appropriate glass selection', 'Proper sizing', 'Quality installation']
  }
};

export const buildingCodes = {
  'iecc': {
    name: 'International Energy Conservation Code (IECC)',
    description: 'The most widely adopted energy code in the US',
    purpose: 'Sets minimum energy efficiency requirements for new construction and major renovations',
    keyRequirements: [
      'Maximum U-Factor limits by climate zone',
      'Maximum SHGC limits for warmer climates',
      'Air leakage requirements'
    ],
    climateZones: {
      '1-2': 'Hot climates - Focus on blocking solar heat',
      '3-4': 'Mixed climates - Balance of heating and cooling',
      '5-8': 'Cold climates - Focus on preventing heat loss'
    }
  },

  'energy-star': {
    name: 'ENERGY STAR',
    description: 'Voluntary program for high-efficiency products',
    purpose: 'Identifies products that are significantly more efficient than minimum code requirements',
    benefits: [
      'Typically 20-30% more efficient than code minimum',
      'May qualify for rebates and tax credits',
      'Third-party certified performance'
    ]
  }
};

export const climateGuidance = {
  'hot': {
    name: 'Hot Climate (Zones 1-2)',
    characteristics: ['Long, hot summers', 'Mild winters', 'High cooling costs'],
    priorities: ['Block solar heat gain', 'Minimize cooling loads', 'Control glare'],
    recommendations: {
      shgc: 'Low (0.20-0.30) - Block unwanted heat',
      uFactor: 'Less critical - Focus on SHGC',
      vlt: 'Moderate - Balance light and heat'
    },
    tips: [
      'Consider spectrally selective glass',
      'Exterior shading is very effective',
      'Light colors for window frames'
    ]
  },

  'mixed': {
    name: 'Mixed Climate (Zones 3-4)', 
    characteristics: ['Hot summers', 'Cold winters', 'Both heating and cooling needed'],
    priorities: ['Balance heating and cooling', 'Optimize for both seasons', 'Consider orientation'],
    recommendations: {
      shgc: 'Moderate (0.30-0.40) - Seasonal balance',
      uFactor: 'Good (≤0.40) - Important for winter',
      vlt: 'Good (50-70%) - Maximize daylight'
    },
    tips: [
      'South windows can use higher SHGC for winter heat',
      'East/West windows benefit from lower SHGC',
      'Consider seasonal shading strategies'
    ]
  },

  'cold': {
    name: 'Cold Climate (Zones 5-8)',
    characteristics: ['Long, cold winters', 'Short summers', 'High heating costs'],
    priorities: ['Prevent heat loss', 'Capture solar gains', 'Maximize comfort'],
    recommendations: {
      shgc: 'Higher (0.40+) - Welcome solar heating',
      uFactor: 'Low (≤0.30) - Critical for efficiency',
      vlt: 'High (60%+) - Maximize winter light'
    },
    tips: [
      'Triple pane glass is often worth the investment',
      'South-facing windows provide free heating',
      'Minimize north-facing window area'
    ]
  }
};

export const applicationGuidance = {
  'residential': {
    name: 'Residential Applications',
    priorities: ['Comfort', 'Energy savings', 'Natural light', 'Cost effectiveness'],
    considerations: [
      'Occupant comfort is primary concern',
      'Long-term energy savings important',
      'Variety of room types and orientations',
      'Noise control for bedrooms'
    ],
    recommendations: [
      'Focus on thermal comfort metrics',
      'Consider room-specific needs',
      'Balance performance with budget'
    ]
  },

  'commercial': {
    name: 'Commercial Applications',
    priorities: ['Energy codes compliance', 'Productivity', 'Glare control', 'Durability'],
    considerations: [
      'Large window areas amplify performance impact',
      'Daylighting affects worker productivity',
      'HVAC system integration important',
      'Maintenance and durability critical'
    ],
    recommendations: [
      'Exceed minimum code requirements',
      'Consider daylighting controls',
      'Plan for long service life'
    ]
  }
};

// Helper functions for educational content
export const getTooltipContent = (term) => {
  const lowerTerm = term.toLowerCase().replace(/[^a-z]/g, '');
  
  // Map variations to standard terms
  const termMap = {
    'ufactor': 'u-factor',
    'uvalue': 'u-factor',
    'thermaltransmittance': 'u-factor',
    'solarheadgaincoefficient': 'shgc',
    'solarheatgain': 'shgc',
    'visiblelighttransmittance': 'vlt',
    'lighttransmittance': 'vlt',
    'lightttransmission': 'vlt',
    'rvalue': 'r-value',
    'thermalresistance': 'r-value'
  };

  const mappedTerm = termMap[lowerTerm] || lowerTerm;
  return glossary[mappedTerm] || null;
};

export const getContextualHelp = (glassSpecs, climateZone) => {
  const help = [];
  
  if (!glassSpecs) return help;

  // U-Factor guidance
  if (glassSpecs.thermalTransmission) {
    const uFactor = glassSpecs.thermalTransmission;
    if (uFactor > 0.4) {
      help.push({
        type: 'warning',
        title: 'High U-Factor',
        message: 'This glass may allow significant heat loss. Consider higher performance options for better comfort and energy savings.',
        learn: 'u-factor'
      });
    } else if (uFactor <= 0.25) {
      help.push({
        type: 'success', 
        title: 'Excellent Thermal Performance',
        message: 'This glass provides excellent insulation for year-round comfort and energy efficiency.',
        learn: 'u-factor'
      });
    }
  }

  // SHGC guidance based on climate
  if (glassSpecs.solarHeatGainCoefficient && climateZone) {
    const shgc = glassSpecs.solarHeatGainCoefficient;
    if (climateZone.includes('hot') && shgc > 0.4) {
      help.push({
        type: 'warning',
        title: 'High Solar Heat Gain',
        message: 'In hot climates, lower SHGC glass can significantly reduce cooling costs.',
        learn: 'shgc'
      });
    }
  }

  return help;
};

export const formatSpecForDisplay = (spec, value, includeDescription = false) => {
  const content = getTooltipContent(spec);
  if (!content) return { value, unit: '' };

  let formattedValue = value;
  let unit = content.units || '';

  // Format specific values
  if (spec.includes('transmittance') && typeof value === 'number') {
    formattedValue = `${value}%`;
    unit = '';
  }

  if (includeDescription) {
    return {
      value: formattedValue,
      unit,
      description: content.shortDescription,
      goodRange: content.goodRange
    };
  }

  return { value: formattedValue, unit };
};

export default {
  glossary,
  performanceMetrics,
  buildingCodes,
  climateGuidance,
  applicationGuidance,
  getTooltipContent,
  getContextualHelp,
  formatSpecForDisplay
}; 