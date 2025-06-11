import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// API endpoints
export const endpoints = {
  metadata: '/metadata',
  generateQuote: '/quotes/generate',
};

// API functions
export const getMetadata = async () => {
  try {
    const response = await api.get(endpoints.metadata);
    return response.data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
};

export const generateQuote = async (data) => {
  try {
    const response = await api.post(endpoints.generateQuote, data);
    return response.data;
  } catch (error) {
    console.error('Error generating quote:', error);
    throw error;
  }
};

// Add interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
);

export default api; 