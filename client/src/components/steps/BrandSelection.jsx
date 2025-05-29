import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Radio,
  CardActionArea,
  Paper,
} from '@mui/material';
import { systemBrands } from '../../utils/metadata';

const BrandSelection = ({ configuration, onUpdate }) => {
  const handleBrandSelect = (brandName) => {
    onUpdate({ brand: brandName });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Select Brand
      </Typography>
      <Grid container spacing={3}>
        {systemBrands.map((brandName) => (
          <Grid item xs={12} sm={6} md={4} key={brandName}>
            <Card 
              elevation={configuration.brand === brandName ? 6 : 1}
              sx={{
                transition: 'all 0.3s ease-in-out',
                transform: configuration.brand === brandName ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 6,
                }
              }}
            >
              <CardActionArea onClick={() => handleBrandSelect(brandName)}>
                <Box position="relative">
                  <CardMedia
                    component="div"
                    sx={{
                      height: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: configuration.brand === brandName ? 'primary.light' : 'grey.100',
                      transition: 'background-color 0.3s ease-in-out',
                    }}
                  >
                    <Typography 
                      variant="h3" 
                      sx={{
                        color: configuration.brand === brandName ? 'primary.contrastText' : 'text.secondary',
                        fontWeight: configuration.brand === brandName ? 600 : 500,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {brandName}
                    </Typography>
                  </CardMedia>
                  <Box
                    position="absolute"
                    top={8}
                    right={8}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      padding: '2px',
                    }}
                  >
                    <Radio
                      checked={configuration.brand === brandName}
                      value={brandName}
                      name="brand-selection"
                      color="primary"
                    />
                  </Box>
                </Box>
                <CardContent sx={{ pt: 3, pb: 3 }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      variant="h6" 
                      align="center"
                      sx={{
                        fontWeight: configuration.brand === brandName ? 600 : 500,
                        color: configuration.brand === brandName ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {brandName}
                    </Typography>
                  </Box>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      bgcolor: 'grey.50',
                      p: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      align="center"
                      sx={{
                        lineHeight: 1.4,
                        fontWeight: 400,
                      }}
                    >
                      {getBrandDescription(brandName)}
                    </Typography>
                  </Paper>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Helper function to get brand descriptions
const getBrandDescription = (brandName) => {
  const descriptions = {
    'Alumil': 'Leading aluminum systems manufacturer in Southeast Europe, known for innovative designs and superior quality',
    'Aluprof': 'Premium European aluminum systems provider with cutting-edge technology and sustainable solutions',
    'Cortizo': 'Spain\'s largest aluminum systems manufacturer, combining aesthetics with advanced engineering',
    'Reynaers': 'Leading European aluminum solutions provider, specializing in high-performance architectural systems',
    'Schuco': 'German engineering excellence in window and door systems with precision and innovative technology'
  };
  return descriptions[brandName] || '';
};

export default BrandSelection; 