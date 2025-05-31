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
  Tooltip,
  IconButton,
  Snackbar,
} from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
  };

  const isValid = () => {
    return finishValues.type && 
           finishValues.color && 
           (!finishValues.ralColor || finishValues.ralColor.length === 4);
  };

  return (
    <Paper 
      sx={{ 
        p: 2,
        mb: 2,
        bgcolor: 'background.paper',
      }}
      elevation={1}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <ColorLensIcon color="primary" />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Default Finish</Typography>
        <Tooltip title="These settings will be applied as defaults for all new items. You can still modify them for individual items later.">
          <IconButton size="small">
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        <FormControl 
          size="small"
          sx={{ minWidth: 150 }}
        >
          <InputLabel>Type</InputLabel>
          <Select
            value={finishValues.type}
            onChange={handleFinishChange('type')}
            label="Type"
          >
            {Object.keys(finishOptions).map((finish) => (
              <MenuItem key={finish} value={finish}>
                {finish}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl 
          size="small"
          sx={{ minWidth: 150 }}
        >
          <InputLabel>Style</InputLabel>
          <Select
            value={finishValues.color}
            onChange={handleFinishChange('color')}
            label="Style"
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
          size="small"
          label="RAL"
          value={finishValues.ralColor}
          onChange={handleRalColorChange}
          error={finishValues.ralColor && finishValues.ralColor.length !== 4}
          helperText={finishValues.ralColor && finishValues.ralColor.length !== 4 ? 
            "Must be 4 digits" : ""}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                RAL
              </InputAdornment>
            ),
            sx: { height: '40px' }
          }}
          inputProps={{
            maxLength: 4,
            pattern: '[0-9]*',
          }}
          sx={{ width: 150 }}
        />

        <Button
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!isValid()}
          sx={{ 
            height: '40px',
            ml: { xs: 0, sm: 'auto' } 
          }}
        >
          Save
        </Button>
      </Stack>

      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        message="Default finish options saved"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default DefaultFinishOptions; 