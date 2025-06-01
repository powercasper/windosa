import React from 'react';
import { Box, Typography, Grid, Paper, TextField } from '@mui/material';

const ItemDetails = ({ configuration, onUpdate }) => {
  return (
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
  );
};

export default ItemDetails; 