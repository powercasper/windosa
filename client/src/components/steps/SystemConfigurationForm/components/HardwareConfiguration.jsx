import React from 'react';
import { Grid } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import SelectField from './SelectField';
import ConfigurationSection from './ConfigurationSection';

const HardwareConfiguration = ({ 
  configuration, 
  onUpdate,
  options,
  fields = ['handleType', 'lockType', 'threshold', 'hingeType']
}) => {
  const handleChange = (field) => (event) => {
    onUpdate({ [field]: event.target.value });
  };

  const getFieldOptions = (field) => {
    switch (field) {
      case 'handleType':
        return options.handleTypes || [];
      case 'lockType':
        return options.lockTypes || [];
      case 'threshold':
        return options.thresholds || [];
      case 'hingeType':
        return options.hingeTypes || [];
      default:
        return [];
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'handleType':
        return 'Handle Type';
      case 'lockType':
        return 'Lock Type';
      case 'threshold':
        return 'Threshold Type';
      case 'hingeType':
        return 'Hinge Type';
      default:
        return field;
    }
  };

  return (
    <ConfigurationSection title="Hardware Configuration" icon={BuildIcon}>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <SelectField
              label={getFieldLabel(field)}
              value={configuration[field] || ''}
              onChange={handleChange(field)}
              options={getFieldOptions(field)}
            />
          </Grid>
        ))}
      </Grid>
    </ConfigurationSection>
  );
};

export default HardwareConfiguration; 