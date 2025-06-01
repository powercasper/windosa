import React from 'react';
import { Paper, Typography, Stack, FormControlLabel, Switch, Grid, TextField } from '@mui/material';
import GridOnIcon from '@mui/icons-material/GridOn';

const GridConfiguration = ({ grid, onChange }) => {
  const handleGridChange = (field, value) => {
    onChange({
      ...grid,
      [field]: value
    });
  };

  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GridOnIcon fontSize="small" /> Grid Configuration
      </Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={grid?.enabled || false}
              onChange={(e) => {
                handleGridChange('enabled', e.target.checked);
                if (e.target.checked && !grid) {
                  handleGridChange('horizontal', 2);
                  handleGridChange('vertical', 3);
                }
              }}
            />
          }
          label="Add Divided Lights"
        />
        
        {grid?.enabled && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Horizontal Divisions"
                type="number"
                value={grid?.horizontal || 2}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleGridChange('horizontal', Math.max(1, value));
                }}
                InputProps={{ 
                  inputProps: { min: 1, step: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vertical Divisions"
                type="number"
                value={grid?.vertical || 3}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleGridChange('vertical', Math.max(1, value));
                }}
                InputProps={{ 
                  inputProps: { min: 1, step: 1 }
                }}
              />
            </Grid>
          </Grid>
        )}
      </Stack>
    </Paper>
  );
};

export default GridConfiguration; 