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
  Divider,
  Chip,
  Button,
} from '@mui/material';
import { systemBrands } from '../../utils/metadata';
import DefaultFinishOptions from '../DefaultFinishOptions';

const BrandSelection = ({ configuration, onUpdate, onNext, brands, isEditing }) => {
  const handleBrandSelect = (brand) => {
    onUpdate({ brand });
    onNext();
  };

  const handleSaveDefaultFinish = (finishValues) => {
    // Save to localStorage for persistence
    localStorage.setItem('defaultFinishOptions', JSON.stringify(finishValues));
    // Update the current configuration with these values
    onUpdate({ 
      finish: finishValues
    });
  };

  // Get default finish options from localStorage if they exist
  const defaultFinish = React.useMemo(() => {
    const saved = localStorage.getItem('defaultFinishOptions');
    return saved ? JSON.parse(saved) : null;
  }, []);

  return (
    <Box>
      <DefaultFinishOptions 
        defaultFinish={defaultFinish}
        onSaveDefaults={handleSaveDefaultFinish}
      />

      <Divider sx={{ my: 6 }} />

      <Typography variant="h5" gutterBottom>
        Select Brand
      </Typography>
      <Grid container spacing={3}>
        {brands.map((brand) => (
          <Grid item xs={12} sm={6} md={4} key={brand}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                bgcolor: configuration.brand === brand ? 'primary.light' : 'background.paper',
                '&:hover': {
                  bgcolor: configuration.brand === brand ? 'primary.light' : 'action.hover',
                }
              }}
              onClick={() => handleBrandSelect(brand)}
            >
              <CardContent>
                <Typography variant="h6" component="div">
                  {brand}
                </Typography>
                {configuration.brand === brand && (
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label="Selected" 
                      color="primary" 
                      size="small"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isEditing && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={onNext}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

// Helper function to get brand descriptions
const getBrandDescription = (brandName) => {
  const descriptions = {
    'Alumil': 'Leading aluminum systems manufacturer in Southeast Europe, known for innovative designs and superior quality',
    'Reynaers': 'Leading European aluminum solutions provider, specializing in high-performance architectural systems'
  };
  return descriptions[brandName] || '';
};

export default BrandSelection; 