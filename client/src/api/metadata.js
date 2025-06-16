import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fetchMetadata = async () => {
  try {
    const [laborRatesRes, unitCostsRes, systemHierarchyRes, finishOptionsRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/metadata/labor-rates`),
      axios.get(`${API_BASE_URL}/metadata/unit-costs`),
      axios.get(`${API_BASE_URL}/metadata/system-hierarchy`),
      axios.get(`${API_BASE_URL}/metadata/finish-options`)
    ]);

    return {
      laborRates: laborRatesRes.data.laborRates,
      unitCostPerSqft: unitCostsRes.data.unitCostPerSqft,
      systemHierarchy: systemHierarchyRes.data.systemHierarchy,
      finishOptions: finishOptionsRes.data.finishOptions
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}; 