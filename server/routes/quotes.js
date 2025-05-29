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
  doorOperables 
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
      doorOperables
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// Helper function to calculate pricing
const calculatePricing = (configuration) => {
  const area = (configuration.dimensions.width * configuration.dimensions.height) / 144; // Convert to sq ft
  
  // Glass rates
  const glassRates = {
    'Double Pane': 12.5,
    'Triple Pane': 18.75,
    'Security Glass': 22,
    'Acoustic Glass': 25
  };

  // Calculate system cost
  let systemUnitCost = 0;
  if (configuration.systemType === 'Windows' || configuration.systemType === 'Entrance Doors') {
    systemUnitCost = unitCostPerSqft[configuration.brand][configuration.systemModel][configuration.operationType || 'Fixed'];
  } else {
    const systemRates = unitCostPerSqft[configuration.brand][configuration.systemModel];
    systemUnitCost = Object.values(systemRates)[0];
  }
  const systemCost = systemUnitCost * area;

  // Calculate glass cost
  const glassUnitCost = glassRates[configuration.glassType] || glassRates['Double Pane'];
  const glassCost = glassUnitCost * area;

  // Calculate labor cost
  const laborRate = configuration.operationType ? 
    laborRates[configuration.operationType] : 
    laborRates['Fixed'];
  const laborCost = laborRate * area;

  // Calculate total
  const total = systemCost + glassCost + laborCost;

  return {
    systemCost,
    glassCost,
    laborCost,
    total,
    area
  };
};

// Generate a quote
router.post('/quotes/generate', async (req, res) => {
  try {
    const configuration = req.body;
    
    // Validate required fields
    if (!configuration.brand || !configuration.systemType || !configuration.systemModel || 
        !configuration.dimensions || !configuration.glassType) {
      return res.status(400).json({ error: 'Missing required configuration fields' });
    }

    // Calculate pricing
    const pricing = calculatePricing(configuration);

    // Generate quote number
    const quoteNumber = `Q${Date.now()}`;

    // Create quote object
    const quote = {
      quoteNumber,
      date: new Date(),
      configuration,
      pricing,
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