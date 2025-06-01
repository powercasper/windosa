import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import ItemDetails from './sections/ItemDetails';
import SystemDetails from './sections/SystemDetails';
import WindowConfiguration from './sections/WindowConfiguration';
import SlidingDoorConfiguration from './sections/SlidingDoorConfiguration';
import EntranceDoorConfiguration from './sections/EntranceDoorConfiguration';
import NotesSection from './sections/NotesSection';
import { useFormValidation } from './hooks/useFormValidation';

const SystemConfigurationForm = ({ configuration, onUpdate, onNext }) => {
  const isFormValid = useFormValidation(configuration);

  const renderConfigurationSection = () => {
    switch (configuration.systemType) {
      case 'Windows':
        return <WindowConfiguration configuration={configuration} onUpdate={onUpdate} />;
      case 'Sliding Doors':
        return <SlidingDoorConfiguration configuration={configuration} onUpdate={onUpdate} />;
      case 'Entrance Doors':
        return <EntranceDoorConfiguration configuration={configuration} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configure {configuration.systemType}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <ItemDetails configuration={configuration} onUpdate={onUpdate} />
        <SystemDetails configuration={configuration} onUpdate={onUpdate} />
        {renderConfigurationSection()}
        <NotesSection configuration={configuration} onUpdate={onUpdate} />

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onNext}
            disabled={!isFormValid}
            size="large"
          >
            Next
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SystemConfigurationForm; 