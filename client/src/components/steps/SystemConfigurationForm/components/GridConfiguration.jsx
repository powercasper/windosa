import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox, Grid, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ConfigurationSection from './ConfigurationSection';

const GridConfiguration = ({ grid, onChange, testIds = {} }) => {
  const handleChange = (field) => (event) => {
    const value = field === 'enabled' ? event.target.checked : event.target.value;
    onChange({ ...grid, [field]: value });
  };

  return (
    <ConfigurationSection title="Grid Configuration" icon={ViewComfyIcon}>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={grid?.enabled || false}
              onChange={handleChange('enabled')}
              inputProps={{ 'data-testid': testIds.enableGrids }}
            />
          }
          label="Enable Grids"
        />
        
        {grid?.enabled && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Grid Pattern</InputLabel>
                <Select
                  value={grid.pattern || 'Colonial'}
                  onChange={handleChange('pattern')}
                  label="Grid Pattern"
                  inputProps={{ 'data-testid': testIds.gridPattern }}
                >
                  <MenuItem value="Colonial">Colonial</MenuItem>
                  <MenuItem value="Prairie">Prairie</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {grid.pattern === 'Custom' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Horizontal Lines"
                    type="number"
                    value={grid.horizontal || 2}
                    onChange={handleChange('horizontal')}
                    InputProps={{ 
                      inputProps: { min: 1, max: 10 },
                      'data-testid': testIds.horizontalCount
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Vertical Lines"
                    type="number"
                    value={grid.vertical || 3}
                    onChange={handleChange('vertical')}
                    InputProps={{ 
                      inputProps: { min: 1, max: 10 },
                      'data-testid': testIds.verticalCount
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        )}
      </Box>
    </ConfigurationSection>
  );
};

export default GridConfiguration; 