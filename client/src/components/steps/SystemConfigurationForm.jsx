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
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CommentIcon from '@mui/icons-material/Comment';
import StraightIcon from '@mui/icons-material/Straight';
import BuildIcon from '@mui/icons-material/Build';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import PreviewIcon from '@mui/icons-material/Preview';
import GridOnIcon from '@mui/icons-material/GridOn';
import ConfigurationPreviewUI from '../ConfigurationPreviewUI';

// Import the system architecture data
import { 
  systemArchitecture, 
  windowOperables, 
  doorOperables,
  doorModelCapabilities,
  finishOptions,
  unitCostPerSqft 
} from '../../utils/metadata';

const SystemConfigurationForm = ({ configuration, onUpdate, onNext }) => {
  const [availableModels, setAvailableModels] = useState([]);
  const [availableOperables, setAvailableOperables] = useState([]);
  const [maxPanels, setMaxPanels] = useState(6);
  const [panelConfigs, setPanelConfigs] = useState([]);
  const [useEqualWidths, setUseEqualWidths] = useState(true);
  const [showGridConfig, setShowGridConfig] = useState(false);

  useEffect(() => {
    if (configuration.brand && configuration.systemType) {
      const models = systemArchitecture[configuration.brand][configuration.systemType] || [];
      setAvailableModels(models);

      // Only set default configurations if there isn't an existing configuration
      if (configuration.systemType === 'Entrance Doors' && !configuration.openingType) {
        const defaultOpeningType = configuration.systemModel === 'SD115' ? 'Pivot Door' :
                                 doorModelCapabilities[configuration.systemModel]?.[0] || 'Single Door';
        
        const defaultSwingDirection = defaultOpeningType === 'Pivot Door' ? 'Center Pivot' :
                                    defaultOpeningType === 'Single Door' ? 'Left Hand In' :
                                    'Active Left';

        onUpdate({
          openingType: defaultOpeningType,
          swingDirection: defaultSwingDirection,
          handleType: configuration.systemModel === 'SD115' ? 'Pull Handle' : 'Lever Handle',
          lockType: 'Multi-Point Lock',
          threshold: 'Standard',
          hingeType: configuration.systemModel === 'SD115' ? 'Pivot' : 'Standard',
          dimensions: configuration.dimensions || { width: '', height: '' },
          hasSidelights: configuration.hasSidelights || false,
          leftSidelight: configuration.leftSidelight || { enabled: false, width: 12 },
          rightSidelight: configuration.rightSidelight || { enabled: false, width: 12 },
          transom: configuration.transom || { enabled: false, height: 12 },
          doorType: 'glass',
          grid: { enabled: false, horizontal: 2, vertical: 3 }
        });
      } else if (configuration.systemType === 'Windows' && (!configuration.panels || configuration.panels.length === 0)) {
        onUpdate({
          panels: [{
            width: 0,
            operationType: 'Fixed',
            handleLocation: 'right'
          }],
          dimensions: configuration.dimensions || { width: '', height: '' },
          grid: {
            enabled: false,
            horizontal: 2,
            vertical: 3
          }
        });
      } else if (configuration.systemType === 'Sliding Doors' && (!configuration.panels || configuration.panels.length === 0)) {
        const defaultPanels = [
          {
            type: 'Fixed',
            width: 0,
            direction: null
          },
          {
            type: 'Sliding',
            width: 0,
            direction: 'right'
          }
        ];
        
        onUpdate({
          panels: defaultPanels,
          dimensions: configuration.dimensions || { width: '', height: '' },
          grid: undefined // Remove grid configuration for sliding doors
        });
      }

      // Set default finish if not already set
      if (!configuration.finish?.type) {
        onUpdate({
          finish: {
            type: 'Powder Coated',
            color: 'Standard',
            ralColor: '9016'
          }
        });
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
        setAvailableOperables(['OX', 'XX', 'OXX', 'XXX', 'OXXO', 'OXXX', 'XXXX', 'OXXXX', 'XXXXO', 'OXXXO', 'OOXXX', 'XXXOO', 'OXXXXO', 'XXXXXX', 'OOXXOO']);
        
        // Initialize default panels if not already set
        if (!configuration.panels || configuration.panels.length === 0) {
          const defaultPanels = [
            {
              type: 'Fixed',
              width: 0,
              direction: null
            },
            {
              type: 'Sliding',
              width: 0,
              direction: 'right'
            }
          ];
          
          onUpdate({
            panels: defaultPanels,
            dimensions: configuration.dimensions || { width: '', height: '' }
          });
        }
      }
    }
  }, [configuration.systemType]);

  useEffect(() => {
    // Initialize panels array if it doesn't exist and we're configuring a window
    if (configuration.systemType === 'Windows' && (!configuration.panels || configuration.panels.length === 0)) {
      const initialWidth = configuration.dimensions?.width || 0;
      onUpdate({
        panels: [{
          width: initialWidth,
          operationType: 'Fixed',
          handleLocation: 'right' // Default handle location
        }],
        dimensions: {
          ...configuration.dimensions,
          width: initialWidth,
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

  // Add new effect to handle width distribution when panels change
  useEffect(() => {
    if (configuration.systemType === 'Windows' && configuration.panels && configuration.dimensions?.width) {
      if (useEqualWidths) {
        const totalWidth = configuration.dimensions.width;
        const equalWidth = totalWidth / configuration.panels.length;
        const newPanels = configuration.panels.map(panel => ({
          ...panel,
          width: equalWidth
        }));
        onUpdate({ panels: newPanels });
      }
    }
  }, [configuration.panels?.length, configuration.dimensions?.width, useEqualWidths]);

  // Add new effect to handle model-specific configurations
  useEffect(() => {
    if (configuration.systemModel) {
      // Handle SD115 specific configuration
      if (configuration.systemModel === 'SD115' && configuration.openingType !== 'Pivot Door') {
        onUpdate({
          openingType: 'Pivot Door',
          swingDirection: 'Center Pivot',
          handleType: 'Pull Handle',
          lockType: 'Multi-Point Lock',
          threshold: 'Standard',
          hingeType: 'Pivot'
        });
      }
      
      // If current opening type is not available for the selected model, reset it
      if (configuration.openingType && 
          doorModelCapabilities[configuration.systemModel] && 
          !doorModelCapabilities[configuration.systemModel].includes(configuration.openingType)) {
        const defaultOpeningType = doorModelCapabilities[configuration.systemModel]?.[0] || '';
        const defaultSwingDirection = defaultOpeningType === 'Pivot Door' ? 'Center Pivot' :
                                    defaultOpeningType === 'Single Door' ? 'Left Hand In' :
                                    defaultOpeningType === 'Double Door' ? 'Active Left' :
                                    'Left Active + Right Fixed';
        
        onUpdate({
          openingType: defaultOpeningType,
          swingDirection: defaultSwingDirection,
          handleType: configuration.handleType || 'Lever Handle',
          lockType: configuration.lockType || 'Multi-Point Lock',
          threshold: configuration.threshold || 'Standard',
          hingeType: configuration.hingeType || 'Standard'
        });
      }
    }
  }, [configuration.systemModel]);

  // Add new effect to handle sidelights toggle
  useEffect(() => {
    if (configuration.systemType === 'Entrance Doors' && configuration.hasSidelights === false) {
      // Reset all sidelight configurations when disabled
      onUpdate({
        leftSidelight: { enabled: false, width: 12 },
        rightSidelight: { enabled: false, width: 12 },
        transom: { enabled: false, height: 12 }
      });
    }
  }, [configuration.hasSidelights, configuration.systemType]);

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
    
    // Always update panels when total width changes
    const newPanels = [...(configuration.panels || [])];
    if (useEqualWidths) {
      const equalWidth = totalWidth / newPanels.length;
      newPanels.forEach(panel => {
        panel.width = equalWidth;
      });
    }
    
    onUpdate({
      panels: newPanels,
      dimensions: {
        ...configuration.dimensions,
        width: totalWidth
      }
    });
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
        // For sliding doors, alternate between Fixed and Sliding panels
        const isFixed = newPanels.length === 0 || newPanels.length === count - 1;
        newPanels.push({ 
          width: useEqualWidths ? (configuration.dimensions?.width || 0) / count : 0,
          type: isFixed ? 'Fixed' : 'Sliding',
          direction: isFixed ? null : 'right'  // Default sliding direction for sliding panels
        });
      }

      // Generate operationType string (e.g., "OX", "OXXO")
      const operationType = newPanels.map(panel => 
        panel.type === 'Fixed' ? 'O' : 'X'
      ).join('');
      
      onUpdate({ 
        panels: newPanels,
        operationType
      });
    } else {
      // Remove panels from the end
      newPanels = newPanels.slice(0, count);
      
      // Update operationType after removing panels
      const operationType = newPanels.map(panel => 
        panel.type === 'Fixed' ? 'O' : 'X'
      ).join('');
      
      onUpdate({ 
        panels: newPanels,
        operationType
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
    const hasValidDimensions = configuration.dimensions?.height > 0 && configuration.dimensions?.width > 0;
    const hasValidFinish = configuration.finish?.type && 
                          configuration.finish?.color && 
                          configuration.finish?.ralColor && 
                          configuration.finish?.ralColor.length === 4;
    const hasValidModel = !!configuration.systemModel;

    if (configuration.systemType === 'Windows') {
      const hasValidPanels = configuration.panels?.length > 0 && 
        configuration.panels.every(panel => 
          panel.width > 0 && panel.operationType
        );
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidPanels;
    } else if (configuration.systemType === 'Entrance Doors') {
      const hasValidDoorConfig = configuration.openingType && 
                                configuration.swingDirection && 
                                configuration.handleType && 
                                configuration.lockType && 
                                configuration.threshold && 
                                configuration.hingeType;
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidDoorConfig;
    } else if (configuration.systemType === 'Sliding Doors') {
      const hasValidOperationType = !!configuration.operationType;
      return hasValidDimensions && hasValidFinish && hasValidModel && hasValidOperationType;
    }

    return false;
  };

  const handleConfigurationUpdate = (update) => {
    setCurrentConfiguration((prev) => {
      // For sliding doors, never allow grid configuration
      if (prev.systemType === 'Sliding Doors') {
        const { grid, ...rest } = update;
        return { ...prev, ...rest };
      }

      // Only remove grid configuration when explicitly switching to panel door type
      if (update.doorType === 'panel') {
        return { ...prev, ...update, grid: undefined };
      }
      // When switching to glass door type, initialize grid if it doesn't exist
      if (update.doorType === 'glass') {
        return { 
          ...prev, 
          ...update, 
          grid: update.grid || { enabled: true, horizontal: 2, vertical: 3 }
        };
      }
      // For all other updates, preserve existing configuration including grid
      return { ...prev, ...update };
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
        {/* Item Identification Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Item Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Item Number
                </Typography>
                <Typography variant="h5">
                  {configuration.itemNumber || '-'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (Optional)"
                placeholder="e.g., Living Room, Kitchen, Master Bedroom"
                value={configuration.location || ''}
                onChange={(e) => {
                  // Limit to 100 characters
                  if (e.target.value.length <= 100) {
                    onUpdate({ location: e.target.value });
                  }
                }}
                helperText={`${(configuration.location || '').length}/100 characters`}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

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
                p: 3, 
                border: '1px solid rgba(0, 0, 0, 0.12)', 
                borderRadius: 1,
                bgcolor: 'background.paper',
                mb: 2
              }}>
                <Typography variant="h6" gutterBottom>
                  System Dimensions
                </Typography>
                
                {/* Total System Dimensions */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    System Details
                  </Typography>
                  <Grid container spacing={3}>
                    {/* System Dimensions */}
                    <Grid item xs={12} md={8}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Overall System Dimensions
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total Width
                            </Typography>
                            <Typography variant="h5">
                              {configuration.systemType === 'Windows' ? 
                                (configuration.panels?.reduce((sum, panel) => sum + (panel.width || 0), 0) || 0) :
                                (configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                (configuration.dimensions?.width || 0) +
                                (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total system width including all components
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total Height
                            </Typography>
                            <Typography variant="h5">
                              {(configuration.dimensions?.height || 0) + 
                               (configuration.transom?.enabled ? (configuration.transom?.height || 0) : 0)}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total system height including transom
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Area Calculations */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Area Calculations
                      </Typography>
                      {configuration.systemType === 'Windows' ? (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'primary.main' }}>
                          <Typography variant="subtitle2" color="primary">
                            Total Window Area
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {((configuration.panels?.reduce((sum, panel) => sum + (panel.width || 0), 0) || 0) * 
                              (configuration.dimensions?.height || 0) / 144).toFixed(2)} sq ft
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total window system area
                          </Typography>
                        </Paper>
                      ) : configuration.systemType === 'Entrance Doors' ? (
                        <>
                          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'primary.main' }}>
                            <Typography variant="subtitle2" color="primary">
                              Total System Area
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {(
                                ((configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                 (configuration.dimensions?.width || 0) +
                                 (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)) * 
                                ((configuration.dimensions?.height || 0) + 
                                 (configuration.transom?.enabled ? (configuration.transom?.height || 0) : 0)) / 144
                              ).toFixed(2)} sq ft
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total system area including all components
                            </Typography>
                          </Paper>
                        </>
                      ) : (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'primary.main' }}>
                          <Typography variant="subtitle2" color="primary">
                            Total Door Area
                          </Typography>
                          <Typography variant="h5" color="primary">
                            {((configuration.dimensions?.width || 0) * (configuration.dimensions?.height || 0) / 144).toFixed(2)} sq ft
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total sliding door system area
                          </Typography>
                        </Paper>
                      )}
                    </Grid>
                  </Grid>
                </Box>

                {/* Door Panel and Additional Components Dimensions */}
                {configuration.systemType === 'Entrance Doors' && (
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Door Panel Dimensions
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Door Width
                                </Typography>
                                <Typography variant="h5">
                                  {configuration.dimensions?.width || 0}"
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {configuration.openingType === 'Double Door' ? 'Total width of both panels' : 'Single panel width'}
                                </Typography>
                              </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Door Height
                                </Typography>
                                <Typography variant="h5">
                                  {configuration.dimensions?.height || 0}"
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Door panel height (excluding transom)
                                </Typography>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', height: '100%' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Door Panel Area
                            </Typography>
                            <Typography variant="h5" color="text.primary">
                              {((configuration.dimensions?.width || 0) * (configuration.dimensions?.height || 0) / 144).toFixed(2)} sq ft
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Area of door panel(s) only
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>

                    {(configuration.leftSidelight?.enabled || configuration.rightSidelight?.enabled || configuration.transom?.enabled) && (
                      <Box>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Additional Components
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          {/* Total Area */}
                          <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" color="primary">
                                Total Additional Components Area
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {((
                                  // Left Sidelight Area
                                  (configuration.leftSidelight?.enabled ? 
                                    (configuration.leftSidelight.width * (configuration.dimensions?.height || 0)) : 0) +
                                  // Right Sidelight Area
                                  (configuration.rightSidelight?.enabled ? 
                                    (configuration.rightSidelight.width * (configuration.dimensions?.height || 0)) : 0) +
                                  // Top Sidelight Area
                                  (configuration.transom?.enabled ? 
                                    ((configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                     (configuration.dimensions?.width || 0) +
                                     (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)) * 
                                    (configuration.transom?.height || 0) : 0)
                                ) / 144).toFixed(2)} sq ft
                              </Typography>
                            </Box>
                          </Box>

                          {/* Components Summary */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Components Dimensions
                            </Typography>
                            {configuration.leftSidelight?.enabled && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Left Sidelight:
                                </Typography>
                                <Typography variant="body1">
                                  {configuration.leftSidelight.width}" × {configuration.dimensions?.height || 0}"
                                </Typography>
                              </Box>
                            )}
                            {configuration.rightSidelight?.enabled && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Right Sidelight:
                                </Typography>
                                <Typography variant="body1">
                                  {configuration.rightSidelight.width}" × {configuration.dimensions?.height || 0}"
                                </Typography>
                              </Box>
                            )}
                            {configuration.transom?.enabled && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Top Sidelight:
                                </Typography>
                                <Typography variant="body1">
                                  {(configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                   (configuration.dimensions?.width || 0) +
                                   (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)}" × {configuration.transom?.height || 0}"
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Window Panes Section */}
        {configuration.systemType === 'Windows' ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WindowIcon /> Configuration Details
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
                      value={configuration.dimensions.width || ''}
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
                      value={configuration.dimensions.height || ''}
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
                            if (e.target.checked && configuration.dimensions.width) {
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
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Panel {index + 1}
                          </Typography>
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
                  </Stack>
                </Paper>
              )}

              {/* Grid Configuration Section */}
              {configuration.systemType === 'Windows' && (
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GridOnIcon fontSize="small" /> Grid Configuration
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={configuration.grid?.enabled || false}
                          onChange={(e) => {
                            onUpdate({
                              grid: {
                                ...configuration.grid,
                                enabled: e.target.checked,
                                horizontal: configuration.grid?.horizontal || 2,
                                vertical: configuration.grid?.vertical || 3
                              }
                            });
                          }}
                        />
                      }
                      label="Add Divided Lights"
                    />
                    
                    {configuration.grid?.enabled && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Horizontal Divisions"
                            type="number"
                            value={configuration.grid?.horizontal || 2}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              onUpdate({
                                grid: {
                                  ...configuration.grid,
                                  horizontal: Math.max(1, value)
                                }
                              });
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
                            value={configuration.grid?.vertical || 3}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              onUpdate({
                                grid: {
                                  ...configuration.grid,
                                  vertical: Math.max(1, value)
                                }
                              });
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
              )}

              {/* Configuration Preview Section */}
              {configuration.panels?.length > 0 && (
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PreviewIcon fontSize="small" /> Configuration Preview
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxWidth: '600px', width: '100%' }}>
                      {/* Dimensions Label */}
                      <Typography variant="caption" color="text.secondary" align="center" sx={{ mb: 1, display: 'block' }}>
                        Scale Preview (Not Actual Size)
                      </Typography>

                      <ConfigurationPreviewUI configuration={configuration} maxHeight="300px" />
                    </Paper>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Box>
        ) : configuration.systemType === 'Sliding Doors' ? (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WindowIcon /> Configuration Details
            </Typography>
            
            <Stack spacing={3}>
              {/* Door Dimensions Section */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StraightIcon fontSize="small" /> Door Dimensions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
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
                        value={configuration.panels?.length || 2}
                        onChange={handlePanelCountChange}
                        label="Number of Panels"
                      >
                        {[2,3,4,5,6].map((num) => (
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
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Panel {index + 1}
                          </Typography>
                        </Box>
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
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              )}

              {/* Configuration Preview Section */}
              {configuration.panels?.length > 0 && (
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PreviewIcon fontSize="small" /> Configuration Preview
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxWidth: '600px', width: '100%' }}>
                      {/* Dimensions Label */}
                      <Typography variant="caption" color="text.secondary" align="center" sx={{ mb: 1, display: 'block' }}>
                        Scale Preview (Not Actual Size)
                      </Typography>

                      <ConfigurationPreviewUI configuration={configuration} maxHeight="300px" />
                    </Paper>
                  </Box>
                </Paper>
              )}
            </Stack>
          </Box>
        ) : (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WindowIcon /> Configuration Details
            </Typography>
            
            <Stack spacing={3}>
              {/* Door Dimensions Section */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StraightIcon fontSize="small" /> Door Dimensions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
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
              </Paper>

              {/* Basic Door Configuration */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WindowIcon fontSize="small" /> Door Configuration
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Opening Type</InputLabel>
                      <Select
                        value={configuration.openingType || ''}
                        onChange={(e) => {
                          const openingType = e.target.value;
                          onUpdate({
                            openingType,
                            handleLocation: configuration.handleLocation || 'right',
                            handleType: configuration.handleType || 'Lever Handle',
                            lockType: configuration.lockType || 'Multi-Point Lock',
                            threshold: configuration.threshold || 'Standard',
                            hingeType: configuration.hingeType || 'Standard'
                          });
                        }}
                        label="Opening Type"
                      >
                        {(doorModelCapabilities[configuration.systemModel] || doorOperables.openingTypes).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Door Type</InputLabel>
                      <Select
                        value={configuration.doorType || 'glass'}
                        onChange={(e) => {
                          const doorType = e.target.value;
                          onUpdate({ 
                            doorType,
                            // Preserve grid configuration when switching back to glass
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
                      <InputLabel>Opening Direction</InputLabel>
                      <Select
                        value={configuration.openingDirection || 'inside'}
                        onChange={(e) => onUpdate({ openingDirection: e.target.value })}
                        label="Opening Direction"
                      >
                        <MenuItem value="inside">Opening Inside</MenuItem>
                        <MenuItem value="outside">Opening Outside</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>

              {/* Grid Configuration */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GridOnIcon fontSize="small" /> Grid Configuration
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={configuration.grid?.enabled || false}
                        onChange={(e) => {
                          onUpdate({
                            grid: {
                              ...configuration.grid,
                              enabled: e.target.checked,
                              horizontal: configuration.grid?.horizontal || 2,
                              vertical: configuration.grid?.vertical || 3
                            }
                          });
                        }}
                        disabled={configuration.doorType === 'panel'}
                      />
                    }
                    label={
                      <Box>
                        <Typography>Add Divided Lights</Typography>
                        {configuration.doorType === 'panel' && (
                          <Typography variant="caption" color="text.secondary">
                            (Available only for glass doors)
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  {configuration.grid?.enabled && configuration.doorType === 'glass' && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Horizontal Divisions"
                          type="number"
                          value={configuration.grid?.horizontal || 2}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            onUpdate({
                              grid: {
                                ...configuration.grid,
                                horizontal: Math.max(1, value)
                              }
                            });
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
                          value={configuration.grid?.vertical || 3}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            onUpdate({
                              grid: {
                                ...configuration.grid,
                                vertical: Math.max(1, value)
                              }
                            });
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

              {/* Hardware Configuration */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BuildIcon fontSize="small" /> Hardware Configuration
                </Typography>
                <Stack spacing={2}>
                  {/* Handle Settings */}
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>Handle Settings</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Handle Location</InputLabel>
                          <Select
                            value={configuration.handleLocation || 'right'}
                            onChange={(e) => onUpdate({ handleLocation: e.target.value })}
                            label="Handle Location"
                          >
                            <MenuItem value="left">Left Side</MenuItem>
                            <MenuItem value="right">Right Side</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Handle Type</InputLabel>
                          <Select
                            value={configuration.handleType || 'Lever Handle'}
                            onChange={(e) => onUpdate({ handleType: e.target.value })}
                            label="Handle Type"
                          >
                            {doorOperables.handleTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Security & Operation */}
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>Security & Operation</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Lock Type</InputLabel>
                          <Select
                            value={configuration.lockType || 'Multi-Point Lock'}
                            onChange={(e) => onUpdate({ lockType: e.target.value })}
                            label="Lock Type"
                          >
                            {doorOperables.lockTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Hinge Type</InputLabel>
                          <Select
                            value={configuration.hingeType || 'Standard'}
                            onChange={(e) => onUpdate({ hingeType: e.target.value })}
                            label="Hinge Type"
                          >
                            {doorOperables.hingeTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Threshold */}
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" gutterBottom>Threshold</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Threshold Type</InputLabel>
                          <Select
                            value={configuration.threshold || 'Standard'}
                            onChange={(e) => onUpdate({ threshold: e.target.value })}
                            label="Threshold Type"
                          >
                            {doorOperables.thresholds.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              </Paper>

              {/* Additional Glass Panels Toggle */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ViewSidebarIcon fontSize="small" /> Additional Glass Panels
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure sidelights and transom for your entrance door
                    </Typography>
                  </Box>
                  <Switch
                    checked={configuration.hasSidelights || false}
                    onChange={(e) => onUpdate({ hasSidelights: e.target.checked })}
                  />
                </Box>
              </Paper>

              {/* Sidelights Configuration */}
              {configuration.hasSidelights && (
                <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ViewSidebarIcon fontSize="small" /> Sidelights Configuration
                  </Typography>
                  <Stack spacing={2}>
                    {/* Left Sidelight */}
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl sx={{ minWidth: 120, flex: 1 }}>
                          <InputLabel>Left Sidelight</InputLabel>
                          <Select
                            value={configuration.leftSidelight?.enabled || false}
                            onChange={(e) => onUpdate({
                              leftSidelight: {
                                ...configuration.leftSidelight,
                                enabled: e.target.value,
                                width: e.target.value ? (configuration.leftSidelight?.width || 12) : 0
                              }
                            })}
                            label="Left Sidelight"
                          >
                            <MenuItem value={false}>None</MenuItem>
                            <MenuItem value={true}>Enabled</MenuItem>
                          </Select>
                        </FormControl>
                        {configuration.leftSidelight?.enabled && (
                          <TextField
                            label="Width"
                            type="number"
                            value={configuration.leftSidelight?.width || 12}
                            onChange={(e) => onUpdate({
                              leftSidelight: {
                                ...configuration.leftSidelight,
                                width: parseFloat(e.target.value) || 0
                              }
                            })}
                            InputProps={{ 
                              endAdornment: <InputAdornment position="end">in</InputAdornment>,
                              inputProps: { min: 0, step: 0.1 }
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      </Box>
                    </Paper>

                    {/* Right Sidelight */}
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl sx={{ minWidth: 120, flex: 1 }}>
                          <InputLabel>Right Sidelight</InputLabel>
                          <Select
                            value={configuration.rightSidelight?.enabled || false}
                            onChange={(e) => onUpdate({
                              rightSidelight: {
                                ...configuration.rightSidelight,
                                enabled: e.target.value,
                                width: e.target.value ? (configuration.rightSidelight?.width || 12) : 0
                              }
                            })}
                            label="Right Sidelight"
                          >
                            <MenuItem value={false}>None</MenuItem>
                            <MenuItem value={true}>Enabled</MenuItem>
                          </Select>
                        </FormControl>
                        {configuration.rightSidelight?.enabled && (
                          <TextField
                            label="Width"
                            type="number"
                            value={configuration.rightSidelight?.width || 12}
                            onChange={(e) => onUpdate({
                              rightSidelight: {
                                ...configuration.rightSidelight,
                                width: parseFloat(e.target.value) || 0
                              }
                            })}
                            InputProps={{ 
                              endAdornment: <InputAdornment position="end">in</InputAdornment>,
                              inputProps: { min: 0, step: 0.1 }
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      </Box>
                    </Paper>

                    {/* Top Sidelight (Transom) */}
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl sx={{ minWidth: 120, flex: 1 }}>
                          <InputLabel>Top Sidelight</InputLabel>
                          <Select
                            value={configuration.transom?.enabled || false}
                            onChange={(e) => onUpdate({
                              transom: {
                                ...configuration.transom,
                                enabled: e.target.value,
                                height: e.target.value ? (configuration.transom?.height || 12) : 0
                              }
                            })}
                            label="Top Sidelight"
                          >
                            <MenuItem value={false}>None</MenuItem>
                            <MenuItem value={true}>Enabled</MenuItem>
                          </Select>
                        </FormControl>
                        {configuration.transom?.enabled && (
                          <TextField
                            label="Height"
                            type="number"
                            value={configuration.transom?.height || 12}
                            onChange={(e) => onUpdate({
                              transom: {
                                ...configuration.transom,
                                height: parseFloat(e.target.value) || 0
                              }
                            })}
                            InputProps={{ 
                              endAdornment: <InputAdornment position="end">in</InputAdornment>,
                              inputProps: { min: 0, step: 0.1 }
                            }}
                            sx={{ width: 120 }}
                          />
                        )}
                      </Box>
                    </Paper>
                  </Stack>
                </Paper>
              )}

              {/* Configuration Preview */}
              <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PreviewIcon fontSize="small" /> Configuration Preview
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', maxWidth: '600px', width: '100%' }}>
                    {/* Dimensions Label */}
                    <Typography variant="caption" color="text.secondary" align="center" sx={{ mb: 1, display: 'block' }}>
                      Scale Preview (Not Actual Size)
                    </Typography>

                    <ConfigurationPreviewUI configuration={configuration} maxHeight="300px" />
                  </Paper>
                </Box>
              </Paper>
            </Stack>
          </Box>
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

        <Divider sx={{ my: 4 }} />

        {/* Notes Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CommentIcon /> Notes (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Additional Notes"
            value={configuration.notes || ''}
            onChange={(e) => {
              // Limit to 1000 characters
              if (e.target.value.length <= 1000) {
                handleChange('notes')(e);
              }
            }}
            placeholder="Add any special requirements or additional details here (max 1000 characters)..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper'
              }
            }}
            helperText={`${(configuration.notes || '').length}/1000 characters`}
          />
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