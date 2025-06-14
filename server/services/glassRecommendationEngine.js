// Advanced Glass Recommendation Engine
// AI-powered glass selection based on project requirements

const { getAllGlassOptions } = require('../db/glassDatabase');

// Climate zone characteristics for intelligent matching
const CLIMATE_PROFILES = {
  'Hot': {
    priority: ['solarControl', 'cooling', 'glare'],
    idealSHGC: { min: 0.15, max: 0.35 },
    idealLightTransmittance: { min: 40, max: 60 },
    weightings: { solarControl: 0.4, thermal: 0.3, light: 0.2, acoustic: 0.1 }
  },
  'Mixed': {
    priority: ['balanced', 'thermal', 'light'],
    idealSHGC: { min: 0.25, max: 0.40 },
    idealLightTransmittance: { min: 55, max: 75 },
    weightings: { solarControl: 0.25, thermal: 0.35, light: 0.3, acoustic: 0.1 }
  },
  'Cold': {
    priority: ['thermal', 'light', 'heating'],
    idealSHGC: { min: 0.30, max: 0.50 },
    idealLightTransmittance: { min: 65, max: 85 },
    weightings: { solarControl: 0.15, thermal: 0.4, light: 0.35, acoustic: 0.1 }
  },
  'Mild': {
    priority: ['costEffective', 'standard'],
    idealSHGC: { min: 0.60, max: 0.80 },
    idealLightTransmittance: { min: 75, max: 90 },
    weightings: { solarControl: 0.1, thermal: 0.2, light: 0.3, acoustic: 0.4 }
  }
};

// Application type requirements
const APPLICATION_PROFILES = {
  'Residential': {
    priorities: ['comfort', 'energy', 'cost'],
    budgetSensitive: true,
    acousticImportance: 0.3,
    aestheticImportance: 0.4
  },
  'Commercial': {
    priorities: ['performance', 'energy', 'durability'],
    budgetSensitive: false,
    acousticImportance: 0.4,
    aestheticImportance: 0.3
  },
  'High-end Projects': {
    priorities: ['premium', 'performance', 'aesthetics'],
    budgetSensitive: false,
    acousticImportance: 0.5,
    aestheticImportance: 0.5
  },
  'Hot Climate': {
    priorities: ['solarControl', 'cooling', 'energy'],
    budgetSensitive: true,
    acousticImportance: 0.2,
    aestheticImportance: 0.2
  },
  'Daylighting': {
    priorities: ['light', 'views', 'balance'],
    budgetSensitive: true,
    acousticImportance: 0.2,
    aestheticImportance: 0.4
  }
};

// Performance scoring algorithms
class GlassRecommendationEngine {
  constructor() {
    this.glassOptions = null;
    this.initializeGlassData();
  }

  async initializeGlassData() {
    this.glassOptions = await getAllGlassOptions();
  }

  // Main recommendation function
  async getRecommendations(criteria) {
    if (!this.glassOptions) {
      await this.initializeGlassData();
    }

    const {
      climateZone = 'Mixed',
      applicationType = 'Residential',
      systemType = 'Windows',
      budget = 'medium',
      priorities = [],
      specialRequirements = []
    } = criteria;

    const allGlass = Object.values(this.glassOptions);
    const scoredGlass = allGlass.map(glass => ({
      ...glass,
      totalScore: 0,
      reasons: []
    }));

    // Calculate total scores and reasons
    scoredGlass.forEach(glass => {
      const climateProfile = CLIMATE_PROFILES[climateZone];
      const appProfile = APPLICATION_PROFILES[applicationType];
      
      // Climate-based scoring
      const climateScore = this.calculateClimateScore(glass, climateProfile, climateZone);
      
      // Application-based scoring
      const applicationScore = this.calculateApplicationScore(glass, appProfile);
      
      // Budget scoring
      const budgetScore = this.calculateBudgetScore(glass, budget);
      
      // Special requirements scoring
      const specialScore = this.calculateSpecialRequirementsScore(glass, specialRequirements);
      
      // Weighted total score
      glass.totalScore = (
        climateScore * 0.3 +
        applicationScore * 0.3 +
        budgetScore * 0.2 +
        specialScore * 0.2
      );
      
      // Generate recommendation reasons
      glass.reasons = this.generateReasons(glass, criteria, climateProfile, appProfile);
    });

    // Sort by total score and return top recommendations
    const recommendations = scoredGlass
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
      .map((glass, index) => ({
        rank: index + 1,
        confidence: Math.min(Math.round(glass.totalScore * 100), 98),
        glass: {
          id: glass.id,
          productCode: glass.productCode,
          type: glass.type,
          category: glass.category,
          price: glass.price,
          specifications: glass.specifications,
          features: glass.features,
          description: glass.description
        },
        matchReasons: glass.reasons,
        performanceHighlights: this.getPerformanceHighlights(glass, criteria),
        costBenefit: this.calculateCostBenefit(glass, criteria)
      }));

    return {
      recommendations,
      criteria,
      analysis: this.generateAnalysis(recommendations, criteria),
      alternativeConsiderations: this.getAlternativeConsiderations(scoredGlass, criteria)
    };
  }

