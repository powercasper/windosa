const express = require('express');
const router = express.Router();
const { recommendationEngine, CLIMATE_PROFILES, APPLICATION_PROFILES } = require('../services/glassRecommendationEngine');

// POST /api/recommendations/glass - Get glass recommendations based on criteria
router.post('/glass', async (req, res) => {
  try {
    const criteria = req.body;
    
    // Validate required criteria
    if (!criteria) {
      return res.status(400).json({
        success: false,
        error: 'Recommendation criteria are required'
      });
    }

    // Get recommendations from the engine
    const recommendations = await recommendationEngine.getRecommendations(criteria);
    
    res.json({
      success: true,
      data: recommendations,
      requestId: `rec_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating glass recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error.message
    });
  }
});

// GET /api/recommendations/profiles - Get available climate and application profiles
router.get('/profiles', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        climateProfiles: Object.keys(CLIMATE_PROFILES).map(key => ({
          id: key,
          name: key,
          ...CLIMATE_PROFILES[key]
        })),
        applicationProfiles: Object.keys(APPLICATION_PROFILES).map(key => ({
          id: key,
          name: key,
          ...APPLICATION_PROFILES[key]
        })),
        budgetOptions: [
          { id: 'low', name: 'Budget Conscious', range: 'Up to $15/sq ft' },
          { id: 'medium', name: 'Balanced Value', range: '$15-22/sq ft' },
          { id: 'high', name: 'Premium Performance', range: '$22-30/sq ft' },
          { id: 'premium', name: 'Best Available', range: '$30+/sq ft' }
        ],
        specialRequirements: [
          { id: 'acoustic', name: 'Enhanced Acoustic Performance' },
          { id: 'security', name: 'Security & Safety' },
          { id: 'energy', name: 'Maximum Energy Efficiency' },
          { id: 'solar control', name: 'Superior Solar Control' },
          { id: 'maximum light', name: 'Maximum Natural Light' }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching recommendation profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendation profiles'
    });
  }
});

// POST /api/recommendations/quick - Quick recommendation based on basic criteria
router.post('/quick', async (req, res) => {
  try {
    const { systemType, climateZone, budget = 'medium' } = req.body;
    
    if (!systemType || !climateZone) {
      return res.status(400).json({
        success: false,
        error: 'systemType and climateZone are required for quick recommendations'
      });
    }

    // Determine application type based on system type
    let applicationType = 'Residential';
    if (systemType === 'Commercial Windows' || systemType === 'Commercial Doors') {
      applicationType = 'Commercial';
    }

    const criteria = {
      systemType,
      climateZone,
      applicationType,
      budget,
      priorities: [],
      specialRequirements: []
    };

    const recommendations = await recommendationEngine.getRecommendations(criteria);
    
    // Return only top 3 for quick recommendations
    const quickRecommendations = {
      ...recommendations,
      recommendations: recommendations.recommendations.slice(0, 3)
    };
    
    res.json({
      success: true,
      data: quickRecommendations,
      type: 'quick',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating quick recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quick recommendations',
      details: error.message
    });
  }
});

// GET /api/recommendations/glass/:glassType/analysis - Get detailed analysis for specific glass
router.get('/glass/:glassType/analysis', async (req, res) => {
  try {
    const { glassType } = req.params;
    const { climateZone = 'Mixed', applicationType = 'Residential' } = req.query;
    
    const decodedGlassType = decodeURIComponent(glassType);
    
    // Get single glass recommendation for detailed analysis
    const criteria = {
      climateZone,
      applicationType,
      budget: 'medium',
      priorities: [],
      specialRequirements: []
    };
    
    const recommendations = await recommendationEngine.getRecommendations(criteria);
    const targetGlass = recommendations.recommendations.find(r => 
      r.glass.type === decodedGlassType || 
      r.glass.productCode === decodedGlassType
    );
    
    if (!targetGlass) {
      return res.status(404).json({
        success: false,
        error: `Analysis not available for glass type: ${decodedGlassType}`
      });
    }
    
    res.json({
      success: true,
      data: {
        glass: targetGlass.glass,
        analysis: {
          confidence: targetGlass.confidence,
          matchReasons: targetGlass.matchReasons,
          performanceHighlights: targetGlass.performanceHighlights,
          costBenefit: targetGlass.costBenefit,
          climateCompatibility: targetGlass.glass.specifications?.climateZones || [],
          applicationSuitability: targetGlass.glass.specifications?.applications || []
        },
        recommendations: {
          bestFor: this.getBestApplications(targetGlass.glass),
          notRecommendedFor: this.getNotRecommendedApplications(targetGlass.glass),
          alternatives: recommendations.recommendations
            .filter(r => r.glass.id !== targetGlass.glass.id)
            .slice(0, 3)
        }
      }
    });
    
  } catch (error) {
    console.error('Error generating glass analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate glass analysis',
      details: error.message
    });
  }
});

// Helper functions for detailed analysis
function getBestApplications(glass) {
  const applications = [];
  const specs = glass.specifications;
  
  if (specs?.climateZones?.includes('Hot')) {
    applications.push('Hot climate installations');
  }
  if (specs?.lightTransmittance >= 60) {
    applications.push('Daylighting optimization');
  }
  if (specs?.acousticValue >= 30) {
    applications.push('Noise-sensitive environments');
  }
  if (specs?.energyRating === 'A+') {
    applications.push('Energy-efficient buildings');
  }
  
  return applications;
}

function getNotRecommendedApplications(glass) {
  const notRecommended = [];
  const specs = glass.specifications;
  
  if (specs?.solarHeatGainCoefficient > 0.5) {
    notRecommended.push('Hot climate cooling-critical applications');
  }
  if (specs?.lightTransmittance < 40) {
    notRecommended.push('Maximum daylight requirements');
  }
  if (!specs?.climateZones?.includes('Cold')) {
    notRecommended.push('Extreme cold climate installations');
  }
  
  return notRecommended;
}

// GET /api/recommendations/health - Health check for recommendation service
router.get('/health', async (req, res) => {
  try {
    // Test basic recommendation functionality
    const testCriteria = {
      climateZone: 'Mixed',
      applicationType: 'Residential',
      budget: 'medium'
    };
    
    const testRecommendations = await recommendationEngine.getRecommendations(testCriteria);
    
    res.json({
      success: true,
      status: 'healthy',
      service: 'Glass Recommendation Engine',
      data: {
        engineStatus: 'operational',
        availableProfiles: {
          climate: Object.keys(CLIMATE_PROFILES).length,
          application: Object.keys(APPLICATION_PROFILES).length
        },
        testRecommendations: testRecommendations.recommendations.length,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Recommendation service health check failed:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      service: 'Glass Recommendation Engine',
      error: error.message
    });
  }
});

module.exports = router; 