import React from 'react';
import { Box, Typography, Stack, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import BuildIcon from '@mui/icons-material/Build';
import StraightIcon from '@mui/icons-material/Straight';
import { doorOperables } from '../../../../utils/metadata';
import DimensionsInput from '../components/DimensionsInput';
import GridConfiguration from '../components/GridConfiguration';
import SidelightConfiguration from '../components/SidelightConfiguration';
import ConfigurationSection from '../components/ConfigurationSection';
import SelectField from '../components/SelectField';
import HardwareConfiguration from '../components/HardwareConfiguration';

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
      <ConfigurationSection title="Door Dimensions" icon={StraightIcon}>
        <DimensionsInput 
          dimensions={configuration.dimensions} 
          onChange={handleDimensionsChange}
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectField
              label="Opening Type"
              value={configuration.openingType || ''}
              onChange={handleChange('openingType')}
              options={doorOperables.openingTypes}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SelectField
              label="Swing Direction"
              value={configuration.swingDirection || ''}
              onChange={handleChange('swingDirection')}
              options={configuration.openingType ? doorOperables.swingDirections[configuration.openingType] : []}
              disabled={!configuration.openingType}
            />
          </Grid>
        </Grid>
      </ConfigurationSection>

      {/* Hardware Configuration */}
      <HardwareConfiguration
        configuration={configuration}
        onUpdate={onUpdate}
        options={doorOperables}
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
        />
      )}
    </Stack>
  );
};

export default EntranceDoorConfiguration; 