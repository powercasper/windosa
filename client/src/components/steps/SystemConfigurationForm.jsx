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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import ColorLensIcon from '@mui/icons-material/ColorLens';

// Import the system architecture data
import { systemArchitecture, windowOperables, doorOperables, finishOptions } from '../../utils/metadata';

const SystemConfigurationForm = ({ configuration, onUpdate, onNext }) => {
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
      } else if (configuration.systemType === 'Sliding Doors') {
        // For sliding doors, we use typologies
        setAvailableOperables(['OX', 'XX', 'OXX', 'XXX', 'OXXO', 'OXXX', 'XXXX']);
      }
    }
  }, [configuration.systemType]);

  useEffect(() => {
    // Initialize panels array if it doesn't exist and we're configuring a window
    if (configuration.systemType === 'Windows' && !configuration.panels) {
      onUpdate({
        panels: [{
          width: configuration.dimensions?.width || 0,
          operationType: 'Fixed'
        }]
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

  const handlePanelChange = (index, field) => (event) => {
    const value = field === 'width' ? (parseFloat(event.target.value) || 0) : event.target.value;
    const newPanels = [...configuration.panels];
    newPanels[index] = {
      ...newPanels[index],
      [field]: value
    };
    onUpdate({ panels: newPanels });

    // Update total width in dimensions
    if (field === 'width') {
      const totalWidth = newPanels.reduce((sum, panel) => sum + panel.width, 0);
      onUpdate({
        panels: newPanels,
        dimensions: {
          ...configuration.dimensions,
          width: totalWidth
        }
      });
    }
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
                bgcolor: 'background.paper'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Width
                </Typography>
                <Typography variant="h6">
                  {configuration.dimensions.width || 0}" 
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
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Window Panes</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Height (inches)"
                  type="number"
                  value={configuration.dimensions.height || ''}
                  onChange={handleDimensionChange('height')}
                  size="small"
                  sx={{
                    width: '150px',
                    '& .MuiOutlinedInput-root': {
                      height: '40px'
                    }
                  }}
                  inputProps={{ 
                    min: 0,
                    step: 0.1,
                    style: { height: '40px', padding: '0 14px' }
                  }}
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={addPanel}
                  variant="outlined"
                  size="small"
                  sx={{ height: '40px' }}
                >
                  Add Pane
                </Button>
              </Stack>
            </Stack>
            <Grid container spacing={3}>
              {configuration.panels?.map((panel, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Stack 
                        direction="row" 
                        justifyContent="space-between" 
                        alignItems="center" 
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Pane {index + 1}
                        </Typography>
                        {configuration.panels.length > 1 && (
                          <IconButton 
                            onClick={() => removePanel(index)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Width (inches)"
                            type="number"
                            value={panel.width || ''}
                            onChange={handlePanelChange(index, 'width')}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '56px'
                              }
                            }}
                            inputProps={{ 
                              min: 0,
                              step: 0.1,
                              style: { height: '56px', padding: '0 14px' }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl 
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                height: '56px'
                              }
                            }}
                          >
                            <InputLabel>Operation Type</InputLabel>
                            <Select
                              value={panel.operationType || ''}
                              onChange={handlePanelChange(index, 'operationType')}
                              label="Operation Type"
                              sx={{
                                height: '56px'
                              }}
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
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : configuration.systemType === 'Sliding Doors' ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Configuration Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Panel Configuration Guide:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    O = Fixed Panel | X = Sliding Panel
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Configuration is viewed from outside, left to right
                  </Typography>
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Configuration Type</InputLabel>
                  <Select
                    value={configuration.operationType || ''}
                    onChange={handleChange('operationType')}
                    label="Configuration Type"
                  >
                    {availableOperables.map((typology) => (
                      <MenuItem key={typology} value={typology}>
                        <Box>
                          <Typography>{typology}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {typology.split('').map((type, index) => 
                              `${type === 'O' ? 'Fixed' : 'Sliding'} Panel${index < typology.length - 1 ? ' + ' : ''}`
                            ).join('')}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {configuration.operationType && (
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
                      Selected Configuration:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {configuration.operationType.split('').map((type, index) => (
                        <Paper
                          key={index}
                          sx={{
                            p: 1,
                            flex: 1,
                            bgcolor: type === 'O' ? 'grey.100' : 'primary.light',
                            color: type === 'O' ? 'text.primary' : 'primary.contrastText',
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: type === 'O' ? 'grey.300' : 'primary.main'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {type === 'O' ? 'Fixed' : 'Sliding'}
                          </Typography>
                          <Typography variant="caption">
                            Panel {index + 1}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}

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