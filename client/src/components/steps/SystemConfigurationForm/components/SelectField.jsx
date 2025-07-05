import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const SelectField = ({ 
  label, 
  value, 
  onChange, 
  options, 
  disabled = false,
  fullWidth = true,
  required = false,
  sx = {},
  inputProps = {},
  error = false,
  helperText = ''
}) => {
  return (
    <FormControl 
      fullWidth={fullWidth} 
      disabled={disabled}
      required={required}
      sx={sx}
      error={error}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={onChange}
        label={label}
        inputProps={inputProps}
      >
        {options.map((option) => (
          <MenuItem 
            key={typeof option === 'string' ? option : option.value} 
            value={typeof option === 'string' ? option : option.value}
            disabled={typeof option === 'object' && option.disabled}
          >
            {typeof option === 'string' ? option : option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default SelectField; 