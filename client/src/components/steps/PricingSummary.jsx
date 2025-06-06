import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  Grid,
  Chip,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CommentIcon from '@mui/icons-material/Comment';
import { unitCostPerSqft, laborRates } from '../../utils/metadata';
import { generateQuote, generatePDF } from '../../api/config';
import { formatCurrency, saveQuote } from '../../utils/helpers';
import ConfigurationPreviewUI from '../ConfigurationPreviewUI';

const STORAGE_KEY = 'orderAdditionalCosts';

const getStoredCosts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading stored costs:', error);
  }
  return null;
};

const calculateItemPrice = (item) => {
  let totalSystemCost = 0;
  let totalGlassCost = 0;
  let totalLaborCost = 0;
  let totalArea = 0;

  // Glass rates remain the same per sq ft regardless of operation type
  const glassRates = {
    'Double Pane': 12.5,
    'Triple Pane': 18.75,
    'Security Glass': 22,
    'Acoustic Glass': 25
  };
  const glassUnitCost = glassRates[item.glassType] || glassRates['Double Pane'];

  if (item.systemType === 'Entrance Doors') {
    // Calculate door panel area and cost
    const doorHeight = item.dimensions.height;
    const doorWidth = item.dimensions.width;
    const doorArea = (doorWidth * doorHeight) / 144; // Convert to sq ft
    const doorUnitCost = unitCostPerSqft[item.brand][item.systemModel][item.openingType];
    
    totalSystemCost += doorArea * doorUnitCost;
    totalGlassCost += doorArea * glassUnitCost;
    totalArea += doorArea;

    // Calculate fixed glass areas (sidelights and transom)
    const fixedUnitCost = unitCostPerSqft[item.brand][item.systemModel]['Fixed'];

    // Sidelights
    if (item.leftSidelight?.enabled) {
      const sidelightArea = (item.leftSidelight.width * doorHeight) / 144;
      totalSystemCost += sidelightArea * fixedUnitCost;
      totalGlassCost += sidelightArea * glassUnitCost;
      totalArea += sidelightArea;
    }
    if (item.rightSidelight?.enabled) {
      const sidelightArea = (item.rightSidelight.width * doorHeight) / 144;
      totalSystemCost += sidelightArea * fixedUnitCost;
      totalGlassCost += sidelightArea * glassUnitCost;
      totalArea += sidelightArea;
    }

    // Transom
    if (item.transom?.enabled) {
      const transomWidth = (item.leftSidelight?.enabled ? item.leftSidelight.width : 0) +
                          doorWidth +
                          (item.rightSidelight?.enabled ? item.rightSidelight.width : 0);
      const transomArea = (transomWidth * item.transom.height) / 144;
      totalSystemCost += transomArea * fixedUnitCost;
      totalGlassCost += transomArea * glassUnitCost;
      totalArea += transomArea;
    }

    // Calculate labor cost
    const laborRate = item.openingType === 'Pivot Door' ? 
      laborRates['Pivot'] : 
      laborRates['Hinged Left Open In']; // Use standard hinge rate for regular doors
    totalLaborCost = laborRate * totalArea;
  } else if (item.systemType === 'Windows' && item.panels) {
  // Calculate costs for each panel if it's a window with multiple panels
    item.panels.forEach(panel => {
      const panelArea = (panel.width * item.dimensions.height) / 144;
      totalArea += panelArea;

      const systemUnitCost = unitCostPerSqft[item.brand][item.systemModel][panel.operationType];
      totalSystemCost += systemUnitCost * panelArea;
      
      // Add mosquito net cost if the panel is operational and has a net
      if (panel.operationType !== 'Fixed' && panel.hasMosquitoNet) {
        totalSystemCost += 100; // $100 per mosquito net
      }

      totalGlassCost += glassUnitCost * panelArea;
      
      const laborRate = laborRates[panel.operationType];
      totalLaborCost += laborRate * panelArea;
    });
  } else if (item.systemType === 'Sliding Doors') {
    // For sliding doors, we use the typology-based pricing
    const area = (item.dimensions.width * item.dimensions.height) / 144;
    totalArea = area;
    
    const costs = unitCostPerSqft[item.brand][item.systemModel];
    const systemUnitCost = costs[item.operationType];
    
    if (!systemUnitCost) {
      console.warn('No direct cost found for configuration:', item.operationType);
      // Determine fallback cost based on panel composition
      const numFixed = (item.operationType.match(/O/g) || []).length;
      const numSliding = (item.operationType.match(/X/g) || []).length;
      const totalPanels = numFixed + numSliding;

      if (totalPanels === 5) {
        if (numFixed === 1) {
          systemUnitCost = costs['OXXXX'] || 33.9;
        } else if (numFixed === 2) {
          systemUnitCost = item.operationType.includes('OO') ? 
            (costs['OOXXX'] || 33.2) : 
            (costs['OXXXO'] || 33.5);
        } else {
          systemUnitCost = costs['OXXXX'] || 33.9;
        }
      } else if (totalPanels === 6) {
        if (numFixed === 0) {
          systemUnitCost = costs['XXXXXX'] || 35.5;
        } else if (numFixed === 2) {
          systemUnitCost = costs['OXXXXO'] || 34.32;
        } else if (numFixed === 4) {
          systemUnitCost = costs['OOXXOO'] || 33.8;
        } else {
          systemUnitCost = costs['OXXXXO'] || 34.32;
        }
      } else {
        systemUnitCost = costs['OXXO'] || 31.16; // Default fallback
      }
    }

    totalSystemCost = systemUnitCost * area;
    totalGlassCost = glassUnitCost * area;

    // Calculate labor based on number of panels
    const numPanels = item.operationType.length;
    const numFixed = (item.operationType.match(/O/g) || []).length;
    const numSliding = (item.operationType.match(/X/g) || []).length;
    
    const fixedLaborRate = laborRates['Sliding Fixed'];
    const slidingLaborRate = laborRates['Sliding →'];
    const avgLaborRate = ((numFixed * fixedLaborRate) + (numSliding * slidingLaborRate)) / numPanels;
    totalLaborCost = avgLaborRate * area;
  }

  return {
    systemCost: totalSystemCost,
    glassCost: totalGlassCost,
    laborCost: totalLaborCost,
    total: totalSystemCost + totalGlassCost + totalLaborCost,
    area: totalArea
  };
};

