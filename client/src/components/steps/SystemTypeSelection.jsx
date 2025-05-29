import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
} from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';

const systemTypes = [
  { name: 'Windows', icon: WindowIcon },
  { name: 'Entrance Doors', icon: DoorFrontIcon },
  { name: 'Sliding Doors', icon: ViewStreamIcon },
  { name: 'Folding Doors', icon: ViewComfyIcon },
  { name: 'Curtain Wall Systems', icon: ViewQuiltIcon },
];

const SystemTypeSelection = ({ configuration, onUpdate }) => {
  const handleSystemTypeSelect = (systemType) => {
    onUpdate({ systemType });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select System Type
      </Typography>
      {!configuration.brand && (
        <Typography color="error" gutterBottom>
          Please select a brand first
        </Typography>
      )}
      <Grid container spacing={3}>
        {systemTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={type.name}>
              <Card 
                sx={{
                  opacity: configuration.brand ? 1 : 0.5,
                  transition: 'all 0.3s'
                }}
              >
                <CardActionArea 
                  onClick={() => handleSystemTypeSelect(type.name)}
                  disabled={!configuration.brand}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      p={2}
                    >
                      <Icon sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h6" align="center">
                        {type.name}
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SystemTypeSelection; 