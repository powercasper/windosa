import React from 'react';
import { Paper, Typography, Stack } from '@mui/material';

const ConfigurationSection = ({ 
  title, 
  icon: Icon, 
  children, 
  spacing = 2,
  elevation = 1
}) => {
  return (
    <Paper sx={{ p: 3, bgcolor: 'background.paper' }} elevation={elevation}>
      {title && (
        <Typography 
          variant="subtitle1" 
          color="primary" 
          gutterBottom 
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {Icon && <Icon fontSize="small" />} {title}
        </Typography>
      )}
      <Stack spacing={spacing}>
        {children}
      </Stack>
    </Paper>
  );
};

export default ConfigurationSection; 