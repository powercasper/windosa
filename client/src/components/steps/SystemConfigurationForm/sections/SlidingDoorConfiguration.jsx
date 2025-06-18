import React, { useEffect } from 'react';
import { Box, Typography, Stack, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import StraightIcon from '@mui/icons-material/Straight';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import ConfigurationSection from '../components/ConfigurationSection';
import DimensionsInput from '../components/DimensionsInput';
import SelectField from '../components/SelectField';

const operationTypes = {
  'OX': { panels: ['Fixed', 'Sliding'] },
  'XO': { panels: ['Sliding', 'Fixed'] },
  'OXO': { panels: ['Fixed', 'Sliding', 'Fixed'] },
  'OXXO': { panels: ['Fixed', 'Sliding', 'Sliding', 'Fixed'] },
  'Custom': { panels: [] }
};

const SlidingDoorConfiguration = ({ configuration, onUpdate }) => {
  // Initialize default configuration when component mounts
  useEffect(() => {
    if (!configuration.operationType || !configuration.panels?.length) {
      const defaultType = 'OX';
      const defaultPanels = operationTypes[defaultType].panels.map((panelType, index) => ({
        type: panelType,
        direction: panelType === 'Sliding' ? (index % 2 === 0 ? 'right' : 'left') : null
      }));
      
      onUpdate({
        operationType: defaultType,
        panels: defaultPanels,
        dimensions: configuration.dimensions || { width: 72, height: 80 }
      });
    }
  }, []);

  const handleDimensionsChange = (dimensions) => {
    onUpdate({ dimensions });
  };

  const handleOperationTypeChange = (event) => {
    const type = event.target.value;
    const panels = type === 'Custom' ? [] : operationTypes[type].panels.map((panelType, index) => ({
      type: panelType,
      direction: panelType === 'Sliding' ? (index % 2 === 0 ? 'right' : 'left') : null
    }));
    
    onUpdate({ 
      operationType: type,
      panels
    });
  };

  const handlePanelDirectionChange = (index) => (event) => {
    const newPanels = [...(configuration.panels || [])];
    newPanels[index] = {
      ...newPanels[index],
      direction: event.target.value
    };
    onUpdate({ panels: newPanels });
  };

  return (
    <Stack spacing={3}>
      {/* Door Dimensions Section */}
      <ConfigurationSection title="Door Dimensions" icon={StraightIcon}>
        <DimensionsInput 
          dimensions={configuration.dimensions} 
          onChange={handleDimensionsChange}
          widthProps={{ 'data-testid': 'width-input' }}
          heightProps={{ 'data-testid': 'height-input' }}
        />
      </ConfigurationSection>

      {/* Door Configuration */}
      <ConfigurationSection title="Door Configuration" icon={DoorSlidingIcon}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SelectField
              label="Operation Type"
              value={configuration.operationType || ''}
              onChange={handleOperationTypeChange}
              options={Object.keys(operationTypes).map(type => ({ value: type, label: type }))}
              inputProps={{ 'data-testid': 'operation-type-select' }}
              error={!configuration.operationType}
              helperText={!configuration.operationType ? 'Operation type is required' : ''}
            />
          </Grid>
        </Grid>
      </ConfigurationSection>

      {/* Panel Configuration */}
      {configuration.panels?.length > 0 && (
        <ConfigurationSection title="Panel Configuration" icon={ViewSidebarIcon}>
          <Grid container spacing={2}>
            {configuration.panels.map((panel, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Panel {index + 1}: {panel.type}
                  </Typography>
                  {panel.type === 'Sliding' && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Sliding Direction</InputLabel>
                      <Select
                        value={panel.direction || 'right'}
                        onChange={handlePanelDirectionChange(index)}
                        label="Sliding Direction"
                        data-testid={`panel-${index}-direction-select`}
                      >
                        <MenuItem value="left">Left ←</MenuItem>
                        <MenuItem value="right">Right →</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </ConfigurationSection>
      )}
    </Stack>
  );
};

export default SlidingDoorConfiguration; 