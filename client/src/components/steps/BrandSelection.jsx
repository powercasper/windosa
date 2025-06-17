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
import { useMetadata } from '../../contexts/MetadataContext';
import DefaultFinishOptions from '../DefaultFinishOptions';
import BusinessIcon from '@mui/icons-material/Business';

const brandLogos = {
  'Alumil': 'https://www.alumil.com/media/1455/alumil-logo.png',
  'Reynaers': 'https://www.reynaers.com/sites/default/files/styles/header_logo/public/2019-01/reynaers-aluminium-logo.png'
};

const systemTypeLabels = {
  Windows: "Windows",
  'Entrance Doors': "Entrance Doors",
  'Sliding Doors': "Sliding Doors"
};

const BrandSelection = ({ configuration, onUpdate, onNext, brands, isEditing }) => {
  const { metadata, loading, error } = useMetadata();

  if (loading) {
    return <Typography>Loading brands...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading brands. Please try again later.</Typography>;
  }

  const systemBrands = metadata?.systemBrands || [];

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
        {systemBrands.map((brand) => {
          const isSelected = configuration.brand === brand;
          const description = getBrandDescription(brand);
          
          return (
            <Grid item xs={12} sm={6} key={brand}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  bgcolor: isSelected ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    bgcolor: isSelected ? 'primary.light' : 'action.hover',
                  },
                  position: 'relative'
                }}
                onClick={() => handleBrandSelect(brand)}
                elevation={isSelected ? 6 : 1}
              >
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      justifyContent: 'space-between'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <BusinessIcon 
                          sx={{ 
                            fontSize: 40,
                            color: isSelected ? 'primary.contrastText' : 'primary.main'
                          }} 
                        />
                        <Typography 
                          variant="h5" 
                          component="div"
                          sx={{
                            color: isSelected ? 'primary.contrastText' : 'inherit',
                            fontWeight: isSelected ? 600 : 500
                          }}
                        >
                          {brand}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <Chip 
                          label="Selected" 
                          color="primary"
                          sx={{
                            bgcolor: 'primary.dark',
                            color: 'primary.contrastText'
                          }}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{
                        color: isSelected ? 'primary.contrastText' : 'text.secondary',
                        mb: 2
                      }}
                    >
                      {description}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap'
                    }}>
                      <Chip 
                        label="Windows" 
                        size="small"
                        sx={{
                          bgcolor: isSelected ? 'primary.dark' : 'grey.100',
                          color: isSelected ? 'primary.contrastText' : 'text.primary'
                        }}
                      />
                      <Chip 
                        label="Doors" 
                        size="small"
                        sx={{
                          bgcolor: isSelected ? 'primary.dark' : 'grey.100',
                          color: isSelected ? 'primary.contrastText' : 'text.primary'
                        }}
                      />
                      <Chip 
                        label="Curtain Walls" 
                        size="small"
                        sx={{
                          bgcolor: isSelected ? 'primary.dark' : 'grey.100',
                          color: isSelected ? 'primary.contrastText' : 'text.primary'
                        }}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
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