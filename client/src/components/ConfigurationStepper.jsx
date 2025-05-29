import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Paper,
  StepButton,
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

  const handleStepClick = (step) => {
    // Only allow clicking on completed steps or the next available step
    if (step <= getLastCompletedStep() + 1) {
      setActiveStep(step);
    }
  };

  const handleConfigurationUpdate = (update) => {
    setConfiguration((prev) => ({ ...prev, ...update }));
  };

  // Helper function to determine the last completed step
  const getLastCompletedStep = () => {
    if (!configuration.brand) return -1;
    if (!configuration.systemType) return 0;
    if (!configuration.systemModel || !configuration.dimensions.width || !configuration.dimensions.height) return 1;
    if (!configuration.glassType) return 2;
    return 3;
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
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          const completed = index <= getLastCompletedStep();
          
          return (
            <Step key={label} {...stepProps} completed={completed}>
              <StepButton 
                onClick={() => handleStepClick(index)}
                disabled={index > getLastCompletedStep() + 1}
                optional={
                  index === activeStep ? (
                    <Typography variant="caption" color="primary">
                      {index < steps.length - 1 ? 'Current step' : ''}
                    </Typography>
                  ) : null
                }
              >
                {label}
              </StepButton>
            </Step>
          );
        })}
      </Stepper>
      <Box sx={{ mt: 4, mb: 2 }}>
        {getStepContent(activeStep)}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          onClick={handleNext}
          disabled={!isStepValid(activeStep)}
          sx={{ mr: 1 }}
        >
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default ConfigurationStepper; 