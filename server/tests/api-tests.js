// Comprehensive API Test Suite for Pricing System
// Run with: node server/tests/api-tests.js

const axios = require('axios');

const API_BASE = 'http://localhost:5001';
let testResults = [];

// Test configuration with known expected results
const TEST_SLIDING_DOOR = {
  brand: "Alumil",
  systemModel: "SUPREME S650",
  systemType: "Sliding Doors", 
  operationType: "OXXX",
  dimensions: { width: 216, height: 108 },
  glassType: "XTREME 70/33 Maximum Light"
};

const EXPECTED_SLIDING_DOOR = {
  systemCost: 6724.62,
  glassCost: 1944,
  laborCost: 1409.4,
  total: 10078.02,
  area: 162
};

const TEST_ADDITIONAL_COSTS = {
  tariff: 200,
  shipping: 150,
  delivery: 100,
  margin: 30
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const icons = { info: 'ℹ️', pass: '✅', fail: '❌', warn: '⚠️' };
  console.log(`${icons[type]} [${timestamp}] ${message}`);
}

function assertEqual(actual, expected, tolerance = 0.01, description = '') {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    log(`${description}: ${actual} ≈ ${expected} ✓`, 'pass');
    return true;
  } else {
    log(`${description}: ${actual} ≠ ${expected} (diff: ${diff})`, 'fail');
    return false;
  }
}

async function runTest(testName, testFunction) {
  log(`Running test: ${testName}`, 'info');
  try {
    const startTime = Date.now();
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    testResults.push({
      name: testName,
      success: true,
      duration,
      result
    });
    
    log(`${testName}: PASSED (${duration}ms)`, 'pass');
    return result;
  } catch (error) {
    testResults.push({
      name: testName,
      success: false,
      error: error.message
    });
    
    log(`${testName}: FAILED - ${error.message}`, 'fail');
    throw error;
  }
}

// Test 1: Basic server connectivity
async function testServerConnectivity() {
  const response = await axios.get(`${API_BASE}/api/health/simple`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.status) {
    throw new Error('Health check response missing status');
  }
  
  return { status: response.data.status, connected: true };
}

