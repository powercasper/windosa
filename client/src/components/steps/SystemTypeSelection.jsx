import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
  Chip,
  Button,
} from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

// Define the mapping of system types to their icons
const iconMapping = {
  Windows: WindowIcon,
  'Entrance Doors': DoorFrontIcon,
  'Sliding Doors': DoorSlidingIcon,
  'Window Wall': ViewModuleIcon
};

const SystemTypeSelection = ({ configuration, onUpdate, onNext, systemTypes, isEditing }) => {
  // Debug logging
  console.log('🎯 SystemTypeSelection: Component rendered');
  console.log('📋 SystemTypeSelection: systemTypes prop:', systemTypes);
  console.log('🔍 SystemTypeSelection: systemTypes length:', systemTypes?.length);
  console.log('🎨 SystemTypeSelection: iconMapping keys:', Object.keys(iconMapping));
  console.log('🔍 SystemTypeSelection: Checking if "Window Wall" in systemTypes:', systemTypes?.includes('Window Wall'));
  console.log('🔍 SystemTypeSelection: Checking if "Window Wall" in iconMapping:', 'Window Wall' in iconMapping);
  const handleTypeSelect = (type) => {
    console.log('🎯 SystemTypeSelection: handleTypeSelect called with type:', type);
    const baseConfig = {
      systemType: type,
      systemModel: '',
      dimensions: { width: 0, height: 0 }
    };

    let additionalConfig = {};
    
    if (type === 'Sliding Doors') {
      // Initialize sliding door configuration with default OX configuration
      additionalConfig = {
        operationType: 'OX',
        panels: [
          { type: 'Fixed', direction: null },
          { type: 'Sliding', direction: 'right' }
        ],
        dimensions: { width: 72, height: 80 }
      };
    } else if (type === 'Windows') {
      additionalConfig = {
        panels: []
      };
    } else if (type === 'Window Wall') {
      // Initialize window wall with a single cell
      additionalConfig = {
        grid: {
          rows: 1,
          columns: 1,
          cells: [
            {
              id: 'cell-1',
              row: 0,
              col: 0,
              rowSpan: 1,
              colSpan: 1,
              type: 'Fixed Window',
              config: {
                systemType: 'Fixed Window',
                dimensions: { width: 36, height: 48 },
                finish: {
                  type: 'Powder Coated',
                  color: 'Standard',
                  ralColor: '7016'
                }
              }
            }
          ]
        },
        dimensions: { width: 36, height: 48 }
      };
    }

    onUpdate({ 
      ...baseConfig,
      ...additionalConfig
    });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select System Type
      </Typography>
      {!configuration.brand && (
        <Typography color="error" gutterBottom>
          Please select a brand first
        </Typography>
      )}
      <Grid container spacing={3}>
        {systemTypes.map((type) => {
          console.log('🎯 SystemTypeSelection: Rendering type:', type);
          console.log('🎨 SystemTypeSelection: Icon for type:', type, '=', iconMapping[type]);
          const Icon = iconMapping[type];
          const isSelected = configuration.systemType === type;
          return (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Card 
                sx={{
                  opacity: configuration.brand ? 1 : 0.5,
                  transition: 'all 0.3s ease-in-out',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  bgcolor: isSelected ? 'primary.light' : 'background.paper',
                  '&:hover': {
                    transform: configuration.brand ? 'scale(1.02)' : 'scale(1)',
                    bgcolor: isSelected ? 'primary.light' : configuration.brand ? 'grey.100' : 'background.paper',
                  }
                }}
                elevation={isSelected ? 6 : 1}
              >
                <CardActionArea 
                  onClick={() => handleTypeSelect(type)}
                  disabled={!configuration.brand}
                  sx={{ height: '100%' }}
                  data-testid={`${type.toLowerCase().replace(/\s+/g, '-')}-option`}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      p={2}
                    >
                      {Icon && <Icon 
                        sx={{ 
                          fontSize: 60, 
                          mb: 2,
                          color: isSelected ? 'primary.contrastText' : 'inherit'
                        }} 
                      />}
                      <Typography 
                        variant="h6" 
                        align="center"
                        sx={{
                          color: isSelected ? 'primary.contrastText' : 'inherit',
                          fontWeight: isSelected ? 600 : 400
                        }}
                      >
                        {type}
                      </Typography>
                    </Box>
                    {isEditing && type === configuration.systemType && (
                      <Chip 
                        label="Current Selection" 
                        color="primary" 
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
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

export default SystemTypeSelection; 