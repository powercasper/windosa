import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Stack,
  Button,
  IconButton
} from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import BuildIcon from '@mui/icons-material/Build';
import StraightIcon from '@mui/icons-material/Straight';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMetadata } from '../../../../contexts/MetadataContext';

const WindowConfiguration = ({ configuration, onUpdate }) => {
  const { metadata } = useMetadata();
  const [availableOperables, setAvailableOperables] = useState([]);
  const [useEqualWidths, setUseEqualWidths] = useState(true);

  useEffect(() => {
    if (metadata?.windowOperables) {
      setAvailableOperables(metadata.windowOperables);
    }
  }, [metadata]);

  const handleDimensionChange = (dimension) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    onUpdate({
      dimensions: {
        ...configuration.dimensions,
        [dimension]: value
      }
    });
  };

  const handleTotalWidthChange = (event) => {
    const totalWidth = parseFloat(event.target.value) || 0;
    onUpdate({
      dimensions: {
        ...configuration.dimensions,
        width: totalWidth
      }
    });

    // Update panel widths if using equal distribution
    if (useEqualWidths && configuration.panels?.length > 0) {
      const equalWidth = totalWidth / configuration.panels.length;
      const newPanels = configuration.panels.map(panel => ({
        ...panel,
        width: equalWidth
      }));
      onUpdate({ panels: newPanels });
    }
  };

  const handlePanelChange = (index, field, value) => {
    const newPanels = [...(configuration.panels || [])];
    newPanels[index] = {
      ...newPanels[index],
      [field]: value
    };
    onUpdate({ panels: newPanels });
  };

  const addPanel = () => {
    const newPanels = [...(configuration.panels || []), {
      width: 36,
      operationType: 'Fixed',
      handleLocation: 'right'
    }];
    onUpdate({ panels: newPanels });
  };

  const removePanel = (index) => {
    const newPanels = configuration.panels.filter((_, i) => i !== index);
    onUpdate({ panels: newPanels });
  };

  const distributeWidth = (totalWidth, numberOfPanels) => {
    const equalWidth = totalWidth / numberOfPanels;
    return Array(numberOfPanels).fill(equalWidth);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WindowIcon /> Window Configuration
      </Typography>

      <Stack spacing={3}>
        {/* Window Dimensions Section */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StraightIcon fontSize="small" /> Window Dimensions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Width (inches)"
                type="number"
                value={configuration.dimensions?.width || ''}
                onChange={handleTotalWidthChange}
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
                value={configuration.dimensions?.height || ''}
                onChange={handleDimensionChange('height')}
                InputProps={{ 
                  inputProps: { min: 0, step: 0.1 },
                  sx: { height: '56px' }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Panel Configuration Section */}
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewSidebarIcon fontSize="small" /> Panel Configuration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Number of Panels</InputLabel>
                <Select
                  value={configuration.panels?.length || 1}
                  onChange={(e) => {
                    const count = parseInt(e.target.value);
                    let newPanels = [...(configuration.panels || [])];
                    
                    if (count > newPanels.length) {
                      while (newPanels.length < count) {
                        newPanels.push({ 
                          width: useEqualWidths ? (configuration.dimensions?.width || 0) / count : 0,
                          operationType: 'Fixed',
                          handleLocation: 'right'
                        });
                      }
                    } else {
                      newPanels = newPanels.slice(0, count);
                      if (useEqualWidths) {
                        const equalWidth = (configuration.dimensions?.width || 0) / count;
                        newPanels = newPanels.map(panel => ({
                          ...panel,
                          width: equalWidth
                        }));
                      }
                    }
                    onUpdate({ panels: newPanels });
                  }}
                  label="Number of Panels"
                >
                  {[1,2,3,4].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num} {num === 1 ? 'Panel' : 'Panels'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Width Distribution
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>Custom</Typography>
                  <Switch
                    checked={useEqualWidths}
                    onChange={(e) => {
                      setUseEqualWidths(e.target.checked);
                      if (e.target.checked && configuration.dimensions?.width) {
                        const equalWidths = distributeWidth(
                          configuration.dimensions.width,
                          configuration.panels?.length || 1
                        );
                        const newPanels = configuration.panels?.map((panel, index) => ({
                          ...panel,
                          width: equalWidths[index]
                        })) || [];
                        onUpdate({ panels: newPanels });
                      }
                    }}
                  />
                  <Typography>Equal</Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Panel Details Section */}
        {configuration.panels?.length > 0 && (
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BuildIcon fontSize="small" /> Panel Details
            </Typography>
            <Stack spacing={2}>
              {configuration.panels.map((panel, index) => (
                <Paper variant="outlined" key={index} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Panel {index + 1}
                    </Typography>
                    {configuration.panels.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removePanel(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Width (inches)"
                        type="number"
                        value={panel.width || ''}
                        onChange={(e) => handlePanelChange(index, 'width', parseFloat(e.target.value) || 0)}
                        disabled={useEqualWidths}
                        InputProps={{ 
                          inputProps: { min: 0, step: 0.1 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Operation Type</InputLabel>
                        <Select
                          value={panel.operationType || 'Fixed'}
                          onChange={(e) => handlePanelChange(index, 'operationType', e.target.value)}
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
                    {(panel.operationType === 'Tilt & Turn' || panel.operationType === 'Casement') && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Handle Location</InputLabel>
                          <Select
                            value={panel.handleLocation || 'right'}
                            onChange={(e) => handlePanelChange(index, 'handleLocation', e.target.value)}
                            label="Handle Location"
                          >
                            <MenuItem value="left">Left Side</MenuItem>
                            <MenuItem value="right">Right Side</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    {panel.operationType !== 'Fixed' && (
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="subtitle2">Mosquito Net</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Add standard mosquito net (+$100)
                              </Typography>
                            </Box>
                            <Switch
                              checked={panel.hasMosquitoNet || false}
                              onChange={(e) => handlePanelChange(index, 'hasMosquitoNet', e.target.checked)}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              ))}
              
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addPanel}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Panel
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default WindowConfiguration; 