// Test 2: Single item calculation
async function testCalculateItem() {
  const response = await axios.post(`${API_BASE}/api/quotes/calculate-item`, {
    item: TEST_SLIDING_DOOR
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const { pricing } = response.data;
  
  // Verify all expected fields exist
  const requiredFields = ['systemCost', 'glassCost', 'laborCost', 'total', 'area'];
  for (const field of requiredFields) {
    if (pricing[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Verify calculations match expected values
  const checks = [
    assertEqual(pricing.systemCost, EXPECTED_SLIDING_DOOR.systemCost, 0.01, 'System Cost'),
    assertEqual(pricing.glassCost, EXPECTED_SLIDING_DOOR.glassCost, 0.01, 'Glass Cost'),
    assertEqual(pricing.laborCost, EXPECTED_SLIDING_DOOR.laborCost, 0.01, 'Labor Cost'),
    assertEqual(pricing.total, EXPECTED_SLIDING_DOOR.total, 0.01, 'Total Cost'),
    assertEqual(pricing.area, EXPECTED_SLIDING_DOOR.area, 0.01, 'Area')
  ];
  
  const passedChecks = checks.filter(Boolean).length;
  if (passedChecks !== checks.length) {
    throw new Error(`${passedChecks}/${checks.length} calculations match expected values`);
  }
  
  return { pricing, checksPasssed: passedChecks };
}

// Test 3: Quote totals calculation
async function testCalculateQuoteTotals() {
  const items = [TEST_SLIDING_DOOR, TEST_SLIDING_DOOR]; // Two identical items
  
  const response = await axios.post(`${API_BASE}/api/quotes/calculate-quote-totals`, {
    items,
    additionalCosts: TEST_ADDITIONAL_COSTS
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const { totals, items: itemsWithPricing } = response.data;
  
  // Verify structure
  if (!totals || !itemsWithPricing) {
    throw new Error('Response missing totals or items');
  }
  
  if (itemsWithPricing.length !== 2) {
    throw new Error(`Expected 2 items, got ${itemsWithPricing.length}`);
  }
  
  // Basic sanity checks
  const expectedBaseTotal = EXPECTED_SLIDING_DOOR.total * 2; // Two items
  const actualBaseTotal = totals.baseTotal;
  
  if (!assertEqual(actualBaseTotal, expectedBaseTotal, 0.01, 'Base Total')) {
    throw new Error('Base total calculation incorrect');
  }
  
  // Verify grand total includes additional costs and margin
  if (totals.grandTotal <= actualBaseTotal) {
    throw new Error('Grand total should be greater than base total when additional costs applied');
  }
  
  return { 
    itemCount: itemsWithPricing.length, 
    baseTotal: actualBaseTotal, 
    grandTotal: totals.grandTotal,
    additionalCostsApplied: true 
  };
}

// Test 4: Type metrics calculation
async function testCalculateTypeMetrics() {
  const items = [TEST_SLIDING_DOOR];
  
  const response = await axios.post(`${API_BASE}/api/quotes/calculate-type-metrics`, {
    items,
    systemType: 'Sliding Doors',
    additionalCosts: TEST_ADDITIONAL_COSTS
  });
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  const metrics = response.data;
  
  // Verify required fields
  const requiredFields = ['totalArea', 'baseCost', 'totalCost', 'costPerSqFt'];
  for (const field of requiredFields) {
    if (metrics[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  // Verify area calculation
  if (!assertEqual(parseFloat(metrics.totalArea), EXPECTED_SLIDING_DOOR.area, 0.1, 'Total Area')) {
    throw new Error('Area calculation incorrect');
  }
  
  return { 
    systemType: 'Sliding Doors',
    totalArea: metrics.totalArea,
    totalCost: metrics.totalCost,
    costPerSqFt: metrics.costPerSqFt
  };
}

// Test 5: Glass database integrity
async function testGlassDatabase() {
  const testGlassTypes = [
    'XTREME 70/33 Maximum Light',
    'SKN 184 High Performance', 
    'SKN 154 Balanced Performance',
    'XTREME 50-22 Solar Control',
    'XTREME 61-29 Balanced'
  ];
  
  const results = [];
  
  for (const glassType of testGlassTypes) {
    const testItem = { ...TEST_SLIDING_DOOR, glassType };
    
    const response = await axios.post(`${API_BASE}/api/quotes/calculate-item`, {
      item: testItem
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to calculate pricing for ${glassType}`);
    }
    
    const { pricing } = response.data;
    
    // All premium glass should cost $12/sq ft  
    const expectedGlassCost = 12 * EXPECTED_SLIDING_DOOR.area;
    if (!assertEqual(pricing.glassCost, expectedGlassCost, 0.01, `${glassType} glass cost`)) {
      throw new Error(`${glassType} pricing incorrect`);
    }
    
    results.push({ glassType, glassCost: pricing.glassCost, verified: true });
  }
  
  return { testedGlassTypes: results.length, allVerified: true, results };
}

// Test 6: Performance check
async function testPerformance() {
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    await axios.post(`${API_BASE}/api/quotes/calculate-item`, {
      item: TEST_SLIDING_DOOR
    });
    
    times.push(Date.now() - startTime);
  }
  
  const avgTime = times.reduce((a, b) => a + b) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  
  // Performance thresholds
  if (avgTime > 500) {
    throw new Error(`Average response time too slow: ${avgTime}ms (threshold: 500ms)`);
  }
  
  if (maxTime > 1000) {
    throw new Error(`Maximum response time too slow: ${maxTime}ms (threshold: 1000ms)`);
  }
  
  return {
    iterations,
    avgTime: Math.round(avgTime),
    minTime,
    maxTime,
    performanceGood: true
  };
}

// Test 7: Error handling
async function testErrorHandling() {
  const errorTests = [
    {
      name: 'Missing item data',
      request: { invalidData: true },
      expectedStatus: 400
    },
    {
      name: 'Invalid system type',
      request: { item: { ...TEST_SLIDING_DOOR, systemType: 'Invalid Type' } },
      expectedStatus: 500 // Server should handle gracefully
    }
  ];
  
  const results = [];
  
  for (const test of errorTests) {
    try {
      const response = await axios.post(`${API_BASE}/api/quotes/calculate-item`, test.request);
      
      // If we get here, the request didn't fail as expected
      if (test.expectedStatus >= 400) {
        throw new Error(`Expected error status ${test.expectedStatus}, but got ${response.status}`);
      }
      
      results.push({ test: test.name, handled: true });
    } catch (error) {
      if (error.response && error.response.status === test.expectedStatus) {
        results.push({ test: test.name, handled: true });
      } else {
        throw new Error(`${test.name}: Unexpected error handling`);
      }
    }
  }
  
  return { errorTestsPassed: results.length, results };
}

// Main test runner
async function runAllTests() {
  console.log('\n🧪 Starting Comprehensive API Test Suite\n');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Server Connectivity', func: testServerConnectivity },
    { name: 'Calculate Item', func: testCalculateItem },
    { name: 'Calculate Quote Totals', func: testCalculateQuoteTotals },
    { name: 'Calculate Type Metrics', func: testCalculateTypeMetrics },
    { name: 'Glass Database Integrity', func: testGlassDatabase },
    { name: 'Performance Check', func: testPerformance },
    { name: 'Error Handling', func: testErrorHandling }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await runTest(test.name, test.func);
      passed++;
    } catch (error) {
      failed++;
    }
    console.log(''); // Empty line between tests
  }
  
  // Summary
  console.log('=' .repeat(60));
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Core functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  return { passed, failed, total: passed + failed, testResults };
}

// Export for programmatic use or run directly
if (require.main === module) {
  runAllTests().catch(error => {
    log('Test suite crashed: ' + error.message, 'fail');
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults }; 