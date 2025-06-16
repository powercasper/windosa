import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchMetadata } from '../api/metadata';

const MetadataContext = createContext();

export const useMetadata = () => {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }
  return context;
};

export const MetadataProvider = ({ children }) => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await fetchMetadata();
        setMetadata(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load metadata:', err);
        setError(err);
        setLoading(false);
      }
    };

    loadMetadata();
  }, []);

  const value = {
    metadata,
    loading,
    error
  };

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
}; 