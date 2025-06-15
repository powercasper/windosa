#!/usr/bin/env node

// Quick API Test Runner
// Usage: node test-api.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Quick API Test Runner');
console.log('========================\n');

// Check if server is likely running
const axios = require('axios');

async function checkServer() {
  try {
    await axios.get('http://localhost:5001/api/health/simple', { timeout: 3000 });
    console.log('✅ Server is running on port 5001');
    return true;
  } catch (error) {
    console.log('❌ Server not detected on port 5001');
    console.log('💡 Make sure to run: npm run dev');
    return false;
  }
}

async function runTests() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n🛑 Cannot run tests without server. Please start the server first.');
    process.exit(1);
  }

  console.log('\n🚀 Running comprehensive API tests...\n');

  const testPath = path.join(__dirname, 'server', 'tests', 'api-tests.js');
  
  const testProcess = spawn('node', [testPath], {
    stdio: 'inherit',
    cwd: __dirname
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Test suite completed successfully!');
    } else {
      console.log('\n❌ Test suite completed with errors.');
      process.exit(code);
    }
  });

  testProcess.on('error', (error) => {
    console.error('❌ Failed to run test suite:', error.message);
    process.exit(1);
  });
}

runTests(); 