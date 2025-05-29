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
        {glassOptions.map((glass) => (
          <Grid item xs={12} sm={6} key={glass.type}>
            <Card>
              <CardActionArea onClick={() => handleGlassSelect(glass.type)}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                      {glass.type}
                    </Typography>
                    <Radio
                      checked={configuration.glassType === glass.type}
                      value={glass.type}
                      name="glass-selection"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {glass.description}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Specifications: {glass.specs}
                  </Typography>
                  <Box mt={2}>
                    <Typography variant="subtitle1" color="primary">
                      ${glass.price.toFixed(2)} per sq ft
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
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