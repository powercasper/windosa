import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchMetadata = async () => {
  try {
    const [
      laborRatesRes, 
      unitCostsRes, 
      systemHierarchyRes, 
      finishOptionsRes,
      systemBrandsRes,
      systemArchitectureRes,
      windowOperablesRes,
      doorOperablesRes,
      doorModelCapabilitiesRes
    ] = await Promise.all([
      axios.get(`${API_BASE_URL}/metadata/labor-rates`),
      axios.get(`${API_BASE_URL}/metadata/unit-costs`),
      axios.get(`${API_BASE_URL}/metadata/system-hierarchy`),
      axios.get(`${API_BASE_URL}/metadata/finish-options`),
      axios.get(`${API_BASE_URL}/metadata/system-brands`),
      axios.get(`${API_BASE_URL}/metadata/system-architecture`),
      axios.get(`${API_BASE_URL}/metadata/window-operables`),
      axios.get(`${API_BASE_URL}/metadata/door-operables`),
      axios.get(`${API_BASE_URL}/metadata/door-model-capabilities`)
    ]);

    return {
      laborRates: laborRatesRes.data.laborRates,
      unitCostPerSqft: unitCostsRes.data.unitCostPerSqft,
      systemHierarchy: systemHierarchyRes.data.systemHierarchy,
      finishOptions: finishOptionsRes.data.finishOptions,
      systemBrands: systemBrandsRes.data.systemBrands,
      systemArchitecture: systemArchitectureRes.data.systemArchitecture,
      windowOperables: windowOperablesRes.data.windowOperables,
      doorOperables: doorOperablesRes.data.doorOperables,
      doorModelCapabilities: doorModelCapabilitiesRes.data.doorModelCapabilities
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}; 