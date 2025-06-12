import React from 'react';
import { 
  Paper, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Stack
} from '@mui/material';

const SidelightConfiguration = ({ type, config, onChange }) => {
  const label = type === 'transom' ? 'Top Sidelight' : `${type === 'left' ? 'Left' : 'Right'} Sidelight`;
  const dimensionLabel = type === 'transom' ? 'Height' : 'Width';
  
  const handleChange = (field, value) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const handleGridChange = (field, value) => {
    const currentGrid = config?.grid || { enabled: false, horizontal: 2, vertical: 3 };
    handleChange('grid', {
      ...currentGrid,
      [field]: value
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
      <Stack spacing={2}>
        {/* Main sidelight configuration */}
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

        {/* Grid configuration for enabled sidelights */}
        {config?.enabled && (
          <>
            <Divider />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Grid Configuration (Optional)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={config?.grid?.enabled || false}
                      onChange={(e) => handleGridChange('enabled', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Enable Grid"
                />
                
                {config?.grid?.enabled && (
                  <>
                    <TextField
                      label="Horizontal"
                      type="number"
                      size="small"
                      value={config?.grid?.horizontal || 2}
                      onChange={(e) => handleGridChange('horizontal', parseInt(e.target.value) || 2)}
                      InputProps={{ 
                        inputProps: { min: 1, max: 10 }
                      }}
                      sx={{ width: 100 }}
                    />
                    <TextField
                      label="Vertical"
                      type="number"
                      size="small"
                      value={config?.grid?.vertical || 3}
                      onChange={(e) => handleGridChange('vertical', parseInt(e.target.value) || 3)}
                      InputProps={{ 
                        inputProps: { min: 1, max: 10 }
                      }}
                      sx={{ width: 100 }}
                    />
                  </>
                )}
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default SidelightConfiguration; 