const express = require('express');
const router = express.Router();
const { 
  laborRates,
  systemHierarchy,
  systemArchitecture,
  finishOptions,
  windowOperables,
  doorOperables,
  doorModelCapabilities,
  unitCostPerSqft,
  systemBrands
} = require('../db/metaData');

// GET /api/metadata/labor-rates
router.get('/labor-rates', (req, res) => {
  res.json({ laborRates });
});

// GET /api/metadata/unit-costs
router.get('/unit-costs', (req, res) => {
  res.json({ unitCostPerSqft });
});

// GET /api/metadata/system-hierarchy
router.get('/system-hierarchy', (req, res) => {
  res.json({ systemHierarchy });
});

// GET /api/metadata/finish-options
router.get('/finish-options', (req, res) => {
  res.json({ finishOptions });
});

// GET /api/metadata/system-architecture
router.get('/system-architecture', (req, res) => {
  res.json({ systemArchitecture });
});

// GET /api/metadata/window-operables
router.get('/window-operables', (req, res) => {
  res.json({ windowOperables });
});

// GET /api/metadata/door-operables
router.get('/door-operables', (req, res) => {
  res.json({ doorOperables });
});

// GET /api/metadata/door-model-capabilities
router.get('/door-model-capabilities', (req, res) => {
  res.json({ doorModelCapabilities });
});

// GET /api/metadata/system-brands
router.get('/system-brands', (req, res) => {
  res.json({ systemBrands });
});

module.exports = router; 