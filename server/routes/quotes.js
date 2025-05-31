const express = require('express');
const router = express.Router();
const generateQuotePDF = require('../utils/pdfGenerator');
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
    // Existing sliding doors calculation logic
    const area = (configuration.dimensions.width * configuration.dimensions.height) / 144;
    totalArea = area;
    
    const systemUnitCost = unitCostPerSqft[configuration.brand][configuration.systemModel][configuration.operationType];
    totalSystemCost = systemUnitCost * area;
    totalGlassCost = glassUnitCost * area;

    const numPanels = configuration.operationType.length;
    const numFixed = (configuration.operationType.match(/O/g) || []).length;
    const numSliding = (configuration.operationType.match(/X/g) || []).length;
    
    const fixedLaborRate = laborRates['Sliding Fixed'];
    const slidingLaborRate = laborRates['Sliding →'];
    const avgLaborRate = ((numFixed * fixedLaborRate) + (numSliding * slidingLaborRate)) / numPanels;
    totalLaborCost = avgLaborRate * area;
  }

  return {
    systemCost: totalSystemCost,
    glassCost: totalGlassCost,
    laborCost: totalLaborCost,
    total: totalSystemCost + totalGlassCost + totalLaborCost,
    area: totalArea
  };
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

// Generate PDF quote
router.post('/quotes/generate-pdf', async (req, res) => {
  try {
    const { quote } = req.body;
    
    if (!quote) {
      return res.status(400).json({ error: 'Quote data is required' });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateQuotePDF(quote);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quote-${quote.quoteNumber}.pdf`);
    
    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router; 