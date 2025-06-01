import React from 'react';
import { Grid, TextField } from '@mui/material';

const DimensionsInput = ({ dimensions, onChange, disabled = false }) => {
  const handleChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    onChange({ ...dimensions, [field]: value });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Width (inches)"
          type="number"
          value={dimensions?.width || ''}
          onChange={handleChange('width')}
          disabled={disabled}
          InputProps={{ 
            inputProps: { min: 0, step: 0.1 },
            sx: { height: '56px' }
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Height (inches)"
          type="number"
          value={dimensions?.height || ''}
          onChange={handleChange('height')}
          disabled={disabled}
          InputProps={{ 
            inputProps: { min: 0, step: 0.1 },
            sx: { height: '56px' }
          }}
        />
      </Grid>
    </Grid>
  );
};

export default DimensionsInput; 