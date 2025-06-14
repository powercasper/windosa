const express = require('express');
const router = express.Router();
const { 
  unitCostPerSqft, 
  laborRates,
  systemHierarchy,
  systemArchitecture,
  finishOptions,
  windowOperables,
  doorOperables,
  systemBrands 
} = require('../db/metaData');
const { getGlassByType } = require('../db/glassDatabase');

// Get metadata endpoint
router.get('/metadata', (req, res) => {
  try {
    res.json({
      systemTypes: Object.keys(systemHierarchy),
      systemHierarchy,
      systemArchitecture,
      finishOptions,
      windowOperables,
      doorOperables,
      systemBrands
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Helper function to get glass price from database
const getGlassPrice = (glassType) => {
  // First try to get from database
  const glassData = getGlassByType(glassType);
  if (glassData && glassData.price) {
    console.log(`✅ Database price found for ${glassType}: $${glassData.price}`);
    return glassData.price;
  }
  
  // Fallback for unknown glass types
  console.log(`⚠️ No database price found for ${glassType}, using fallback: $12.5`);
  return 12.5; // Default fallback price
};

// Helper function to calculate pricing
const calculatePricing = (configuration) => {
  console.log('\n=== PRICING CALCULATION START ===');
  console.log('Configuration:', JSON.stringify({
    brand: configuration.brand,
    systemModel: configuration.systemModel,
    systemType: configuration.systemType,
    operationType: configuration.operationType,
    dimensions: configuration.dimensions,
    glassType: configuration.glassType
  }, null, 2));

  let totalSystemCost = 0;
  let totalGlassCost = 0;
  let totalLaborCost = 0;
  let totalArea = 0;

  // Get glass price from database instead of hard-coded rates
  const glassUnitCost = getGlassPrice(configuration.glassType);
  console.log('\nGlass Calculation:');
  console.log('- Selected glass type:', configuration.glassType);
  console.log('- Glass unit cost from database:', glassUnitCost);

  if (configuration.systemType === 'Entrance Doors') {
    // Calculate door panel area and cost
    const doorHeight = configuration.dimensions.height;
    const doorWidth = configuration.dimensions.width;
    const doorArea = (doorWidth * doorHeight) / 144; // Convert to sq ft
    
    // Safely access door unit cost with fallback
    let doorUnitCost = 0;
    try {
      const brandCosts = unitCostPerSqft[configuration.brand];
      if (brandCosts && brandCosts[configuration.systemModel] && typeof brandCosts[configuration.systemModel] === 'object') {
        doorUnitCost = brandCosts[configuration.systemModel][configuration.openingType];
      }
    } catch (error) {
      console.warn('Error accessing door cost for', configuration.brand, configuration.systemModel, configuration.openingType);
    }

    // Use fallback values if doorUnitCost is not found
    if (!doorUnitCost) {
      const fallbackDoorCosts = {
        'Single Door': 70,
        'Double Door': 75,
        'Pivot Door': 85
      };
      doorUnitCost = fallbackDoorCosts[configuration.openingType] || 70;
      console.warn(`Using fallback door cost ${doorUnitCost} for ${configuration.brand} ${configuration.systemModel} ${configuration.openingType}`);
    }
    
    totalSystemCost += doorArea * doorUnitCost;
    totalGlassCost += doorArea * glassUnitCost;
    totalArea += doorArea;

    // Calculate fixed glass areas (sidelights and transom) with safe access
    let fixedUnitCost = 0;
    try {
      const brandCosts = unitCostPerSqft[configuration.brand];
      if (brandCosts && brandCosts[configuration.systemModel] && typeof brandCosts[configuration.systemModel] === 'object') {
        fixedUnitCost = brandCosts[configuration.systemModel]['Fixed'];
      }
    } catch (error) {
      console.warn('Error accessing fixed cost for', configuration.brand, configuration.systemModel);
    }

    // Use fallback for fixed panels if not found
    if (!fixedUnitCost) {
      fixedUnitCost = 32; // Default fixed panel cost
      console.warn(`Using fallback fixed cost ${fixedUnitCost} for ${configuration.brand} ${configuration.systemModel}`);
    }

    // Sidelights
    if (configuration.leftSidelight?.enabled) {
      const sidelightArea = (configuration.leftSidelight.width * doorHeight) / 144;
      totalSystemCost += sidelightArea * fixedUnitCost;
      totalGlassCost += sidelightArea * glassUnitCost;
      totalArea += sidelightArea;
    }
    if (configuration.rightSidelight?.enabled) {
      const sidelightArea = (configuration.rightSidelight.width * doorHeight) / 144;
      totalSystemCost += sidelightArea * fixedUnitCost;
      totalGlassCost += sidelightArea * glassUnitCost;
      totalArea += sidelightArea;
    }

    // Transom
    if (configuration.transom?.enabled) {
      const transomWidth = (configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) +
                          doorWidth +
                          (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0);
      const transomArea = (transomWidth * configuration.transom.height) / 144;
      totalSystemCost += transomArea * fixedUnitCost;
      totalGlassCost += transomArea * glassUnitCost;
      totalArea += transomArea;
    }

    // Calculate labor cost
    const laborRate = configuration.openingType === 'Pivot Door' ? 
      laborRates['Pivot'] : 
      laborRates['Hinged Left Open In']; // Use standard hinge rate for regular doors
    totalLaborCost = laborRate * totalArea;
  } else if (configuration.systemType === 'Windows' && configuration.panels) {
    // Calculate costs for each panel if it's a window with multiple panels
    configuration.panels.forEach(panel => {
      const panelArea = (panel.width * configuration.dimensions.height) / 144;
      totalArea += panelArea;

      // Safely access system unit cost with fallback values
      let systemUnitCost = 0;
      try {
        const brandCosts = unitCostPerSqft[configuration.brand];
        if (brandCosts && brandCosts[configuration.systemModel] && typeof brandCosts[configuration.systemModel] === 'object') {
          systemUnitCost = brandCosts[configuration.systemModel][panel.operationType];
        }
      } catch (error) {
        console.warn('Error accessing system cost for', configuration.brand, configuration.systemModel, panel.operationType);
      }

      // Use fallback values if systemUnitCost is not found
      if (!systemUnitCost) {
        // Default fallback costs per operation type
        const fallbackCosts = {
          'Fixed': 25,
          'Tilt & Turn': 40,
          'Casement': 32,
          'Awning': 30,
          'Tilt Only': 37
        };
        systemUnitCost = fallbackCosts[panel.operationType] || 30;
        console.warn(`Using fallback cost ${systemUnitCost} for ${configuration.brand} ${configuration.systemModel} ${panel.operationType}`);
      }

      totalSystemCost += systemUnitCost * panelArea;
      totalGlassCost += glassUnitCost * panelArea;
      
      const laborRate = laborRates[panel.operationType] || 5; // Fallback labor rate
      totalLaborCost += laborRate * panelArea;
    });
  } else if (configuration.systemType === 'Sliding Doors') {
    console.log('\nSliding Door Calculation:');
    
    // Validate dimensions
    if (!configuration.dimensions?.width || !configuration.dimensions?.height) {
      console.error('ERROR: Invalid dimensions:', configuration.dimensions);
      return {
        systemCost: 0,
        glassCost: 0,
        laborCost: 0,
        total: 0,
        area: 0
      };
    }

    // Calculate area
    const width = Number(configuration.dimensions.width);
    const height = Number(configuration.dimensions.height);
    const area = (width * height) / 144;
    totalArea = area;
    
    console.log('Area Calculation:');
    console.log('- Width:', width);
    console.log('- Height:', height);
    console.log('- Area (sq ft):', area);
    
    // Safely access sliding door costs with fallback
    let costs = null;
    try {
      const brandCosts = unitCostPerSqft[configuration.brand];
      if (brandCosts && brandCosts[configuration.systemModel] && typeof brandCosts[configuration.systemModel] === 'object') {
        costs = brandCosts[configuration.systemModel];
      }
    } catch (error) {
      console.warn('Error accessing sliding door costs for', configuration.brand, configuration.systemModel);
    }
    
    console.log('\nCost Configuration:');
    console.log('- Model:', configuration.systemModel);
    console.log('- Available costs:', JSON.stringify(costs, null, 2));
    
    // Ensure we have valid costs object or use fallback pricing
    if (!costs) {
      console.warn('No costs found for', configuration.brand, configuration.systemModel, '- using fallback pricing');
      // Use a generic fallback cost for sliding doors
      const fallbackSystemUnitCost = 32;
      totalSystemCost = Number(fallbackSystemUnitCost) * Number(area);
      totalGlassCost = Number(glassUnitCost) * Number(area);
      
      // Labor cost calculation with fallback
      const numPanels = configuration.operationType.length;
      const fallbackLaborRate = 10;
      totalLaborCost = Number(fallbackLaborRate) * Number(area);
      
      console.log('Using fallback pricing:');
      console.log('- System cost:', fallbackSystemUnitCost);
      console.log('- Labor rate:', fallbackLaborRate);
    } else {

    let systemUnitCost = 0;
    
    console.log('\nPanel Configuration:');
    console.log('- Operation type:', configuration.operationType);
    console.log('- Number of panels:', configuration.operationType.length);
    
    // Special handling for 5 panels
    if (configuration.operationType.length === 5) {
      // Check if we have a direct match for the configuration
      if (costs[configuration.operationType]) {
        systemUnitCost = Number(costs[configuration.operationType]);
        console.log('\n5-Panel Direct Cost:');
        console.log('- Using rate for', configuration.operationType + ':', systemUnitCost);
      } else {
        // If no direct match, determine the best rate based on panel composition
        const numFixed = (configuration.operationType.match(/O/g) || []).length;
        const numSliding = (configuration.operationType.match(/X/g) || []).length;
        
        if (numFixed === 1) {
          // One fixed panel (OXXXX or XXXXO)
          systemUnitCost = Number(costs['OXXXX'] || 33.9);
          console.log('\n5-Panel One Fixed Cost:');
          console.log('- Using OXXXX/XXXXO rate:', systemUnitCost);
        } else if (numFixed === 2) {
          // Check if fixed panels are together
          if (configuration.operationType.includes('OO')) {
            systemUnitCost = Number(costs['OOXXX'] || 33.2);
            console.log('\n5-Panel Two Fixed Together Cost:');
            console.log('- Using OOXXX rate:', systemUnitCost);
          } else {
            systemUnitCost = Number(costs['OXXXO'] || 33.5);
            console.log('\n5-Panel Two Fixed Split Cost:');
            console.log('- Using OXXXO rate:', systemUnitCost);
          }
        } else {
          // Fallback to OXXXX rate for any other combination
          systemUnitCost = Number(costs['OXXXX'] || 33.9);
          console.log('\n5-Panel Fallback Cost:');
          console.log('- Using OXXXX fallback rate:', systemUnitCost);
        }
      }
    }
    // Special handling for 6 panels
    else if (configuration.operationType.length === 6) {
      // Check if we have a direct match for the configuration
      if (costs[configuration.operationType]) {
        systemUnitCost = Number(costs[configuration.operationType]);
        console.log('\n6-Panel Direct Cost:');
        console.log('- Using rate for', configuration.operationType + ':', systemUnitCost);
      } else {
        // If no direct match, use appropriate base rate based on panel composition
        const numFixed = (configuration.operationType.match(/O/g) || []).length;
        const numSliding = (configuration.operationType.match(/X/g) || []).length;
        
        if (numFixed === 0) {
          // All sliding panels (XXXXXX)
          systemUnitCost = Number(costs['XXXXXX'] || 35.5);
          console.log('\n6-Panel All Sliding Cost:');
          console.log('- Using XXXXXX rate:', systemUnitCost);
        } else if (numFixed === 2) {
          // Two fixed panels (OXXXXO)
          systemUnitCost = Number(costs['OXXXXO'] || 34.32);
          console.log('\n6-Panel Two Fixed Cost:');
          console.log('- Using OXXXXO rate:', systemUnitCost);
        } else if (numFixed === 4) {
          // Four fixed panels (OOXXOO)
          systemUnitCost = Number(costs['OOXXOO'] || 33.8);
          console.log('\n6-Panel Four Fixed Cost:');
          console.log('- Using OOXXOO rate:', systemUnitCost);
        } else {
          // Fallback to OXXXXO rate for any other combination
          systemUnitCost = Number(costs['OXXXXO'] || 34.32);
          console.log('\n6-Panel Fallback Cost:');
          console.log('- Using OXXXXO fallback rate:', systemUnitCost);
        }
      }
    }
    // Use existing configuration cost if available
    else if (costs[configuration.operationType]) {
      systemUnitCost = Number(costs[configuration.operationType]);
      console.log('\nDirect Configuration Cost:');
      console.log('- Using rate for', configuration.operationType + ':', systemUnitCost);
    }
    // Fallback for unknown configurations
    else {
      systemUnitCost = Number(costs['OXXO'] || 31.16);
      console.log('\nFallback Cost:');
      console.log('- Using OXXO fallback rate:', systemUnitCost);
    }

    console.log('\nFinal Cost Calculation:');
    console.log('- System unit cost:', systemUnitCost);
    console.log('- Area:', area);
    console.log('- Glass unit cost:', glassUnitCost);

    // Calculate costs with explicit number conversion
    totalSystemCost = Number(systemUnitCost) * Number(area);
    totalGlassCost = Number(glassUnitCost) * Number(area);
    
    // Labor cost calculation
    const numPanels = configuration.operationType.length;
    const numFixed = (configuration.operationType.match(/O/g) || []).length;
    const numSliding = (configuration.operationType.match(/X/g) || []).length;
    
    const fixedLaborRate = Number(laborRates['Sliding Fixed'] || 10);
    const slidingLaborRate = Number(laborRates['Sliding →'] || 10);
    const avgLaborRate = ((numFixed * fixedLaborRate) + (numSliding * slidingLaborRate)) / numPanels;
    totalLaborCost = Number(avgLaborRate) * Number(area);

    console.log('\nLabor Cost Calculation:');
    console.log('- Fixed panels:', numFixed);
    console.log('- Sliding panels:', numSliding);
    console.log('- Fixed labor rate:', fixedLaborRate);
    console.log('- Sliding labor rate:', slidingLaborRate);
    console.log('- Average labor rate:', avgLaborRate);

    console.log('\nPre-rounding Costs:');
    console.log('- System cost:', totalSystemCost);
    console.log('- Glass cost:', totalGlassCost);
    console.log('- Labor cost:', totalLaborCost);
    console.log('- Total area:', totalArea);
    }
  }

  // Ensure all final values are valid numbers
  const result = {
    systemCost: Number(totalSystemCost.toFixed(2)) || 0,
    glassCost: Number(totalGlassCost.toFixed(2)) || 0,
    laborCost: Number(totalLaborCost.toFixed(2)) || 0,
    total: Number((totalSystemCost + totalGlassCost + totalLaborCost).toFixed(2)) || 0,
    area: Number(totalArea.toFixed(2)) || 0
  };

  console.log('\nFinal Result:');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n=== PRICING CALCULATION END ===\n');
  
  return result;
};

// Generate a quote
router.post('/quotes/generate', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }

    // Validate all items
    for (const item of items) {
      if (!item.brand || !item.systemType || !item.systemModel || 
          !item.dimensions || !item.glassType) {
        return res.status(400).json({ error: 'Missing required configuration fields in one or more items' });
      }
    }

    // Calculate pricing for each item
    const itemsWithPricing = items.map(item => ({
      configuration: item,
      pricing: calculatePricing(item)
    }));

    // Calculate totals
    const totals = itemsWithPricing.reduce((acc, { pricing }) => ({
      systemCost: acc.systemCost + pricing.systemCost,
      glassCost: acc.glassCost + pricing.glassCost,
      laborCost: acc.laborCost + pricing.laborCost,
      total: acc.total + pricing.total
    }), { systemCost: 0, glassCost: 0, laborCost: 0, total: 0 });

    // Generate quote number
    const quoteNumber = `Q${Date.now()}`;

    // Create quote object
    const quote = {
      quoteNumber,
      date: new Date(),
      items: itemsWithPricing,
      totals,
      status: 'pending'
    };

    res.json(quote);
  } catch (error) {
    console.error('Error generating quote:', error);
    res.status(500).json({ error: 'Failed to generate quote' });
  }
});

module.exports = router; 