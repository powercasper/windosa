import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchMetadata = async () => {
  try {
    console.log('🌐 fetchMetadata: Starting API calls...');
    const [
      laborRatesRes, 
      unitCostsRes, 
      systemHierarchyRes, 
      finishOptionsRes,
      systemBrandsRes,
      systemArchitectureRes,
      windowOperablesRes,
      doorOperablesRes,
      doorModelCapabilitiesRes,
      unitCostsLinearInchRes
    ] = await Promise.all([
      axios.get(`${API_BASE_URL}/metadata/labor-rates`),
      axios.get(`${API_BASE_URL}/metadata/unit-costs`),
      axios.get(`${API_BASE_URL}/metadata/system-hierarchy`),
      axios.get(`${API_BASE_URL}/metadata/finish-options`),
      axios.get(`${API_BASE_URL}/metadata/system-brands`),
      axios.get(`${API_BASE_URL}/metadata/system-architecture`),
      axios.get(`${API_BASE_URL}/metadata/window-operables`),
      axios.get(`${API_BASE_URL}/metadata/door-operables`),
      axios.get(`${API_BASE_URL}/metadata/door-model-capabilities`),
      axios.get(`${API_BASE_URL}/metadata/unit-costs-linear-inch`)
    ]);

    console.log('📡 fetchMetadata: systemHierarchy response:', systemHierarchyRes.data);

    const result = {
      laborRates: laborRatesRes.data.laborRates,
      unitCostPerSqft: unitCostsRes.data.unitCostPerSqft,
      systemHierarchy: systemHierarchyRes.data.systemHierarchy,
      finishOptions: finishOptionsRes.data.finishOptions,
      systemBrands: systemBrandsRes.data.systemBrands,
      systemArchitecture: systemArchitectureRes.data.systemArchitecture,
      windowOperables: windowOperablesRes.data.windowOperables,
      doorOperables: doorOperablesRes.data.doorOperables,
      doorModelCapabilities: doorModelCapabilitiesRes.data.doorModelCapabilities,
      unitCostPerLinearInch: unitCostsLinearInchRes.data.unitCostPerLinearInch
    };
    
    console.log('🎯 fetchMetadata: Final result systemHierarchy:', result.systemHierarchy);
    console.log('🎯 fetchMetadata: Final result systemHierarchy keys:', Object.keys(result.systemHierarchy || {}));
    
    return result;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}; 