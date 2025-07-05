import React from 'react';
import { Box, Typography, Stack, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import BuildIcon from '@mui/icons-material/Build';
import StraightIcon from '@mui/icons-material/Straight';
import { useMetadata } from '../../../../contexts/MetadataContext';
import DimensionsInput from '../components/DimensionsInput';
import GridConfiguration from '../components/GridConfiguration';
import SidelightConfiguration from '../components/SidelightConfiguration';
import ConfigurationSection from '../components/ConfigurationSection';
import SelectField from '../components/SelectField';
import HardwareConfiguration from '../components/HardwareConfiguration';

const EntranceDoorConfiguration = ({ configuration, onUpdate }) => {
  const { metadata } = useMetadata();
  
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

  // Get swing direction options based on opening type
  const getSwingDirectionOptions = () => {
    if (!configuration.openingType || !metadata?.doorOperables) return [];
    return metadata.doorOperables.swingDirections[configuration.openingType] || [];
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
      <ConfigurationSection title="Door Configuration" icon={ViewSidebarIcon}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <SelectField
              label="Door Type"
              value={configuration.doorType || 'glass'}
              onChange={(e) => {
                const doorType = e.target.value;
                onUpdate({ 
                  doorType,
                  grid: doorType === 'glass' ? (configuration.grid || { enabled: false, horizontal: 2, vertical: 3 }) : undefined
                });
              }}
              options={[
                { value: 'glass', label: 'Glass Door' },
                { value: 'panel', label: 'Panel Door' }
              ]}
              inputProps={{ 'data-testid': 'door-type-select' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectField
              label="Opening Type"
              value={configuration.openingType || ''}
              onChange={handleChange('openingType')}
              options={metadata?.doorOperables.openingTypes}
              inputProps={{ 'data-testid': 'opening-type-select' }}
              error={!configuration.openingType}
              helperText={!configuration.openingType ? 'Opening type is required' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectField
              label="Swing Direction"
              value={configuration.swingDirection || ''}
              onChange={handleChange('swingDirection')}
              options={getSwingDirectionOptions()}
              inputProps={{ 'data-testid': 'swing-direction-select' }}
              error={!configuration.swingDirection}
              helperText={!configuration.swingDirection ? 'Swing direction is required' : ''}
              disabled={!configuration.openingType}
            />
          </Grid>
        </Grid>
      </ConfigurationSection>

      {/* Hardware Configuration */}
      <HardwareConfiguration
        configuration={configuration}
        onUpdate={onUpdate}
        options={metadata?.doorOperables}
        testIds={{
          handleType: 'handle-type-select',
          lockType: 'lock-type-select',
          threshold: 'threshold-select',
          hingeType: 'hinge-type-select'
        }}
      />

      {/* Sidelights Configuration */}
      <ConfigurationSection title="Additional Components" icon={ViewSidebarIcon}>
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
      </ConfigurationSection>

      {/* Grid Configuration */}
      {configuration.doorType === 'glass' && (
        <GridConfiguration 
          grid={configuration.grid} 
          onChange={handleGridChange}
          testIds={{
            enableGrids: 'enable-grids-checkbox',
            gridPattern: 'grid-pattern-select',
            horizontalCount: 'horizontal-grid-input',
            verticalCount: 'vertical-grid-input'
          }}
        />
      )}
    </Stack>
  );
};

export default EntranceDoorConfiguration; 