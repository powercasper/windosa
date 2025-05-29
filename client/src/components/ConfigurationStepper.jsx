import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import BrandSelection from './steps/BrandSelection';
import SystemTypeSelection from './steps/SystemTypeSelection';
import SystemConfigurationForm from './steps/SystemConfigurationForm';
import GlassOptions from './steps/GlassOptions';
import PricingSummary from './steps/PricingSummary';

const steps = [
  'Select Brand',
  'Choose System Type',
  'Configure System',
  'Glass Options',
  'Review & Price'
];

const ConfigurationStepper = ({ metadata }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [configuration, setConfiguration] = useState({
    brand: '',
    systemType: '',
    systemModel: '',
    operationType: '',
    dimensions: { width: 0, height: 0 },
    glassType: '',
    finish: { type: '', color: '' }
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleConfigurationUpdate = (update) => {
    setConfiguration((prev) => ({ ...prev, ...update }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BrandSelection 
          configuration={configuration} 
          onUpdate={handleConfigurationUpdate}
          brands={metadata?.systemHierarchy ? Object.keys(metadata.systemHierarchy) : []}
        />;
      case 1:
        return <SystemTypeSelection 
          configuration={configuration} 
          onUpdate={handleConfigurationUpdate}
          systemTypes={metadata?.systemTypes || []}
        />;
      case 2:
        return <SystemConfigurationForm 
          configuration={configuration} 
          onUpdate={handleConfigurationUpdate}
          metadata={metadata}
        />;
      case 3:
        return <GlassOptions 
          configuration={configuration} 
          onUpdate={handleConfigurationUpdate}
        />;
      case 4:
        return <PricingSummary configuration={configuration} />;
      default:
        return 'Unknown step';
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return !!configuration.brand;
      case 1:
        return !!configuration.systemType;
      case 2:
        return !!configuration.systemModel && 
               configuration.dimensions.width > 0 && 
               configuration.dimensions.height > 0;
      case 3:
        return !!configuration.glassType;
      default:
        return true;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, m: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4, mb: 2 }}>
        {activeStep === steps.length ? (
          <Typography variant="h6" align="center">
            Configuration complete! You can now generate the quote.
          </Typography>
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ConfigurationStepper; 