const calculateBaseCost = (configuration) => {
  if (!configuration.systemModel) return 0;

  if (configuration.systemType === 'Windows') {
    const totalWidth = configuration.panels.reduce((sum, panel) => sum + panel.width, 0);
    const area = (totalWidth * configuration.dimensions.height) / 144; // Convert to square feet
    let cost = area * unitCostPerSqft[configuration.systemModel];

    // Add mosquito net cost if enabled
    if (configuration.hasMosquitoNet) {
      const operationalPanels = configuration.panels.filter(panel => panel.operationType !== 'Fixed').length;
      cost += operationalPanels * 100; // $100 per operational window
    }

    return cost;
  } else if (configuration.systemType === 'Sliding Doors') {
    // ... existing sliding doors calculation ...
  } else if (configuration.systemType === 'Entrance Doors') {
    // ... existing entrance doors calculation ...
  }
  return 0;
};

const PricingSummary = ({ 
  configuration, 
  quoteItems = [], 
  onAddToQuote, 
  onStartNew,
  onEditItem,
  onRemoveItem,
  onQuoteSaved,
  savedQuote = null
}) => {
  const [pricing, setPricing] = useState({
    items: [],
    totalSystemCost: 0,
    totalGlassCost: 0,
    totalLaborCost: 0,
    grandTotal: 0
  });
  const [quoteDialog, setQuoteDialog] = useState({
    open: false,
    loading: false,
    error: null,
    quote: null
  });
  const [showAddSuccess, setShowAddSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Initialize costs from storage or defaults
  const storedCosts = getStoredCosts();
  const [tariff, setTariff] = useState(storedCosts?.tariff || savedQuote?.tariff || '0');
  const [margin, setMargin] = useState(storedCosts?.margin || savedQuote?.margin || '30');
  const [shipping, setShipping] = useState(storedCosts?.shipping || savedQuote?.shipping || '0');
  const [delivery, setDelivery] = useState(storedCosts?.delivery || savedQuote?.delivery || '0');
  
  const [totalCost, setTotalCost] = useState(0);
  const [orderTotalPrice, setOrderTotalPrice] = useState(0);

  // Store costs whenever they change
  useEffect(() => {
    const costs = { tariff, margin, shipping, delivery };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(costs));
  }, [tariff, margin, shipping, delivery]);

  const handleNumericInput = (value, type) => {
    // Allow only numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }

    // Update the appropriate state based on type
    switch(type) {
      case 'tariff':
        setTariff(numericValue);
        break;
      case 'margin':
        setMargin(numericValue);
        break;
      case 'shipping':
        setShipping(numericValue);
        break;
      case 'delivery':
        setDelivery(numericValue);
        break;
    }
  };

  const formatPrice = (value) => {
    return (value || 0).toFixed(2);
  };

  // Calculate total items cost from all items in the quote
  const calculateTotalItemsCost = () => {
    return pricing.items.reduce((sum, item) => sum + item.total, 0);
  };

  useEffect(() => {
    const calculatePricing = () => {
      try {
        // Get total items cost from the items array
        const itemsCost = calculateTotalItemsCost();
        
        // Parse all input values as floats, defaulting to 0 if invalid
        const tariffValue = parseFloat(tariff) || 0;
        const marginValue = parseFloat(margin) || 0;
        const shippingValue = parseFloat(shipping) || 0;
        const deliveryValue = parseFloat(delivery) || 0;
        
        // Calculate total cost (before margin)
        const cost = itemsCost + tariffValue + shippingValue + deliveryValue;
        
        // Calculate Order Total Price with margin
        const marginDecimal = marginValue / 100;
        const orderTotal = marginDecimal === 1 ? cost : cost / (1 - marginDecimal);

        setTotalCost(cost);
        setOrderTotalPrice(orderTotal);
      } catch (error) {
        console.error('Error calculating pricing:', error);
        setTotalCost(0);
        setOrderTotalPrice(0);
      }
    };

    calculatePricing();
  }, [pricing.items, tariff, margin, shipping, delivery]);

  useEffect(() => {
    // Only calculate pricing for items in the quote
    const calculatedPricing = quoteItems.map(item => ({
      item,
      ...calculateItemPrice(item)
    }));

    const totals = calculatedPricing.reduce((acc, curr) => ({
      totalSystemCost: acc.totalSystemCost + curr.systemCost,
      totalGlassCost: acc.totalGlassCost + curr.glassCost,
      totalLaborCost: acc.totalLaborCost + curr.laborCost,
      grandTotal: acc.grandTotal + curr.total
    }), {
      totalSystemCost: 0,
      totalGlassCost: 0,
      totalLaborCost: 0,
      grandTotal: 0
    });

    setPricing({
      items: calculatedPricing,
      ...totals
    });
  }, [quoteItems]); // Only depend on quoteItems, not configuration

  // Calculate current item price separately
  const currentItemPrice = configuration.systemModel ? calculateItemPrice(configuration) : null;

  const handleGenerateQuote = async () => {
    setQuoteDialog({
      ...quoteDialog,
      open: true,
      loading: true,
      error: null
    });

    try {
      const quote = await generateQuote({
        items: quoteItems,
        totalAmount: pricing.grandTotal
      });
      setQuoteDialog({
        open: true,
        loading: false,
        error: null,
        quote: {
          ...quote,
          totalAmount: pricing.grandTotal
        }
      });
    } catch (error) {
      setQuoteDialog({
        ...quoteDialog,
        loading: false,
        error: error.message || 'Failed to generate quote'
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const quoteData = {
        ...quoteDialog.quote,
        projectName: quoteDialog.quote.projectName || 'Untitled Project',
        customerName: quoteDialog.quote.customerName || 'Customer',
        date: quoteDialog.quote.date || new Date(),
        salesRep: quoteDialog.quote.salesRep || '',
        salesRepPhone: quoteDialog.quote.salesRepPhone || '',
        salesRepEmail: quoteDialog.quote.salesRepEmail || '',
        totalAmount: pricing.grandTotal,
      };

      // Import the generateQuotePDF function
      const { generateQuotePDF } = await import('../../utils/pdfGenerator');
      await generateQuotePDF(quoteData, quoteItems);
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setQuoteDialog(prev => ({
        ...prev,
        error: 'Failed to download PDF. Please try again.'
      }));
      setIsGeneratingPDF(false);
    }
  };

  const handleAddToQuote = () => {
    onAddToQuote();
    setShowAddSuccess(true);
    setTimeout(() => {
      setShowAddSuccess(false);
    }, 3000);
  };

  const handleSaveQuote = () => {
    try {
      const quoteToSave = {
        ...quoteDialog.quote,
        items: quoteItems,
        totalAmount: pricing.grandTotal,
        id: savedQuote?.id, // Preserve the ID if editing an existing quote
        // Include additional costs
        tariff,
        margin,
        shipping,
        delivery
      };
      
      saveQuote(quoteToSave);
      setSaveSuccess(true);
      setQuoteDialog(prev => ({ ...prev, open: false }));
      
      // Notify parent components that the quote was saved
      if (onQuoteSaved) {
        onQuoteSaved(quoteToSave);
      }
    } catch (error) {
      setQuoteDialog(prev => ({
        ...prev,
        error: 'Failed to save quote. Please try again.'
      }));
    }
  };

  const isConfigurationEmpty = !configuration.systemModel;

  if (pricing.items.length === 0 && isConfigurationEmpty) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Quote Summary
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography color="text.secondary" align="center">
            Your quote is empty. Add items by configuring windows or doors in the previous steps.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => onStartNew()}
              startIcon={<AddIcon />}
            >
              Add New Item
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {savedQuote ? `Edit Quote #${savedQuote.id}` : 'Quote Summary'}
      </Typography>

      {!isConfigurationEmpty && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Current Item
            </Typography>
            <Typography variant="h6" color="primary">
              {currentItemPrice ? formatCurrency(currentItemPrice.total) : '-'}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column - Configuration Details */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Configuration Details
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                      Brand:
                    </Typography>
                  <Typography variant="body2">
                    {configuration.brand} - {configuration.systemModel}
                  </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                      Type:
                  </Typography>
                  <Typography variant="body2">
                      {configuration.systemType}
                  </Typography>
                  </Box>
                  {configuration.systemType === 'Windows' && configuration.panels ? (
                    configuration.panels.map((panel, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Panel {idx + 1}:
                      </Typography>
                        <Typography variant="body2">
                          {panel.operationType} ({panel.width}")
                          {panel.operationType !== 'Fixed' && configuration.hasMosquitoNet && ' + Mosquito Net'}
                          </Typography>
                    </Box>
                    ))
                  ) : configuration.systemType === 'Sliding Doors' && configuration.panels ? (
                    configuration.panels.map((panel, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Panel {idx + 1}:
                      </Typography>
                        <Typography variant="body2">
                          {panel.type} {panel.type === 'Sliding' ? `(${panel.direction === 'left' ? '←' : '→'})` : ''}
                                </Typography>
                      </Box>
                    ))
                  ) : configuration.systemType === 'Entrance Doors' ? (
                    <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                      {/* Left Sidelight */}
                      {configuration.leftSidelight?.enabled && (
                        <Paper
                          sx={{
                            p: 0.5,
                            width: `${(configuration.leftSidelight.width / ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                              configuration.dimensions.width + 
                              (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))) * 100}%`,
                            bgcolor: 'grey.100',
                            color: 'text.primary',
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'grey.300',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 0
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                            Left ({configuration.leftSidelight.width}")
                          </Typography>
                        </Paper>
                      )}

                      {/* Door Panels */}
                      {configuration.openingType === 'Double Door' && (
                        <Box sx={{ display: 'flex', gap: 0, flex: 1 }}>
                          {/* Left Door Panel */}
                          <Paper
                            sx={{
                              p: 1,
                              flex: 1,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderRight: '2px solid',
                              borderRightColor: 'grey.400',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: '60px'
                            }}
                          >
                            {/* Grid Lines for Glass Doors */}
                            {configuration.doorType === 'glass' && configuration.grid?.enabled && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none'
                              }}>
                                {/* Vertical Grid Lines */}
                                {Array.from({ length: configuration.grid.horizontal - 1 }).map((_, i) => {
                                  const doorWidth = configuration.dimensions.width / 2;
                                  const gridProfileWidth = (1 / doorWidth) * 100;
                                  const position = ((i + 1) * 100) / configuration.grid.horizontal;
                                  return (
                                    <Box
                                      key={`v-${i}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: `calc(${position}% - ${gridProfileWidth / 2}%)`,
                                        width: `${gridProfileWidth}%`,
                                        bgcolor: 'grey.300',
                                        boxShadow: '0 0 1px rgba(0,0,0,0.3)'
                                      }}
                                    />
                                  );
                                })}
                                {/* Horizontal Grid Lines */}
                                {Array.from({ length: configuration.grid.vertical - 1 }).map((_, i) => {
                                  const totalHeight = configuration.dimensions.height;
                                  const gridProfileHeight = (1 / totalHeight) * 100;
                                  const position = ((i + 1) * 100) / configuration.grid.vertical;
                                  return (
                                    <Box
                                      key={`h-${i}`}
                                      sx={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: `calc(${position}% - ${gridProfileHeight / 2}%)`,
                                        height: `${gridProfileHeight}%`,
                                        bgcolor: 'grey.300',
                                        boxShadow: '0 0 1px rgba(0,0,0,0.3)'
                                      }}
                                    />
                                  );
                                })}
                              </Box>
                            )}
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                              Left Panel
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                              {(configuration.dimensions?.width || 0) / 2}"
                            </Typography>
                            {/* Right Handle for Left Door */}
                            <Box
                              sx={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '3px',
                                height: '12px',
                                bgcolor: 'primary.dark',
                                borderRadius: '2px',
                                mr: 0.5,
                                zIndex: 2
                              }}
                            />
                          </Paper>

                          {/* Right Door Panel */}
                          <Paper
                            sx={{
                              p: 1,
                              flex: 1,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: 'primary.main',
                              borderLeft: '2px solid',
                              borderLeftColor: 'grey.400',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: '60px'
                            }}
                          >
                            {/* Grid Lines for Glass Doors */}
                            {configuration.doorType === 'glass' && configuration.grid?.enabled && (
                              <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none'
                              }}>
                                {/* Vertical Grid Lines */}
                                {Array.from({ length: configuration.grid.horizontal - 1 }).map((_, i) => {
                                  const doorWidth = configuration.dimensions.width / 2;
                                  const gridProfileWidth = (1 / doorWidth) * 100;
                                  const position = ((i + 1) * 100) / configuration.grid.horizontal;
                                  return (
                                    <Box
                                      key={`v-${i}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: `calc(${position}% - ${gridProfileWidth / 2}%)`,
                                        width: `${gridProfileWidth}%`,
                                        bgcolor: 'grey.300',
                                        boxShadow: '0 0 1px rgba(0,0,0,0.3)'
                                      }}
                                    />
                                  );
                                })}
                                {/* Horizontal Grid Lines */}
                                {Array.from({ length: configuration.grid.vertical - 1 }).map((_, i) => {
                                  const totalHeight = configuration.dimensions.height;
                                  const gridProfileHeight = (1 / totalHeight) * 100;
                                  const position = ((i + 1) * 100) / configuration.grid.vertical;
                                  return (
                                    <Box
                                      key={`h-${i}`}
                                      sx={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: `calc(${position}% - ${gridProfileHeight / 2}%)`,
                                        height: `${gridProfileHeight}%`,
                                        bgcolor: 'grey.300',
                                        boxShadow: '0 0 1px rgba(0,0,0,0.3)'
                                      }}
                                    />
                                  );
                                })}
                              </Box>
                            )}
                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                              Right Panel
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                              {(configuration.dimensions?.width || 0) / 2}"
                            </Typography>
                            {/* Left Handle for Right Door */}
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '3px',
                                height: '12px',
                                bgcolor: 'primary.dark',
                                borderRadius: '2px',
                                ml: 0.5,
                                zIndex: 2
                              }}
                            />
                          </Paper>
                        </Box>
                      )}

                      {/* Right Sidelight */}
                      {configuration.rightSidelight?.enabled && (
                        <Paper
                          sx={{
                            p: 0.5,
                            width: `${(configuration.rightSidelight.width / ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                              configuration.dimensions.width + 
                              (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))) * 100}%`,
                            bgcolor: 'grey.100',
                            color: 'text.primary',
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'grey.300',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 0
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                            Right ({configuration.rightSidelight.width}")
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  ) : null}
                      </Stack>
              </Box>
            </Grid>

            {/* Middle Column - Visual Configuration */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Configuration Preview
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Scaled Preview (Not Actual Size)
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1,
                border: '2px solid',
                borderColor: 'grey.300',
                borderRadius: 1,
                p: 1,
                bgcolor: 'background.paper',
                maxHeight: '200px'
              }}>
                <ConfigurationPreviewUI configuration={configuration} />
              </Box>
            </Grid>

            {/* Right Column - Dimensions Summary */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    System Dimensions
                </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="body2" color="text.secondary">Total Width:</Typography>
                      <Typography variant="body2">
                        {configuration.systemType === 'Windows' ?
                          configuration.panels.reduce((sum, panel) => sum + panel.width, 0) :
                          configuration.systemType === 'Sliding Doors' ?
                            configuration.dimensions?.width :
                            ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                             configuration.dimensions.width +
                             (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0))}"
                    </Typography>
              </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="body2" color="text.secondary">Total Height:</Typography>
                      <Typography variant="body2">
                        {configuration.dimensions?.height +
                         (configuration.systemType === 'Entrance Doors' && configuration.transom?.enabled ? 
                           configuration.transom.height : 0)}"
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                  <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Area Calculations
                    </Typography>
                  <Stack spacing={1}>
                    {configuration.systemType === 'Entrance Doors' && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <Typography variant="body2" color="text.secondary">Door Area:</Typography>
                          <Typography variant="body2">
                            {((configuration.dimensions?.width * configuration.dimensions?.height) / 144).toFixed(1)} sq ft
                              </Typography>
                        </Box>
                          {(configuration.leftSidelight?.enabled || configuration.rightSidelight?.enabled || configuration.transom?.enabled) && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <Typography variant="body2" color="text.secondary">Glass Area:</Typography>
                            <Typography variant="body2">
                              {(
                                ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) * 
                                 configuration.dimensions.height +
                                 (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0) * 
                                 configuration.dimensions.height +
                                ((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                                 configuration.dimensions.width +
                                 (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0)) * 
                                 (configuration.transom?.enabled ? configuration.transom.height : 0)
                                    ) / 144
                              ).toFixed(1)} sq ft
                                </Typography>
                          </Box>
                        )}
                      </>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'baseline',
                      pt: configuration.systemType === 'Entrance Doors' ? 1 : 0,
                      borderTop: configuration.systemType === 'Entrance Doors' ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="subtitle2" color="primary">Total Area:</Typography>
                            <Typography variant="subtitle2" color="primary">
                        {configuration.systemType === 'Windows' ?
                          ((configuration.panels.reduce((sum, panel) => sum + panel.width, 0) * 
                            configuration.dimensions?.height) / 144).toFixed(1) :
                          configuration.systemType === 'Sliding Doors' ?
                            ((configuration.dimensions?.width * configuration.dimensions?.height) / 144).toFixed(1) :
                            (((configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                              configuration.dimensions.width +
                              (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0)) * 
                             (configuration.dimensions.height + 
                              (configuration.transom?.enabled ? configuration.transom.height : 0)) / 144
                            ).toFixed(1)} sq ft
                            </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
                        </Grid>
                    </Grid>

          {/* Finish Details Card */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2,
              bgcolor: 'background.default',
              mt: 3,
              mb: 2
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Finish Details
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                    <Typography variant="body2">{configuration.finish.type}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Style:</Typography>
                    <Typography variant="body2">{configuration.finish.color}</Typography>
                </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">RAL:</Typography>
                    <Typography variant="body2">{configuration.finish.ralColor}</Typography>
              </Box>
                </Stack>
            </Grid>
              {currentItemPrice && (
            <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Cost Breakdown
                </Typography>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">System:</Typography>
                      <Typography variant="body2">${currentItemPrice.systemCost.toFixed(2)}</Typography>
              </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Glass:</Typography>
                      <Typography variant="body2">${currentItemPrice.glassCost.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Labor:</Typography>
                      <Typography variant="body2">${currentItemPrice.laborCost.toFixed(2)}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Notes if any */}
              {configuration.notes && (
                  <Paper
                    variant="outlined"
                    sx={{
                p: 2,
                bgcolor: 'background.default'
                    }}
                  >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Notes
              </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {configuration.notes}
                    </Typography>
                  </Paper>
              )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddToQuote}
              startIcon={<AddIcon />}
            >
              Add to Quote
            </Button>
          </Box>
        </Paper>
      )}

      {pricing.items.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Quote Items
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={onStartNew}
              startIcon={<AddIcon />}
              size="small"
            >
              Add Another Item
            </Button>
          </Box>
          <List>
            {pricing.items.map(({ item, systemCost, glassCost, laborCost, total }, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 2,
                    py: 3
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WindowIcon color="primary" />
                        Item {item.itemNumber} - {item.brand} {item.systemModel}
                      </Typography>
                      {item.location && (
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Location: {item.location}
                        </Typography>
                      )}
                      <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>
                        ${total.toFixed(2)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton edge="end" aria-label="edit" onClick={() => onEditItem(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => onRemoveItem(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Grid container spacing={2}>
                    {/* Left Column - Configuration Details */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Configuration Details
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                              Type:
                            </Typography>
                            <Typography variant="body2">
                              {item.systemType}
                            </Typography>
                          </Box>
                          {item.systemType === 'Windows' && (
                            <>
                              {item.grid?.enabled && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                    Grid:
                                  </Typography>
                                  <Typography variant="body2">
                                    {item.grid.horizontal}H × {item.grid.vertical}V Divided Lights
                                  </Typography>
                                </Box>
                              )}
                              {item.panels.map((panel, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                    Panel {idx + 1}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {panel.operationType} ({panel.width}")
                                    {panel.operationType !== 'Fixed' && item.hasMosquitoNet && ' + Mosquito Net'}
                                  </Typography>
                                </Box>
                              ))}
                            </>
                          )}
                          {item.systemType === 'Sliding Doors' && (
                            <>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Configuration:
                                </Typography>
                                <Typography variant="body2">
                                  {item.operationType || 'Custom'}
                                </Typography>
                              </Box>
                              {item.grid?.enabled && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                    Grid:
                                  </Typography>
                                  <Typography variant="body2">
                                    {item.grid.horizontal}H × {item.grid.vertical}V Divided Lights
                                  </Typography>
                                </Box>
                              )}
                              {item.panels?.map((panel, idx) => (
                                <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                    Panel {idx + 1}:
                                  </Typography>
                                  <Typography variant="body2">
                                    {panel.type} {panel.type === 'Sliding' ? `(${panel.direction === 'left' ? '←' : '→'})` : ''}
                                  </Typography>
                                </Box>
                              ))}
                            </>
                          )}
                          {item.systemType === 'Entrance Doors' && (
                            <>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Opening:
                                </Typography>
                                <Typography variant="body2">
                                  {item.openingType}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Swing:
                                </Typography>
                                <Typography variant="body2">
                                  {item.swingDirection}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Handle:
                                </Typography>
                                <Typography variant="body2">
                                  {item.handleType}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Lock:
                                </Typography>
                                <Typography variant="body2">
                                  {item.lockType}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Threshold:
                                </Typography>
                                <Typography variant="body2">
                                  {item.threshold}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                  Hinge:
                                </Typography>
                                <Typography variant="body2">
                                  {item.hingeType}
                                </Typography>
                              </Box>
                              {item.grid?.enabled && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                                    Grid:
                                  </Typography>
                                  <Typography variant="body2">
                                    {item.grid.horizontal}H × {item.grid.vertical}V Divided Lights
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Middle Column - Visual Configuration */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Configuration Preview
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Scaled Preview (Not Actual Size)
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1,
                        border: '2px solid',
                        borderColor: 'grey.300',
                        borderRadius: 1,
                        p: 1,
                        bgcolor: 'background.paper',
                        maxHeight: '200px'
                      }}>
                        <ConfigurationPreviewUI configuration={item} />
                      </Box>
                    </Grid>

                    {/* Right Column - Dimensions Summary */}
                    <Grid item xs={12} md={4}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            System Dimensions
                          </Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Total Width:</Typography>
                              <Typography variant="body2">
                                {item.systemType === 'Windows' ?
                                  item.panels.reduce((sum, panel) => sum + panel.width, 0) :
                                  item.systemType === 'Sliding Doors' ?
                                    item.dimensions?.width :
                                    ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                     item.dimensions.width +
                                     (item.rightSidelight?.enabled ? item.rightSidelight.width : 0))}"
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Total Height:</Typography>
                              <Typography variant="body2">
                                {item.dimensions?.height +
                                 (item.systemType === 'Entrance Doors' && item.transom?.enabled ? 
                                   item.transom.height : 0)}"
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Area Calculations
                          </Typography>
                          <Stack spacing={1}>
                            {item.systemType === 'Entrance Doors' && (
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <Typography variant="body2" color="text.secondary">Door Area:</Typography>
                                  <Typography variant="body2">
                                    {((item.dimensions?.width * item.dimensions?.height) / 144).toFixed(1)} sq ft
                                  </Typography>
                                </Box>
                                {(item.leftSidelight?.enabled || item.rightSidelight?.enabled || item.transom?.enabled) && (
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography variant="body2" color="text.secondary">Glass Area:</Typography>
                                    <Typography variant="body2">
                                      {(
                                        ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) * 
                                         item.dimensions.height +
                                         (item.rightSidelight?.enabled ? item.rightSidelight.width : 0) * 
                                         item.dimensions.height +
                                        ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                         item.dimensions.width +
                                         (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                                         (item.transom?.enabled ? item.transom.height : 0)
                                            ) / 144
                                      ).toFixed(1)} sq ft
                                    </Typography>
                                  </Box>
                                )}
                              </>
                            )}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'baseline',
                              pt: item.systemType === 'Entrance Doors' ? 1 : 0,
                              borderTop: item.systemType === 'Entrance Doors' ? '1px solid' : 'none',
                              borderColor: 'divider'
                            }}>
                              <Typography variant="subtitle2" color="primary">Total Area:</Typography>
                              <Typography variant="subtitle2" color="primary">
                                {item.systemType === 'Windows' ?
                                  ((item.panels.reduce((sum, panel) => sum + panel.width, 0) * 
                                    item.dimensions?.height) / 144).toFixed(1) :
                                  item.systemType === 'Sliding Doors' ?
                                    ((item.dimensions?.width * item.dimensions?.height) / 144).toFixed(1) :
                                    (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                      item.dimensions.width +
                                      (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                                     (item.dimensions.height + 
                                      (item.transom?.enabled ? item.transom.height : 0)) / 144
                                    ).toFixed(1)} sq ft
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  {/* Finish Details Card */}
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      bgcolor: 'background.default',
                      mb: 2
                    }}
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Finish Details
                        </Typography>
                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Type:</Typography>
                            <Typography variant="body2">{item.finish.type}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Style:</Typography>
                            <Typography variant="body2">{item.finish.color}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">RAL:</Typography>
                            <Typography variant="body2">{item.finish.ralColor}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Cost Breakdown
                        </Typography>
                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">System:</Typography>
                            <Typography variant="body2">${systemCost.toFixed(2)}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Glass:</Typography>
                            <Typography variant="body2">${glassCost.toFixed(2)}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">Labor:</Typography>
                            <Typography variant="body2">${laborCost.toFixed(2)}</Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Notes if any */}
                  {item.notes && (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        bgcolor: 'background.default'
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.notes}
                      </Typography>
                    </Paper>
                  )}
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cost Breakdown
              </Typography>
              <Typography>System Cost: ${pricing.totalSystemCost.toFixed(2)}</Typography>
              <Typography>Glass Cost: ${pricing.totalGlassCost.toFixed(2)}</Typography>
              <Typography>Labor Cost: ${pricing.totalLaborCost.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { sm: 'flex-end' } }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Total: ${pricing.grandTotal.toFixed(2)}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onStartNew}
                  startIcon={<AddIcon />}
                >
                  Add Another Item
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerateQuote}
                >
                  Generate Quote
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {showAddSuccess && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Item added to quote successfully!
        </Alert>
      )}

      <Dialog
        open={quoteDialog.open}
        onClose={() => setQuoteDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {savedQuote ? 'Update Quote' : 'Save Quote'}
        </DialogTitle>
        <DialogContent>
          {quoteDialog.loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
          {quoteDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {quoteDialog.error}
            </Alert>
          )}
          {quoteDialog.quote ? (
            <>
              <Typography variant="body1" paragraph>
                Quote Number: {savedQuote?.id || quoteDialog.quote.quoteNumber}
              </Typography>
              <Typography variant="body1" paragraph>
                Total Amount: {formatCurrency(pricing.grandTotal)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {savedQuote ? 
                  'Click Save Quote to update this quote with the current items and pricing.' :
                  'Click Save Quote to save this quote for later reference.'}
              </Typography>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          {!quoteDialog.loading && !quoteDialog.error && quoteDialog.quote && (
            <>
              <Button onClick={handleSaveQuote} color="primary" variant="contained">
                {savedQuote ? 'Update Quote' : 'Save Quote'}
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                color="primary"
                disabled={isGeneratingPDF}
                startIcon={isGeneratingPDF ? <CircularProgress size={20} /> : null}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            </>
          )}
          <Button onClick={() => setQuoteDialog(prev => ({ ...prev, open: false }))} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
        message={savedQuote ? "Quote updated successfully" : "Quote saved successfully"}
      />

      <Snackbar
        open={showAddSuccess}
        autoHideDuration={3000}
        onClose={() => setShowAddSuccess(false)}
        message="Item added to quote successfully"
      />

      <Stack spacing={2}>
        {/* Cost Adjustment Fields */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                required
                fullWidth
                label="Tariff (USD)"
                value={tariff}
                onChange={(e) => handleNumericInput(e.target.value, 'tariff')}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Total Value (Aluminum Tariff, Glass, Rubber Gaskets)"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                required
                fullWidth
                label="Margin"
                value={margin}
                onChange={(e) => handleNumericInput(e.target.value, 'margin')}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                helperText="Profit Margin Percentage"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                required
                fullWidth
                label="Shipping"
                value={shipping}
                onChange={(e) => handleNumericInput(e.target.value, 'shipping')}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Factory to Warehouse + Unloading"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                required
                fullWidth
                label="Delivery"
                value={delivery}
                onChange={(e) => handleNumericInput(e.target.value, 'delivery')}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Warehouse to Job Site"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Cost Breakdown Section */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom>
            Cost Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Items Cost: ${formatPrice(calculateTotalItemsCost())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tariff: ${formatPrice(parseFloat(tariff))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shipping: ${formatPrice(parseFloat(shipping))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delivery: ${formatPrice(parseFloat(delivery))}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'bold' }}>
                Total Cost: ${formatPrice(totalCost)}
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                Order Total Price (Including {margin}% Margin): ${formatPrice(orderTotalPrice)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
};

export default PricingSummary; 