  // Climate-based scoring
  calculateClimateScore(glass, climateProfile, climateZone) {
    if (!glass.specifications) return 0.5; // Standard glass default

    const specs = glass.specifications;
    let score = 0;

    // SHGC scoring
    if (specs.solarHeatGainCoefficient) {
      const shgc = specs.solarHeatGainCoefficient;
      const ideal = climateProfile.idealSHGC;
      if (shgc >= ideal.min && shgc <= ideal.max) {
        score += 0.4;
      } else {
        const distance = Math.min(
          Math.abs(shgc - ideal.min),
          Math.abs(shgc - ideal.max)
        );
        score += Math.max(0, 0.4 - (distance * 2));
      }
    }

    // Light transmittance scoring
    if (specs.lightTransmittance) {
      const lt = specs.lightTransmittance;
      const ideal = climateProfile.idealLightTransmittance;
      if (lt >= ideal.min && lt <= ideal.max) {
        score += 0.3;
      } else {
        const distance = Math.min(
          Math.abs(lt - ideal.min),
          Math.abs(lt - ideal.max)
        ) / 100;
        score += Math.max(0, 0.3 - distance);
      }
    }

    // Climate zone compatibility
    if (specs.climateZones && specs.climateZones.includes(climateZone)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  // Application-based scoring
  calculateApplicationScore(glass, appProfile) {
    if (!glass.specifications) return appProfile.budgetSensitive ? 0.7 : 0.3;

    let score = 0;
    const specs = glass.specifications;

    // Application compatibility
    if (specs.applications) {
      const hasMatchingApp = appProfile.priorities.some(priority => 
        specs.applications.some(app => 
          app.toLowerCase().includes(priority.toLowerCase()) ||
          priority.toLowerCase().includes(app.toLowerCase())
        )
      );
      if (hasMatchingApp) score += 0.4;
    }

    // Acoustic performance for application
    if (specs.acousticValue) {
      const acousticScore = specs.acousticValue / 50; // Normalize to 0-1
      score += acousticScore * appProfile.acousticImportance * 0.3;
    }

    // Energy rating bonus
    if (specs.energyRating === 'A+') {
      score += 0.3;
    } else if (specs.energyRating === 'A') {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  // Budget-based scoring
  calculateBudgetScore(glass, budget) {
    const price = glass.price;
    const budgetRanges = {
      'low': { max: 15, ideal: 12.5 },
      'medium': { max: 22, ideal: 18.75 },
      'high': { max: 30, ideal: 25 },
      'premium': { max: 50, ideal: 35 }
    };

    const range = budgetRanges[budget] || budgetRanges['medium'];
    
    if (price <= range.ideal) {
      return 1.0;
    } else if (price <= range.max) {
      return 0.7;
    } else {
      return Math.max(0, 1 - ((price - range.max) / range.max));
    }
  }

  // Special requirements scoring
  calculateSpecialRequirementsScore(glass, requirements) {
    if (!requirements.length) return 1.0;
    
    let score = 0;
    const totalRequirements = requirements.length;

    requirements.forEach(req => {
      switch (req.toLowerCase()) {
        case 'acoustic':
          if (glass.specifications?.acousticValue >= 30) score += 1;
          break;
        case 'security':
          if (glass.features?.includes('Enhanced security')) score += 1;
          break;
        case 'energy':
          if (glass.specifications?.energyRating === 'A+') score += 1;
          break;
        case 'solar control':
          if (glass.specifications?.solarHeatGainCoefficient <= 0.3) score += 1;
          break;
        case 'maximum light':
          if (glass.specifications?.lightTransmittance >= 60) score += 1;
          break;
        default:
          score += 0.5; // Partial credit for unspecified requirements
      }
    });

    return totalRequirements > 0 ? score / totalRequirements : 1.0;
  }

  // Generate human-readable reasons
  generateReasons(glass, criteria, climateProfile, appProfile) {
    const reasons = [];
    const specs = glass.specifications;

    // Climate-based reasons
    if (specs?.climateZones?.includes(criteria.climateZone)) {
      reasons.push(`Specifically designed for ${criteria.climateZone} climate zones`);
    }

    // Performance reasons
    if (specs?.solarHeatGainCoefficient <= 0.3) {
      reasons.push(`Excellent solar control (SHGC: ${specs.solarHeatGainCoefficient}) reduces cooling costs`);
    }

    if (specs?.lightTransmittance >= 60) {
      reasons.push(`High light transmission (${specs.lightTransmittance}%) maximizes natural daylight`);
    }

    if (specs?.thermalTransmission === '0.2 W/m²K') {
      reasons.push(`Superior thermal insulation for energy efficiency`);
    }

    if (specs?.acousticValue >= 30) {
      reasons.push(`Enhanced acoustic performance (${specs.acousticValue}dB) for comfort`);
    }

    // Application-based reasons
    if (specs?.applications?.includes(criteria.applicationType)) {
      reasons.push(`Recommended for ${criteria.applicationType} applications`);
    }

    // Energy rating reasons
    if (specs?.energyRating === 'A+') {
      reasons.push(`A+ energy rating ensures maximum efficiency`);
    }

    // Budget reasons
    if (glass.price <= 20) {
      reasons.push(`Cost-effective option with professional performance`);
    } else if (glass.price >= 22) {
      reasons.push(`Premium performance justifies investment`);
    }

    return reasons.slice(0, 4); // Return top 4 reasons
  }

  // Performance highlights
  getPerformanceHighlights(glass, criteria) {
    const highlights = [];
    const specs = glass.specifications;

    if (specs) {
      highlights.push({
        metric: 'Energy Efficiency',
        value: specs.energyRating || 'Standard',
        description: 'Overall energy performance rating'
      });

      if (specs.lightTransmittance) {
        highlights.push({
          metric: 'Daylight Transmission', 
          value: `${specs.lightTransmittance}%`,
          description: 'Natural light entering the space'
        });
      }

      if (specs.solarHeatGainCoefficient) {
        highlights.push({
          metric: 'Solar Control',
          value: specs.solarHeatGainCoefficient,
          description: 'Heat gain management'
        });
      }

      if (specs.acousticValue) {
        highlights.push({
          metric: 'Sound Reduction',
          value: `${specs.acousticValue}dB`,
          description: 'Noise control performance'
        });
      }
    }

    return highlights;
  }

  // Cost-benefit analysis
  calculateCostBenefit(glass, criteria) {
    const standardPrice = 12.5; // Double pane baseline
    const priceDifference = glass.price - standardPrice;
    
    let energySavings = 0;
    if (glass.specifications?.energyRating === 'A+') {
      energySavings = 300; // Annual savings estimate
    } else if (glass.specifications?.energyRating === 'A') {
      energySavings = 200;
    }

    const paybackYears = energySavings > 0 ? Math.round((priceDifference * 50) / energySavings * 10) / 10 : null;

    return {
      premiumCost: priceDifference > 0 ? `$${priceDifference.toFixed(2)}/sq ft` : 'No premium',
      annualSavings: energySavings > 0 ? `$${energySavings}/year` : 'Standard efficiency',
      paybackPeriod: paybackYears ? `${paybackYears} years` : 'Not applicable',
      longTermValue: energySavings > 0 ? 'High' : 'Standard'
    };
  }

  // Generate overall analysis
  generateAnalysis(recommendations, criteria) {
    const topChoice = recommendations[0];
    
    return {
      summary: `Based on your ${criteria.climateZone} climate and ${criteria.applicationType} application, we recommend ${topChoice.glass.type} for optimal performance.`,
      keyFactors: [
        `Climate zone: ${criteria.climateZone}`,
        `Application: ${criteria.applicationType}`,
        `Budget range: ${criteria.budget}`,
        `System type: ${criteria.systemType}`
      ],
      confidence: topChoice.confidence,
      alternativeCount: recommendations.length - 1
    };
  }

  // Alternative considerations
  getAlternativeConsiderations(scoredGlass, criteria) {
    return [
      {
        consideration: 'Budget Optimization',
        suggestion: 'Consider standard options for cost savings with good performance',
        relevantGlass: scoredGlass.filter(g => g.price <= 15).slice(0, 2)
      },
      {
        consideration: 'Maximum Performance',
        suggestion: 'Premium options for best-in-class energy efficiency',
        relevantGlass: scoredGlass.filter(g => g.specifications?.energyRating === 'A+').slice(0, 2)
      }
    ];
  }
}

// Singleton instance
const recommendationEngine = new GlassRecommendationEngine();

module.exports = {
  GlassRecommendationEngine,
  recommendationEngine,
  CLIMATE_PROFILES,
  APPLICATION_PROFILES
}; 