import React from 'react';
import { Grid, TextField } from '@mui/material';

const DimensionsInput = ({ dimensions, onChange, widthProps = {}, heightProps = {} }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Width (inches)"
          type="number"
          value={dimensions?.width || ''}
          onChange={(e) => onChange({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
          InputProps={{ 
            inputProps: { min: 0, step: 0.1 },
            ...widthProps
          }}
          error={!dimensions?.width}
          helperText={!dimensions?.width ? 'Width is required' : ''}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Height (inches)"
          type="number"
          value={dimensions?.height || ''}
          onChange={(e) => onChange({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
          InputProps={{ 
            inputProps: { min: 0, step: 0.1 },
            ...heightProps
          }}
          error={!dimensions?.height}
          helperText={!dimensions?.height ? 'Height is required' : ''}
        />
      </Grid>
    </Grid>
  );
};

export default DimensionsInput; 