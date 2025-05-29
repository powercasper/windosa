import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Radio,
  CardActionArea,
  Paper,
} from '@mui/material';

const glassOptions = [
  {
    type: 'Double Pane',
    description: 'Standard insulation, good for most applications',
    specs: '1" IGU with Low-E coating',
    price: 12.5
  },
  {
    type: 'Triple Pane',
    description: 'Superior insulation for extreme climates',
    specs: '1.5" IGU with double Low-E coating',
    price: 18.75
  },
  {
    type: 'Security Glass',
    description: 'Laminated glass for enhanced security',
    specs: '1" IGU with laminated inner lite',
    price: 22
  },
  {
    type: 'Acoustic Glass',
    description: 'Enhanced sound reduction',
    specs: '1" IGU with acoustic PVB interlayer',
    price: 25
  }
];

const GlassOptions = ({ configuration, onUpdate }) => {
  const handleGlassSelect = (glassType) => {
    onUpdate({ glassType });
  };

  if (!configuration.systemModel) {
    return (
      <Typography color="error">
        Please complete the system configuration first
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Glass Package
      </Typography>
      <Grid container spacing={3}>
        {glassOptions.map((glass) => {
          const isSelected = configuration.glassType === glass.type;
          return (
            <Grid item xs={12} sm={6} key={glass.type}>
              <Card
                sx={{
                  transition: 'all 0.3s ease-in-out',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  bgcolor: isSelected ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    bgcolor: isSelected ? 'primary.light' : 'grey.100',
                  }
                }}
                elevation={isSelected ? 6 : 1}
              >
                <CardActionArea onClick={() => handleGlassSelect(glass.type)}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="h6"
                        sx={{
                          color: isSelected ? 'primary.contrastText' : 'inherit',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {glass.type}
                      </Typography>
                      <Radio
                        checked={isSelected}
                        value={glass.type}
                        name="glass-selection"
                        sx={{
                          color: isSelected ? 'primary.contrastText' : 'inherit',
                          '&.Mui-checked': {
                            color: isSelected ? 'primary.contrastText' : 'primary.main'
                          }
                        }}
                      />
                    </Box>
                    <Typography 
                      color={isSelected ? 'primary.contrastText' : 'textSecondary'} 
                      gutterBottom
                    >
                      {glass.description}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={isSelected ? 'primary.contrastText' : 'textSecondary'}
                    >
                      Specifications: {glass.specs}
                    </Typography>
                    <Box mt={2}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{
                          color: isSelected ? 'primary.contrastText' : 'primary.main',
                          fontWeight: isSelected ? 600 : 500
                        }}
                      >
                        ${glass.price.toFixed(2)} per sq ft
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {configuration.glassType && (
        <Paper sx={{ mt: 3, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography>
            Selected: {configuration.glassType}
          </Typography>
          <Typography variant="body2">
            Total Glass Area: {((configuration.dimensions.width * configuration.dimensions.height) / 144).toFixed(2)} sq ft
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default GlassOptions; 