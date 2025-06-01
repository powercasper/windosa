import React from 'react';
import { Paper, Box, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment } from '@mui/material';

const SidelightConfiguration = ({ type, config, onChange }) => {
  const label = type === 'transom' ? 'Top Sidelight' : `${type === 'left' ? 'Left' : 'Right'} Sidelight`;
  const dimensionLabel = type === 'transom' ? 'Height' : 'Width';
  
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 120, flex: 1 }}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={config?.enabled || false}
            onChange={(e) => {
              handleChange('enabled', e.target.value);
              if (e.target.value) {
                handleChange(type === 'transom' ? 'height' : 'width', config?.[type === 'transom' ? 'height' : 'width'] || 12);
              }
            }}
            label={label}
          >
            <MenuItem value={false}>None</MenuItem>
            <MenuItem value={true}>Enabled</MenuItem>
          </Select>
        </FormControl>
        {config?.enabled && (
          <TextField
            label={dimensionLabel}
            type="number"
            value={config?.[type === 'transom' ? 'height' : 'width'] || 12}
            onChange={(e) => handleChange(type === 'transom' ? 'height' : 'width', parseFloat(e.target.value) || 0)}
            InputProps={{ 
              endAdornment: <InputAdornment position="end">in</InputAdornment>,
              inputProps: { min: 0, step: 0.1 }
            }}
            sx={{ width: 120 }}
          />
        )}
      </Box>
    </Paper>
  );
};

export default SidelightConfiguration; 