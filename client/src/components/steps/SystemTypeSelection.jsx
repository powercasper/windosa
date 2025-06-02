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

// Define the mapping of system types to their icons
const iconMapping = {
  Windows: WindowIcon,
  'Entrance Doors': DoorFrontIcon,
  'Sliding Doors': DoorSlidingIcon
};

const SystemTypeSelection = ({ configuration, onUpdate, onNext, systemTypes, isEditing }) => {
  const handleTypeSelect = (type) => {
    onUpdate({ 
      systemType: type,
      // Reset dependent fields when changing system type
      systemModel: '',
      operationType: '',
      dimensions: { width: 0, height: 0 },
      panels: []
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