import React from 'react';
import { Box, Typography, Stack, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import BuildIcon from '@mui/icons-material/Build';
import StraightIcon from '@mui/icons-material/Straight';
import { doorOperables } from '../../../../utils/metadata';
import DimensionsInput from '../components/DimensionsInput';
import GridConfiguration from '../components/GridConfiguration';
import SidelightConfiguration from '../components/SidelightConfiguration';

const EntranceDoorConfiguration = ({ configuration, onUpdate }) => {
  const handleDimensionsChange = (dimensions) => {
    onUpdate({ dimensions });
  };

  const handleChange = (field) => (event) => {
    onUpdate({ [field]: event.target.value });
  };

  const handleGridChange = (grid) => {
    onUpdate({ grid });
  };

  const handleSidelightChange = (type, config) => {
    onUpdate({ [type === 'left' ? 'leftSidelight' : type === 'right' ? 'rightSidelight' : 'transom']: config });
  };

  return (
    <Stack spacing={3}>
      {/* Door Dimensions Section */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StraightIcon fontSize="small" /> Door Dimensions
        </Typography>
        <DimensionsInput 
          dimensions={configuration.dimensions} 
          onChange={handleDimensionsChange}
        />
      </Paper>

      {/* Door Configuration */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ViewSidebarIcon fontSize="small" /> Door Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Door Type</InputLabel>
              <Select
                value={configuration.doorType || 'glass'}
                onChange={(e) => {
                  const doorType = e.target.value;
                  onUpdate({ 
                    doorType,
                    grid: doorType === 'glass' ? (configuration.grid || { enabled: false, horizontal: 2, vertical: 3 }) : undefined
                  });
                }}
                label="Door Type"
              >
                <MenuItem value="glass">Glass Door</MenuItem>
                <MenuItem value="panel">Panel Door</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Opening Type</InputLabel>
              <Select
                value={configuration.openingType || ''}
                onChange={handleChange('openingType')}
                label="Opening Type"
              >
                {doorOperables.openingTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Swing Direction</InputLabel>
              <Select
                value={configuration.swingDirection || ''}
                onChange={handleChange('swingDirection')}
                label="Swing Direction"
              >
                {configuration.openingType && doorOperables.swingDirections[configuration.openingType]?.map((direction) => (
                  <MenuItem key={direction} value={direction}>{direction}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Hardware Configuration */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildIcon fontSize="small" /> Hardware Configuration
        </Typography>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Handle Type</InputLabel>
                <Select
                  value={configuration.handleType || ''}
                  onChange={handleChange('handleType')}
                  label="Handle Type"
                >
                  {doorOperables.handleTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lock Type</InputLabel>
                <Select
                  value={configuration.lockType || ''}
                  onChange={handleChange('lockType')}
                  label="Lock Type"
                >
                  {doorOperables.lockTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Threshold Type</InputLabel>
                <Select
                  value={configuration.threshold || ''}
                  onChange={handleChange('threshold')}
                  label="Threshold Type"
                >
                  {doorOperables.thresholds.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Hinge Type</InputLabel>
                <Select
                  value={configuration.hingeType || ''}
                  onChange={handleChange('hingeType')}
                  label="Hinge Type"
                >
                  {doorOperables.hingeTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* Sidelights Configuration */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ViewSidebarIcon fontSize="small" /> Additional Components
        </Typography>
        <Stack spacing={2}>
          <SidelightConfiguration 
            type="left"
            config={configuration.leftSidelight}
            onChange={(config) => handleSidelightChange('left', config)}
          />
          <SidelightConfiguration 
            type="right"
            config={configuration.rightSidelight}
            onChange={(config) => handleSidelightChange('right', config)}
          />
          <SidelightConfiguration 
            type="transom"
            config={configuration.transom}
            onChange={(config) => handleSidelightChange('transom', config)}
          />
        </Stack>
      </Paper>

      {/* Grid Configuration */}
      {configuration.doorType === 'glass' && (
        <GridConfiguration 
          grid={configuration.grid} 
          onChange={handleGridChange}
        />
      )}
    </Stack>
  );
};

export default EntranceDoorConfiguration; 