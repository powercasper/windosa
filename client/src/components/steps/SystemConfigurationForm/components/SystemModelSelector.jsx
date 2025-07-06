import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

const SystemModelSelector = ({ brand, systemType, systemModel, onChange, metadata, label = 'Model', fullWidth = true }) => {
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    if (brand && systemType && metadata?.systemArchitecture) {
      const models = metadata.systemArchitecture[brand]?.[systemType] || [];
      setAvailableModels(models);
    } else {
      setAvailableModels([]);
    }
  }, [brand, systemType, metadata]);

  return (
    <FormControl fullWidth={fullWidth} sx={{ mt: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={systemModel || ''}
        onChange={e => onChange(e.target.value)}
        label={label}
        disabled={availableModels.length === 0}
        MenuProps={{
          PaperProps: {
            sx: {
              '& .MuiMenuItem-root': {
                minWidth: '200px',
                padding: '12px 15px',
                whiteSpace: 'normal',
                wordBreak: 'break-word'
              }
            }
          }
        }}
      >
        {availableModels.map((model) => (
          <MenuItem key={model} value={model}>
            {model}
          </MenuItem>
        ))}
      </Select>
      {availableModels.length === 0 && (
        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
          No models available for the selected brand and system type
        </Typography>
      )}
    </FormControl>
  );
};

export default SystemModelSelector; 