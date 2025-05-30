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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
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

const emptyConfiguration = {
  brand: '',
  systemType: '',
  systemModel: '',
  operationType: '',
  dimensions: { width: 0, height: 0 },
  glassType: '',
  finish: { type: '', color: '' }
};

const ConfigurationStepper = ({ metadata }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentConfiguration, setCurrentConfiguration] = useState(emptyConfiguration);
  const [quoteItems, setQuoteItems] = useState([]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (step) => {
    if (step <= getLastCompletedStep() + 1) {
      setActiveStep(step);
    }
  };

  const handleConfigurationUpdate = (update) => {
    setCurrentConfiguration((prev) => ({ ...prev, ...update }));
  };

  const handleAddToQuote = () => {
    setQuoteItems(prev => [...prev, { ...currentConfiguration, id: Date.now() }]);
    setCurrentConfiguration(emptyConfiguration);
  };

  const handleRemoveFromQuote = (itemId) => {
    setQuoteItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleEditItem = (item) => {
    setCurrentConfiguration(item);
    setQuoteItems(prev => prev.filter(i => i.id !== item.id));
    setActiveStep(0);
  };

  const getLastCompletedStep = () => {
    if (!currentConfiguration.brand) return -1;
    if (!currentConfiguration.systemType) return 0;
    if (!currentConfiguration.systemModel || !currentConfiguration.dimensions.width || !currentConfiguration.dimensions.height) return 1;
    if (!currentConfiguration.glassType) return 2;
    return 3;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BrandSelection 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          brands={metadata?.systemHierarchy ? Object.keys(metadata.systemHierarchy) : []}
        />;
      case 1:
        return <SystemTypeSelection 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          systemTypes={metadata?.systemTypes || []}
        />;
      case 2:
        return <SystemConfigurationForm 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          metadata={metadata}
        />;
      case 3:
        return <GlassOptions 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
        />;
      case 4:
        return <PricingSummary 
          configuration={currentConfiguration}
          quoteItems={quoteItems}
          onAddToQuote={handleAddToQuote}
          onStartNew={() => {
            setCurrentConfiguration(emptyConfiguration);
            setActiveStep(0);
          }}
          onEditItem={handleEditItem}
          onRemoveItem={handleRemoveFromQuote}
        />;
      default:
        return 'Unknown step';
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return !!currentConfiguration.brand;
      case 1:
        return !!currentConfiguration.systemType;
      case 2:
        return !!currentConfiguration.systemModel && 
               currentConfiguration.dimensions.width > 0 && 
               currentConfiguration.dimensions.height > 0;
      case 3:
        return !!currentConfiguration.glassType;
      default:
        return true;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mt: 3 }}>
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
            variant={activeStep === steps.length - 1 ? "contained" : "text"}
            sx={{ mr: 1 }}
          >
            {activeStep === steps.length - 1 ? 'Review & Price' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfigurationStepper; 