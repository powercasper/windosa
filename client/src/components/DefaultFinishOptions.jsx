import React from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Stack,
  Button,
  Alert,
} from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import { finishOptions } from '../utils/metadata';

const DefaultFinishOptions = ({ defaultFinish, onSaveDefaults }) => {
  const [finishValues, setFinishValues] = React.useState(defaultFinish || {
    type: '',
    color: '',
    ralColor: ''
  });
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);

  const handleFinishChange = (field) => (event) => {
    const newValues = {
      ...finishValues,
      [field]: event.target.value
    };
    // Reset color when type changes
    if (field === 'type') {
      newValues.color = '';
    }
    setFinishValues(newValues);
  };

  const handleRalColorChange = (event) => {
    const value = event.target.value;
    if (value === '' || (/^\d{0,4}$/.test(value))) {
      setFinishValues({
        ...finishValues,
        ralColor: value
      });
    }
  };

  const handleSave = () => {
    onSaveDefaults(finishValues);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  const isValid = () => {
    return finishValues.type && 
           finishValues.color && 
           finishValues.ralColor && 
           finishValues.ralColor.length === 4;
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3,
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
        position: 'relative',
        overflow: 'hidden'
      }}
      elevation={3}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ColorLensIcon fontSize="large" /> Default Finish Options
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Set default finish options that will be applied to all new items. You can still modify these for individual items later.
          </Typography>
        </Box>

        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Stack spacing={3}>
            <FormControl 
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  height: '56px'
                }
              }}
            >
              <InputLabel>Finish Type</InputLabel>
              <Select
                value={finishValues.type}
                onChange={handleFinishChange('type')}
                label="Finish Type"
              >
                {Object.keys(finishOptions).map((finish) => (
                  <MenuItem key={finish} value={finish}>
                    {finish}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl 
              fullWidth
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  height: '56px'
                }
              }}
            >
              <InputLabel>Finish Style</InputLabel>
              <Select
                value={finishValues.color}
                onChange={handleFinishChange('color')}
                label="Finish Style"
                disabled={!finishValues.type}
              >
                {finishValues.type && finishOptions[finishValues.type].map((style) => (
                  <MenuItem key={style} value={style}>
                    {style}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="RAL Color"
              value={finishValues.ralColor}
              onChange={handleRalColorChange}
              error={finishValues.ralColor && finishValues.ralColor.length !== 4}
              helperText={finishValues.ralColor && finishValues.ralColor.length !== 4 ? 
                "RAL color must be exactly 4 digits" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    RAL
                  </InputAdornment>
                ),
                sx: {
                  height: '56px'
                }
              }}
              inputProps={{
                maxLength: 4,
                pattern: '[0-9]*',
                style: { height: '56px', padding: '0 14px' }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!isValid()}
                sx={{ 
                  bgcolor: 'primary.dark',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  }
                }}
              >
                Save Default Options
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>

      {showSaveSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'absolute',
            bottom: 16,
            right: 16,
            left: 16,
            boxShadow: 2
          }}
        >
          Default finish options saved successfully!
        </Alert>
      )}

      {/* Background decoration */}
      <ColorLensIcon 
        sx={{ 
          position: 'absolute',
          right: -50,
          top: -50,
          fontSize: 200,
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }} 
      />
    </Paper>
  );
};

export default DefaultFinishOptions; 