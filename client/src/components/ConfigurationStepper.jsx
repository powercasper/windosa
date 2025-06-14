import React, { useState, useEffect } from 'react';
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
import ClientInformation from './steps/ClientInformation';
import BrandSelection from './steps/BrandSelection';
import SystemTypeSelection from './steps/SystemTypeSelection';
import SystemConfigurationForm from './steps/SystemConfigurationForm';
import GlassOptions from './steps/GlassOptions';
import PricingSummary from './steps/PricingSummary';

const steps = [
  'Client Information',
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
  finish: { type: '', color: '' },
  doorType: 'glass',
  grid: { enabled: true, horizontal: 2, vertical: 3 },
  location: '',
  itemNumber: 0,
  quantity: 1
};

const emptyClientInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  isCompany: false,
  companyName: '',
  jobTitle: '',
  projectName: '',
  projectType: '',
  preferredContactMethod: 'email',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  },
  notes: ''
};

const ConfigurationStepper = ({ 
  metadata, 
  onLoadSavedQuote, 
  onQuoteSaved,
  isEditingQuote, 
  loadedQuote 
}) => {
  const [activeStep, setActiveStep] = useState(isEditingQuote ? 5 : 0);
  const [currentConfiguration, setCurrentConfiguration] = useState(emptyConfiguration);
  const [clientInfo, setClientInfo] = useState(loadedQuote?.clientInfo || emptyClientInfo);
  const [quoteItems, setQuoteItems] = useState(loadedQuote ? loadedQuote.items : []);
  const [currentQuote, setCurrentQuote] = useState(loadedQuote);
  const [isEditingItem, setIsEditingItem] = useState(false);

  // Effect to handle quote loading
  useEffect(() => {
    if (loadedQuote) {
      setQuoteItems(loadedQuote.items);
      setCurrentQuote(loadedQuote);
      setClientInfo(loadedQuote.clientInfo || emptyClientInfo);
      setActiveStep(5);
    }
  }, [loadedQuote]);

  const handleClientInfoUpdate = (update) => {
    setClientInfo(prev => ({
      ...prev,
      ...update,
      address: {
        ...prev.address,
        ...update.address
      }
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (step) => {
    // When editing a quote (not an item), only allow moving to the Quote Summary step
    if (currentQuote && !isEditingItem && step !== 5) {
      return;
    }
    // When editing an item, allow free navigation through steps (except step 0 which is client info)
    if (isEditingItem && step === 0) {
      return; // Don't allow editing client info when editing an item
    }
    // When editing an item, allow free navigation through steps
    if (isEditingItem || step <= getLastCompletedStep() + 1) {
      setActiveStep(step);
    }
  };

  const handleConfigurationUpdate = (update) => {
    setCurrentConfiguration((prev) => {
      // Only remove grid configuration when explicitly switching to panel door type
      if (update.doorType === 'panel') {
        return { ...prev, ...update, grid: undefined };
      }
      // When switching to glass door type, initialize grid if it doesn't exist
      if (update.doorType === 'glass') {
        return { 
          ...prev, 
          ...update, 
          grid: update.grid || { enabled: true, horizontal: 2, vertical: 3 }
        };
      }
      // For all other updates, preserve existing configuration including grid
      return { ...prev, ...update };
    });
  };

  const handleEditItem = (item) => {
    // Create a deep copy of the item to preserve nested objects
    const itemCopy = JSON.parse(JSON.stringify(item));
    // Store the original index of the item
    const itemIndex = quoteItems.findIndex(i => i.id === item.id);
    // Remove grid configuration for sliding doors
    if (itemCopy.systemType === 'Sliding Doors') {
      delete itemCopy.grid;
    }
    // Ensure all properties are preserved, including grid, doorType, and other configurations
    setCurrentConfiguration({
      ...emptyConfiguration, // This provides the structure but will be overwritten
      ...itemCopy, // This preserves all the item's configurations
      _editIndex: itemIndex // Store the original index
    });
    setQuoteItems(prev => prev.filter(i => i.id !== item.id));
    setIsEditingItem(true);
    setActiveStep(1); // Skip client info step when editing items
  };

  const handleAddToQuote = () => {
    // Create a deep copy of the current configuration to preserve nested objects
    const configCopy = JSON.parse(JSON.stringify(currentConfiguration));
    const editIndex = configCopy._editIndex;
    delete configCopy._editIndex; // Remove the temporary index property
    
    // Remove grid configuration for sliding doors
    if (configCopy.systemType === 'Sliding Doors') {
      delete configCopy.grid;
    }
    
    setQuoteItems(prev => {
      if (typeof editIndex === 'number') {
        // If we're editing an existing item, insert it back at its original position
        const newItems = [...prev];
        newItems.splice(editIndex, 0, { ...configCopy, id: Date.now() });
        // Renumber all items after reordering
        return newItems.map((item, index) => ({
          ...item,
          itemNumber: index + 1
        }));
      } else {
        // If it's a new item, add it to the end with the next number
        return [...prev, { ...configCopy, id: Date.now(), itemNumber: prev.length + 1 }];
      }
    });
    setCurrentConfiguration(emptyConfiguration);
    setIsEditingItem(false);
    // Return to quote summary after adding item
    setActiveStep(5);
  };

  const handleAddNewItem = () => {
    // Function to start adding a new item to an existing quote
    setCurrentConfiguration(emptyConfiguration);
    setIsEditingItem(false);
    // If we have a saved quote, skip client info and go to brand selection
    setActiveStep(currentQuote ? 1 : 0);
  };

  const handleRemoveFromQuote = (itemId) => {
    setQuoteItems(quoteItems.filter(item => item.id !== itemId));
  };

  const handleCopyItem = (itemToCopy) => {
    // Generate a new item number (next available number)
    const newItemNumber = Math.max(...quoteItems.map(item => item.itemNumber), 0) + 1;
    
    // Create the new item with a new ID and item number
    const newItem = {
      ...itemToCopy,
      id: Date.now(), // Simple way to generate a unique ID
      itemNumber: newItemNumber
    };
    
    // Add the new item to the quote items
    setQuoteItems([...quoteItems, newItem]);
  };

  const handleUpdateItemQuantity = (itemId, newQuantity) => {
    setQuoteItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleQuoteSaved = (savedQuote) => {
    // Update the current quote state with the saved quote
    if (savedQuote) {
      setCurrentQuote(savedQuote);
    }
    // Keep user on the quote summary page after saving
    // Do NOT reset the state or navigate away
    
    // Only notify parent if needed for other functionality
    if (onQuoteSaved) {
      onQuoteSaved(savedQuote);
    }
  };

  const handleStartNewQuote = () => {
    // Reset everything when starting a new quote
    setCurrentConfiguration(emptyConfiguration);
    setClientInfo(emptyClientInfo);
    setCurrentQuote(null);
    setQuoteItems([]);
    setIsEditingItem(false);
    setActiveStep(0);
    
    // Notify parent to reset any app-level state
    if (onQuoteSaved) {
      onQuoteSaved();
    }
  };

  const getLastCompletedStep = () => {
    // When editing an item, all previous steps are considered complete
    if (isEditingItem) {
      return activeStep;
    }
    
    // If we have a current quote (saved quote), client info is already completed
    const hasClientInfo = currentQuote || (clientInfo.firstName && clientInfo.lastName && clientInfo.email && clientInfo.phone && clientInfo.projectName);
    
    // Normal completion check for new items
    if (!hasClientInfo) return -1;
    if (!currentConfiguration.brand) return 0;
    if (!currentConfiguration.systemType) return 1;
    if (!currentConfiguration.systemModel || !currentConfiguration.dimensions.width || !currentConfiguration.dimensions.height) return 2;
    if (!currentConfiguration.glassType) return 3;
    return 4;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <ClientInformation 
          clientInfo={clientInfo}
          onUpdate={handleClientInfoUpdate}
          onNext={handleNext}
          onBack={handleBack}
        />;
      case 1:
        return <BrandSelection 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          onNext={handleNext}
          brands={metadata?.systemBrands || []}
          isEditing={isEditingItem}
        />;
      case 2:
        return <SystemTypeSelection 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          onNext={handleNext}
          systemTypes={Object.keys(metadata?.systemHierarchy || {})}
          isEditing={isEditingItem}
        />;
      case 3:
        return <SystemConfigurationForm 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          onNext={handleNext}
          metadata={metadata}
          isEditing={isEditingItem}
        />;
      case 4:
        return <GlassOptions 
          configuration={currentConfiguration} 
          onUpdate={handleConfigurationUpdate}
          onNext={handleNext}
          isEditing={isEditingItem}
        />;
      case 5:
        return <PricingSummary 
          configuration={currentConfiguration}
          clientInfo={clientInfo}
          quoteItems={quoteItems}
          onAddToQuote={handleAddToQuote}
          onStartNew={handleStartNewQuote}
          onAddNewItem={handleAddNewItem}
          onEditItem={handleEditItem}
          onRemoveItem={handleRemoveFromQuote}
          onCopyItem={handleCopyItem}
          onQuoteSaved={handleQuoteSaved}
          onUpdateItemQuantity={handleUpdateItemQuantity}
          savedQuote={currentQuote}
        />;
      default:
        return 'Unknown step';
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        // Client info is valid if we have a saved quote OR if all required fields are filled
        return !!(currentQuote || (clientInfo.firstName && clientInfo.lastName && clientInfo.email && clientInfo.phone && clientInfo.projectName));
      case 1:
        return !!currentConfiguration.brand;
      case 2:
        return !!currentConfiguration.systemType;
      case 3:
        return !!currentConfiguration.systemModel && 
               currentConfiguration.dimensions.width > 0 && 
               currentConfiguration.dimensions.height > 0;
      case 4:
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
            // When editing an item, show all previous steps as completed
            const completed = isEditingItem ? 
              index < activeStep : 
              index <= getLastCompletedStep();
            
            return (
              <Step key={label} {...stepProps} completed={completed}>
                <StepButton 
                  onClick={() => handleStepClick(index)}
                  disabled={
                    // When editing a quote (not an item), only allow Quote Summary
                    (currentQuote && !isEditingItem && index !== 5) || 
                    // When editing an item, don't allow client info step
                    (isEditingItem && index === 0) ||
                    // When not editing an item, require step completion
                    (!isEditingItem && index > getLastCompletedStep() + 1)
                  }
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
            disabled={activeStep === 0 || (currentQuote && !isEditingItem && activeStep === 5) || (isEditingItem && activeStep === 1)}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfigurationStepper; 