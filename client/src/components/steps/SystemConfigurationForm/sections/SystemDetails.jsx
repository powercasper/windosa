import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';
import { systemArchitecture } from '../../../../utils/metadata';

const SystemDetails = ({ configuration, onUpdate }) => {
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    if (configuration.brand && configuration.systemType) {
      const models = systemArchitecture[configuration.brand][configuration.systemType] || [];
      setAvailableModels(models);
    }
  }, [configuration.brand, configuration.systemType]);

  const handleChange = (field) => (event) => {
    onUpdate({ [field]: event.target.value });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WindowIcon /> System Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl 
            fullWidth 
            sx={{ 
              '& .MuiSelect-select': { 
                minWidth: '300px',
                padding: '13px 15px',
                fontSize: '1rem'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)'
                }
              }
            }}
          >
            <InputLabel>Model</InputLabel>
            <Select
              value={configuration.systemModel || ''}
              onChange={handleChange('systemModel')}
              label="Model"
              MenuProps={{
                PaperProps: {
                  sx: {
                    '& .MuiMenuItem-root': {
                      minWidth: '300px',
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
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemDetails; 