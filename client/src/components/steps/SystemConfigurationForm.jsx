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
  Button,
  IconButton,
  Stack,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import ColorLensIcon from '@mui/icons-material/ColorLens';

// Import the system architecture data
import { 
  systemArchitecture, 
  windowOperables, 
  doorOperables, 
  finishOptions,
  unitCostPerSqft 
} from '../../utils/metadata';

const SystemConfigurationForm = ({ configuration, onUpdate, onNext }) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [availableOperables, setAvailableOperables] = useState([]);
  const [maxPanels, setMaxPanels] = useState(4);
  const [panelConfigs, setPanelConfigs] = useState([]);
  const [useEqualWidths, setUseEqualWidths] = useState(true);

  useEffect(() => {
    if (configuration.brand && configuration.systemType) {
      const models = systemArchitecture[configuration.brand][configuration.systemType] || [];
      setAvailableModels(models);

      // Reset panel configurations when model changes
      if (configuration.systemType === 'Sliding Doors') {
        const modelConfigs = unitCostPerSqft[configuration.brand]?.[configuration.systemModel] || {};
        const maxPanelCount = Math.max(...Object.keys(modelConfigs).map(key => key.length));
        setMaxPanels(maxPanelCount || 4);
        
        // Initialize default panel configuration if none exists
        if (!configuration.panels || configuration.panels.length === 0) {
          onUpdate({
            panels: [
              { type: 'Fixed', direction: null },
              { type: 'Sliding', direction: 'right' }
            ],
            operationType: 'OX'  // Set default operationType
          });
        }
      }
    }
  }, [configuration.brand, configuration.systemType, configuration.systemModel]);

  useEffect(() => {
    if (configuration.systemType) {
      if (configuration.systemType === 'Windows') {
        setAvailableOperables(windowOperables);
      } else if (configuration.systemType === 'Entrance Doors') {
        setAvailableOperables(doorOperables);
      } else if (configuration.systemType === 'Sliding Doors') {
        // For sliding doors, we use typologies
        setAvailableOperables(['OX', 'XX', 'OXX', 'XXX', 'OXXO', 'OXXX', 'XXXX']);
      }
    }
  }, [configuration.systemType]);

  useEffect(() => {
    // Initialize panels array if it doesn't exist and we're configuring a window
    if (configuration.systemType === 'Windows' && (!configuration.panels || configuration.panels.length === 0)) {
      onUpdate({
        panels: [{
          width: configuration.dimensions?.width || 0,
          operationType: 'Fixed'
        }],
        dimensions: {
          ...configuration.dimensions,
          width: configuration.dimensions?.width || 0,
          height: configuration.dimensions?.height || 0
        }
      });
    }

    // Apply default finish options if they exist and no finish is set
    if (!configuration.finish?.type) {
      const savedFinish = localStorage.getItem('defaultFinishOptions');
      if (savedFinish) {
        const defaultFinish = JSON.parse(savedFinish);
        onUpdate({
          finish: defaultFinish
        });
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

  // Add RAL color change handler
  const handleRalColorChange = (event) => {
    const value = event.target.value;
    // Only allow numbers and limit to 4 digits
    if (value === '' || (/^\d{0,4}$/.test(value))) {
      onUpdate({
        finish: {
          ...configuration.finish,
          ralColor: value
        }
      });
    }
  };

  const distributeWidth = (totalWidth, numberOfPanels) => {
    const equalWidth = parseFloat((totalWidth / numberOfPanels).toFixed(1));
    return Array(numberOfPanels).fill(equalWidth);
  };

  const handleTotalWidthChange = (event) => {
    const totalWidth = parseFloat(event.target.value) || 0;
    if (useEqualWidths && configuration.panels) {
      const equalWidths = distributeWidth(totalWidth, configuration.panels.length);
      const newPanels = configuration.panels.map((panel, index) => ({
        ...panel,
        width: equalWidths[index]
      }));
      onUpdate({
        panels: newPanels,
        dimensions: {
          ...configuration.dimensions,
          width: totalWidth
        }
      });
    } else {
      onUpdate({
        dimensions: {
          ...configuration.dimensions,
          width: totalWidth
        }
      });
    }
  };

  const handlePanelChange = (index, field, value) => {
    const newPanels = [...(configuration.panels || [])];
    newPanels[index] = {
      ...newPanels[index],
      [field]: value
    };
    
    // Calculate total width when panel widths change
    if (field === 'width' && !useEqualWidths) {
      const totalWidth = newPanels.reduce((sum, panel) => sum + (panel.width || 0), 0);
      onUpdate({ 
        panels: newPanels,
        dimensions: {
          ...configuration.dimensions,
          width: totalWidth
        }
      });
    } else {
      // Generate operationType string (e.g., "OX", "OXXO")
      const operationType = newPanels.map(panel => 
        panel.type === 'Fixed' ? 'O' : 'X'
      ).join('');
      
      onUpdate({ 
        panels: newPanels,
        operationType // Update operationType whenever panel types change
      });
    }
  };

  const handlePanelCountChange = (event) => {
    const count = parseInt(event.target.value);
    let newPanels = [...(configuration.panels || [])];
    
    if (count > newPanels.length) {
      // Add new panels
      while (newPanels.length < count) {
        newPanels.push({ type: 'Sliding', direction: 'right' });
      }
    } else {
      // Remove panels from the end
      newPanels = newPanels.slice(0, count);
    }
    
    onUpdate({ panels: newPanels });
  };

  const addPanel = () => {
    const newPanels = [...(configuration.panels || []), {
      width: 0,
      operationType: 'Fixed'
    }];
    onUpdate({ panels: newPanels });
  };

  const removePanel = (index) => {
    const newPanels = configuration.panels.filter((_, i) => i !== index);
    const totalWidth = newPanels.reduce((sum, panel) => sum + panel.width, 0);
    onUpdate({
      panels: newPanels,
      dimensions: {
        ...configuration.dimensions,
        width: totalWidth
      }
    });
  };

  const isFormValid = () => {
    const hasValidDimensions = configuration.dimensions.height > 0;
    const hasValidFinish = configuration.finish.type && 
                          configuration.finish.color && 
                          configuration.finish.ralColor && 
                          configuration.finish.ralColor.length === 4;
    const hasValidModel = !!configuration.systemModel;

    if (configuration.systemType === 'Windows') {
      const hasValidPanels = configuration.panels?.length > 0 && 
        configuration.panels.every(panel => 
          panel.width > 0 && panel.operationType
        );
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidPanels;
    } else {
      const hasValidOperationType = !!configuration.operationType;
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidOperationType &&
        configuration.dimensions.width > 0;
    }
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
        {/* System Model Selection Section */}
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
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                border: '1px dashed rgba(0, 0, 0, 0.12)', 
                borderRadius: 1,
                bgcolor: 'background.paper',
                mb: 2
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Width
                </Typography>
                <Typography variant="h6">
                  {configuration.dimensions?.width || 0}" 
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (sum of all panes)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                border: '1px dashed rgba(0, 0, 0, 0.12)', 
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Height
                </Typography>
                <Typography variant="h6">
                  {configuration.dimensions.height || 0}" 
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                p: 2, 
                border: '1px dashed rgba(0, 0, 0, 0.12)', 
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Square Footage
                </Typography>
                <Typography variant="h6">
                  {((configuration.dimensions.width * configuration.dimensions.height) / 144).toFixed(2)} sq ft
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (width × height ÷ 144)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Window Panes Section */}
        {configuration.systemType === 'Windows' ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Configuration Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Number of Panes</InputLabel>
                  <Select
                    value={configuration.panels?.length || 1}
                    onChange={(e) => {
                      const count = parseInt(e.target.value);
                      let newPanels = [...(configuration.panels || [])];
                      
                      if (count > newPanels.length) {
                        // Add new panels
                        while (newPanels.length < count) {
                          newPanels.push({ 
                            width: useEqualWidths ? (configuration.dimensions?.width || 0) / count : 0,
                            operationType: 'Fixed'  // Default to Fixed operation type
                          });
                        }
                      } else {
                        // Remove panels from the end
                        newPanels = newPanels.slice(0, count);
                        if (useEqualWidths) {
                          const equalWidth = (configuration.dimensions?.width || 0) / count;
                          newPanels = newPanels.map(panel => ({
                            ...panel,
                            width: equalWidth,
                            operationType: panel.operationType || 'Fixed'  // Ensure operationType exists
                          }));
                        }
                      }
                      
                      onUpdate({ 
                        panels: newPanels,
                        dimensions: {
                          ...configuration.dimensions,
                          width: configuration.dimensions?.width || 0
                        }
                      });
                    }}
                    label="Number of Panes"
                  >
                    {[1,2,3,4].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num} {num === 1 ? 'Pane' : 'Panes'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="System Height (inches)"
                  type="number"
                  value={configuration.dimensions.height || ''}
                  onChange={handleDimensionChange('height')}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.1 },
                    sx: { height: '56px' }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  border: '1px solid rgba(0, 0, 0, 0.12)', 
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}>
                  <Stack spacing={2}>
                    <FormControl>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="subtitle2" color="text.secondary">
                          Width Distribution
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>Custom</Typography>
                          <Switch
                            checked={useEqualWidths}
                            onChange={(e) => {
                              setUseEqualWidths(e.target.checked);
                              if (e.target.checked && configuration.dimensions.width) {
                                // Distribute total width equally
                                const equalWidths = distributeWidth(
                                  configuration.dimensions.width,
                                  configuration.panels.length
                                );
                                const newPanels = configuration.panels.map((panel, index) => ({
                                  ...panel,
                                  width: equalWidths[index]
                                }));
                                onUpdate({ panels: newPanels });
                              }
                            }}
                          />
                          <Typography>Equal</Typography>
                        </Stack>
                      </Stack>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Total System Width (inches)"
                      type="number"
                      value={configuration.dimensions.width || ''}
                      onChange={handleTotalWidthChange}
                      InputProps={{ 
                        inputProps: { min: 0, step: 0.1 },
                        sx: { height: '56px' }
                      }}
                    />
                  </Stack>
                </Box>
              </Grid>

              {configuration.panels?.map((panel, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Pane {index + 1}
                      </Typography>
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
                              inputProps: { min: 0, step: 0.1 },
                              sx: { height: '56px' }
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
                              sx={{ height: '56px' }}
                            >
                              {availableOperables.map((operable) => (
                                <MenuItem key={operable} value={operable}>
                                  {operable}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Paper>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Configuration:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {configuration.panels?.map((panel, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 1,
                          flex: 1,
                          bgcolor: panel.operationType === 'Fixed' ? 'grey.100' : 'primary.light',
                          color: panel.operationType === 'Fixed' ? 'text.primary' : 'primary.contrastText',
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: panel.operationType === 'Fixed' ? 'grey.300' : 'primary.main'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {panel.operationType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {panel.width}" wide
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : configuration.systemType === 'Sliding Doors' ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Configuration Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Number of Panels</InputLabel>
                  <Select
                    value={configuration.panels?.length || 2}
                    onChange={handlePanelCountChange}
                    label="Number of Panels"
                  >
                    {[2,3,4,6].map((num) => (
                      <MenuItem 
                        key={num} 
                        value={num}
                        disabled={num > maxPanels}
                      >
                        {num} Panels
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {configuration.panels?.map((panel, index) => (
                <Grid item xs={12} key={index}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      bgcolor: 'background.default'
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Panel {index + 1}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Panel Type</InputLabel>
                            <Select
                              value={panel.type || 'Sliding'}
                              onChange={(e) => handlePanelChange(index, 'type', e.target.value)}
                              label="Panel Type"
                            >
                              <MenuItem value="Fixed">Fixed Panel</MenuItem>
                              <MenuItem value="Sliding">Sliding Panel</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        {panel.type === 'Sliding' && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Slide Direction</InputLabel>
                              <Select
                                value={panel.direction || 'right'}
                                onChange={(e) => handlePanelChange(index, 'direction', e.target.value)}
                                label="Slide Direction"
                              >
                                <MenuItem value="left">← Slide Left</MenuItem>
                                <MenuItem value="right">Slide Right →</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                      </Grid>
                    </Stack>
                  </Paper>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Current Configuration:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {configuration.panels?.map((panel, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 1,
                          flex: 1,
                          bgcolor: panel.type === 'Fixed' ? 'grey.100' : 'primary.light',
                          color: panel.type === 'Fixed' ? 'text.primary' : 'primary.contrastText',
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: panel.type === 'Fixed' ? 'grey.300' : 'primary.main'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {panel.type}
                          {panel.type === 'Sliding' && (
                            <Typography component="span" variant="caption" sx={{ display: 'block' }}>
                              {panel.direction === 'left' ? '←' : '→'}
                            </Typography>
                          )}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Width (inches)"
                  type="number"
                  value={configuration.dimensions.width || ''}
                  onChange={handleDimensionChange('width')}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.1 },
                    sx: { height: '56px' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Height (inches)"
                  type="number"
                  value={configuration.dimensions.height || ''}
                  onChange={handleDimensionChange('height')}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.1 },
                    sx: { height: '56px' }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <>
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
          </>
        )}

        <Divider sx={{ my: 4 }} />

        {/* Finish Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ColorLensIcon /> Finish Options
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                sx={{ 
                  '& .MuiSelect-select': { 
                    minWidth: '200px',
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
                <InputLabel>Finish Type</InputLabel>
                <Select
                  value={configuration.finish.type || ''}
                  onChange={handleFinishChange('type')}
                  label="Finish Type"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          minWidth: '200px',
                          padding: '12px 15px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word'
                        }
                      }
                    }
                  }}
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
              <FormControl 
                fullWidth
                sx={{ 
                  '& .MuiSelect-select': { 
                    minWidth: '200px',
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
                <InputLabel>Finish Style</InputLabel>
                <Select
                  value={configuration.finish.color || ''}
                  onChange={handleFinishChange('color')}
                  label="Finish Style"
                  disabled={!configuration.finish.type}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          minWidth: '200px',
                          padding: '12px 15px',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word'
                        }
                      }
                    }
                  }}
                >
                  {configuration.finish.type && finishOptions[configuration.finish.type].map((style) => (
                    <MenuItem key={style} value={style}>
                      {style}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RAL Color"
                value={configuration.finish.ralColor || ''}
                onChange={handleRalColorChange}
                error={configuration.finish.ralColor && configuration.finish.ralColor.length !== 4}
                helperText={configuration.finish.ralColor && configuration.finish.ralColor.length !== 4 ? 
                  "RAL color must be exactly 4 digits" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      RAL
                    </InputAdornment>
                  ),
                  inputProps: {
                    maxLength: 4,
                    pattern: '[0-9]*'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onNext}
            disabled={!isFormValid()}
            size="large"
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SystemConfigurationForm; 