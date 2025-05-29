import React, { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@mui/material';

// Import the system architecture data
import { systemArchitecture, windowOperables, doorOperables, finishOptions } from '../../utils/metadata';

const SystemConfigurationForm = ({ configuration, onUpdate }) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [availableOperables, setAvailableOperables] = useState([]);

  useEffect(() => {
    if (configuration.brand && configuration.systemType) {
      const models = systemArchitecture[configuration.brand][configuration.systemType] || [];
      setAvailableModels(models);
    }
  }, [configuration.brand, configuration.systemType]);

  useEffect(() => {
    if (configuration.systemType) {
      if (configuration.systemType === 'Windows') {
        setAvailableOperables(windowOperables);
      } else if (configuration.systemType === 'Entrance Doors') {
        setAvailableOperables(doorOperables);
      }
    }
  }, [configuration.systemType]);

  const handleChange = (field) => (event) => {
    onUpdate({ [field]: event.target.value });
  };

  const handleDimensionChange = (dimension) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    onUpdate({
      dimensions: {
        ...configuration.dimensions,
        [dimension]: value
      }
    });
  };

  const handleFinishChange = (finishField) => (event) => {
    onUpdate({
      finish: {
        ...configuration.finish,
        [finishField]: event.target.value
      }
    });
  };

  if (!configuration.brand || !configuration.systemType) {
    return (
      <Typography color="error">
        Please select a brand and system type first
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configure {configuration.systemType}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={configuration.systemModel || ''}
                onChange={handleChange('systemModel')}
                label="Model"
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {(configuration.systemType === 'Windows' || configuration.systemType === 'Entrance Doors') && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Operation Type</InputLabel>
                <Select
                  value={configuration.operationType || ''}
                  onChange={handleChange('operationType')}
                  label="Operation Type"
                >
                  {availableOperables.map((operable) => (
                    <MenuItem key={operable} value={operable}>
                      {operable}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Width (inches)"
              type="number"
              value={configuration.dimensions.width || ''}
              onChange={handleDimensionChange('width')}
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Height (inches)"
              type="number"
              value={configuration.dimensions.height || ''}
              onChange={handleDimensionChange('height')}
              InputProps={{ inputProps: { min: 0, step: 0.1 } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Finish Type</InputLabel>
              <Select
                value={configuration.finish.type || ''}
                onChange={handleFinishChange('type')}
                label="Finish Type"
              >
                {Object.keys(finishOptions).map((finish) => (
                  <MenuItem key={finish} value={finish}>
                    {finish}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Finish Style</InputLabel>
              <Select
                value={configuration.finish.color || ''}
                onChange={handleFinishChange('color')}
                label="Finish Style"
                disabled={!configuration.finish.type}
              >
                {configuration.finish.type && finishOptions[configuration.finish.type].map((style) => (
                  <MenuItem key={style} value={style}>
                    {style}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SystemConfigurationForm; 