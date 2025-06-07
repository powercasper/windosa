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

  // Glass rates
  const glassRates = {
    'Double Pane': 12.5,
    'Triple Pane': 18.75,
    'Security Glass': 22,
    'Acoustic Glass': 25
  };
  const glassUnitCost = glassRates[configuration.glassType] || glassRates['Double Pane'];
  console.log('\nGlass Calculation:');
  console.log('- Selected glass type:', configuration.glassType);
  console.log('- Glass unit cost:', glassUnitCost);

  if (configuration.systemType === 'Entrance Doors') {
    // Calculate door panel area and cost
    const doorHeight = configuration.dimensions.height;
    const doorWidth = configuration.dimensions.width;
    const doorArea = (doorWidth * doorHeight) / 144; // Convert to sq ft
    const doorUnitCost = unitCostPerSqft[configuration.brand][configuration.systemModel][configuration.openingType];
    
    totalSystemCost += doorArea * doorUnitCost;
    totalGlassCost += doorArea * glassUnitCost;
    totalArea += doorArea;

    // Calculate fixed glass areas (sidelights and transom)
    const fixedUnitCost = unitCostPerSqft[configuration.brand][configuration.systemModel]['Fixed'];

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
    // Existing window calculation logic
    configuration.panels.forEach(panel => {
      const panelArea = (panel.width * configuration.dimensions.height) / 144;
      totalArea += panelArea;

      const systemUnitCost = unitCostPerSqft[configuration.brand][configuration.systemModel][panel.operationType];
      totalSystemCost += systemUnitCost * panelArea;
      totalGlassCost += glassUnitCost * panelArea;
      
      const laborRate = laborRates[panel.operationType];
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
    
    // Get base configuration costs
    const costs = unitCostPerSqft[configuration.brand]?.[configuration.systemModel];
    console.log('\nCost Configuration:');
    console.log('- Model:', configuration.systemModel);
    console.log('- Available costs:', JSON.stringify(costs, null, 2));
    
    // Ensure we have valid costs object
    if (!costs) {
      console.error('ERROR: No costs found for', configuration.brand, configuration.systemModel);
      return {
        systemCost: 0,
        glassCost: 0,
        laborCost: 0,
        total: 0,
        area: 0
      };
    }

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