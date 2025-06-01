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
  Snackbar
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
      const response = await generatePDF(quoteDialog.quote);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quoteDialog.quote.quoteNumber}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setQuoteDialog(prev => ({
        ...prev,
        error: 'Failed to download PDF. Please try again.'
      }));
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
        id: savedQuote?.id // Preserve the ID if editing an existing quote
      };
      
      saveQuote(quoteToSave);
      setSaveSuccess(true);
      setQuoteDialog(prev => ({ ...prev, open: false }));
      
      // Notify parent components that the quote was saved
      if (onQuoteSaved) {
        onQuoteSaved();
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
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  System Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    {configuration.brand} - {configuration.systemModel}
                  </Typography>
                  <Typography variant="body2">
                    Type: {configuration.systemType}
                  </Typography>
                  {configuration.systemType === 'Windows' && configuration.panels ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Panes:
                      </Typography>
                      <Stack spacing={1} sx={{ pl: 2 }}>
                        {configuration.panels.map((panel, idx) => (
                          <Typography key={idx} variant="body2">
                            Pane {idx + 1}: {panel.width}" wide - {panel.operationType}
                            {panel.operationType !== 'Fixed' && configuration.hasMosquitoNet && ' (with mosquito net)'}
                          </Typography>
                        ))}
                      </Stack>
                      {configuration.hasMosquitoNet && (
                        <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                          Includes standard mosquito nets for all operational windows
                        </Typography>
                      )}
                    </Box>
                  ) : configuration.systemType === 'Sliding Doors' ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Panel Configuration:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
                        {configuration.panels?.map((panel, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 1,
                              flex: 1,
                              bgcolor: panel.type === 'Fixed' ? 'grey.100' : 'primary.light',
                              color: panel.type === 'Fixed' ? 'text.primary' : 'primary.contrastText',
                              textAlign: 'center',
                              border: '1px solid',
                              borderColor: panel.type === 'Fixed' ? 'grey.300' : 'primary.main'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {panel.type}
                              {panel.type === 'Sliding' && (
                                <Typography component="span" variant="caption" sx={{ display: 'block' }}>
                                  {panel.direction === 'left' ? '←' : '→'}
                                </Typography>
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Panel {index + 1}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                      <Stack spacing={0.5} sx={{ pl: 2 }}>
                        {configuration.panels?.map((panel, idx) => (
                          <Typography key={idx} variant="body2" color="text.secondary">
                            Panel {idx + 1}: {panel.type} {panel.type === 'Sliding' ? `(Slides ${panel.direction === 'left' ? 'Left' : 'Right'})` : ''}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ) : configuration.systemType === 'Entrance Doors' ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Door Configuration:
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          Opening Type: {configuration.openingType}
                        </Typography>
                        <Typography variant="body2">
                          Swing Direction: {configuration.swingDirection}
                        </Typography>
                        <Typography variant="body2">
                          Handle Type: {configuration.handleType}
                        </Typography>
                        <Typography variant="body2">
                          Lock Type: {configuration.lockType}
                        </Typography>
                        <Typography variant="body2">
                          Threshold: {configuration.threshold}
                        </Typography>
                        <Typography variant="body2">
                          Hinge Type: {configuration.hingeType}
                        </Typography>
                      </Stack>
                      <Box sx={{ mt: 2 }}>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2,
                            bgcolor: 'background.default',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary">
                            Current Configuration:
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {/* Transom */}
                            {configuration.transom?.enabled && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Paper
                                  sx={{
                                    p: 1,
                                    flex: 1,
                                    bgcolor: 'grey.100',
                                    color: 'text.primary',
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    minHeight: '40px',
                                    display: 'flex',
                                    flexDirection: 'column',
                            alignItems: 'center',
                                    justifyContent: 'center'
                          }}
                        >
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Transom
                                  </Typography>
                                  <Typography variant="caption">
                                    {(configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                     (configuration.dimensions?.width || 0) +
                                     (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)}" × {configuration.transom?.height || 0}"
                                  </Typography>
                                </Paper>
                              </Box>
                            )}

                            {/* Door and Sidelights */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {/* Left Sidelight */}
                              {configuration.leftSidelight?.enabled && (
                                <Paper
                                  sx={{
                                    p: 1,
                                    width: `${(configuration.leftSidelight.width / (configuration.dimensions?.width || 1)) * 100}%`,
                                    bgcolor: 'grey.100',
                                    color: 'text.primary',
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    minHeight: '60px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Left Sidelight
                                  </Typography>
                                  <Typography variant="caption">
                                    {configuration.leftSidelight.width}" × {configuration.dimensions?.height || 0}"
                                  </Typography>
                                </Paper>
                              )}

                              {/* Door Section */}
                              {configuration.openingType === 'Single Door' && (
                                <Paper
                                  sx={{
                                    p: 1,
                                    flex: 1,
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    textAlign: 'center',
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  position: 'relative',
                                    minHeight: '60px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Single Door
                                  </Typography>
                                  <Typography variant="caption">
                                    {configuration.dimensions?.width || 0}" × {configuration.dimensions?.height || 0}"
                                  </Typography>
                                  <Box
                                    sx={{
                                    position: 'absolute',
                                      [configuration.handleLocation || 'right']: 0,
                                    top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '4px',
                                      height: '16px',
                                    bgcolor: 'primary.dark',
                                      borderRadius: '2px',
                                      mr: configuration.handleLocation === 'right' ? 0.5 : 'auto',
                                      ml: configuration.handleLocation === 'left' ? 0.5 : 'auto'
                                    }}
                                  />
                                </Paper>
                              )}

                              {configuration.openingType === 'Double Door' && (
                                <>
                                  <Paper
                                    sx={{
                                      p: 1,
                                      flex: 1,
                                      bgcolor: 'primary.light',
                                      color: 'primary.contrastText',
                                      textAlign: 'center',
                                    border: '1px solid',
                                      borderColor: 'primary.main',
                                      position: 'relative',
                                      minHeight: '60px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      Left Door
                                    </Typography>
                                    <Typography variant="caption">
                                      {(configuration.dimensions?.width || 0) / 2}" × {configuration.dimensions?.height || 0}"
                                    </Typography>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        right: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '4px',
                                        height: '16px',
                                        bgcolor: 'primary.dark',
                                        borderRadius: '2px',
                                        mr: 0.5
                                      }}
                                    />
                                  </Paper>
                                  <Paper
                                    sx={{
                                      p: 1,
                                      flex: 1,
                                      bgcolor: 'primary.light',
                                      color: 'primary.contrastText',
                                      textAlign: 'center',
                                      border: '1px solid',
                                      borderColor: 'primary.main',
                                      position: 'relative',
                                      minHeight: '60px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      Right Door
                                    </Typography>
                                    <Typography variant="caption">
                                      {(configuration.dimensions?.width || 0) / 2}" × {configuration.dimensions?.height || 0}"
                                    </Typography>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '4px',
                                        height: '16px',
                                        bgcolor: 'primary.dark',
                                        borderRadius: '2px',
                                        ml: 0.5
                                      }}
                                    />
                                  </Paper>
                                </>
                              )}

                              {configuration.openingType === 'Pivot Door' && (
                                <Paper
                                  sx={{
                                    p: 1,
                                    flex: 1,
                                    bgcolor: 'primary.light',
                                    color: 'primary.contrastText',
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: 'primary.main',
                                    position: 'relative',
                                    minHeight: '60px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Pivot Door
                                  </Typography>
                                  <Typography variant="caption">
                                    {configuration.dimensions?.width || 0}" × {configuration.dimensions?.height || 0}"
                                  </Typography>
                                  <Box
                                    sx={{
                                        position: 'absolute',
                                      [configuration.handleLocation || 'right']: 0,
                                        top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '4px',
                                      height: '16px',
                                        bgcolor: 'primary.dark',
                                      borderRadius: '2px',
                                      mr: configuration.handleLocation === 'right' ? 0.5 : 'auto',
                                      ml: configuration.handleLocation === 'left' ? 0.5 : 'auto'
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: '50%',
                                      top: '50%',
                                      width: '8px',
                                      height: '8px',
                                      bgcolor: 'primary.dark',
                                      borderRadius: '50%',
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                  />
                                </Paper>
                              )}

                              {/* Right Sidelight */}
                              {configuration.rightSidelight?.enabled && (
                                <Paper
                                  sx={{
                                    p: 1,
                                    width: `${(configuration.rightSidelight.width / (configuration.dimensions?.width || 1)) * 100}%`,
                                    bgcolor: 'grey.100',
                                    color: 'text.primary',
                                    textAlign: 'center',
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    minHeight: '60px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Right Sidelight
                                  </Typography>
                                  <Typography variant="caption">
                                    {configuration.rightSidelight.width}" × {configuration.dimensions?.height || 0}"
                                  </Typography>
                                </Paper>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      </Box>
                    </Box>
                  ) : configuration.operationType ? (
                    <Typography variant="body2">
                      Operation: {configuration.operationType}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Dimensions
                </Typography>
                <Box sx={{ 
                  p: 3, 
                  border: '1px solid rgba(0, 0, 0, 0.12)', 
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  mb: 2
                }}>
                  {/* Total System Dimensions */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Total System Dimensions
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            System Width
                          </Typography>
                          <Typography variant="h5">
                            {(configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                             (configuration.dimensions?.width || 0) +
                             (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Including sidelights
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            System Height
                          </Typography>
                          <Typography variant="h5">
                            {(configuration.dimensions?.height || 0) + 
                             (configuration.transom?.enabled ? (configuration.transom?.height || 0) : 0)}"
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Including transom
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
              </Box>

                  {/* Door Panel Dimensions */}
                  {configuration.systemType === 'Entrance Doors' && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Door Panel Dimensions
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Door Width
                            </Typography>
                            <Typography variant="h5">
                              {configuration.dimensions?.width || 0}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {configuration.openingType === 'Double Door' ? 'Total width of both panels' : 'Single panel width'}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Door Height
                            </Typography>
                            <Typography variant="h5">
                              {configuration.dimensions?.height || 0}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Excluding transom
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Area Calculations */}
                  <Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      Area Calculations
                    </Typography>
                    <Grid container spacing={3}>
                      {configuration.systemType === 'Windows' ? (
                        // Windows area calculation
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'primary.main' }}>
                            <Typography variant="subtitle2" color="primary">
                              Total System Area
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {((configuration.panels?.reduce((sum, panel) => sum + panel.width, 0) || 0) * 
                                (configuration.dimensions?.height || 0) / 144).toFixed(2)} sq ft
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total window system area
                            </Typography>
                          </Paper>
                        </Grid>
                      ) : configuration.systemType === 'Entrance Doors' ? (
                        // Entrance doors area calculations
                        <>
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Typography variant="subtitle2" color="text.secondary">
                                Door Panel Area
                              </Typography>
                              <Typography variant="h5">
                                {((configuration.dimensions?.width || 0) * (configuration.dimensions?.height || 0) / 144).toFixed(2)} sq ft
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Door panels only
                              </Typography>
                            </Paper>
                          </Grid>
                          {(configuration.leftSidelight?.enabled || configuration.rightSidelight?.enabled || configuration.transom?.enabled) && (
                            <Grid item xs={12} sm={6} md={4}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                  Sidelights & Transom Area
                                </Typography>
                                <Typography variant="h5">
                                  {(
                                    // Sidelights area
                                    ((configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) * 
                                     (configuration.dimensions?.height || 0) +
                                     (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0) * 
                                     (configuration.dimensions?.height || 0) +
                                    // Transom area
                                    ((configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                     (configuration.dimensions?.width || 0) +
                                     (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)) * 
                                     (configuration.transom?.enabled ? (configuration.transom?.height || 0) : 0)
                                    ) / 144
                                  ).toFixed(2)} sq ft
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Additional glass area
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                          <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'primary.main' }}>
                              <Typography variant="subtitle2" color="primary">
                                Total System Area
                              </Typography>
                              <Typography variant="h5" color="primary">
                                {(
                                  ((configuration.leftSidelight?.enabled ? (configuration.leftSidelight?.width || 0) : 0) + 
                                   (configuration.dimensions?.width || 0) +
                                   (configuration.rightSidelight?.enabled ? (configuration.rightSidelight?.width || 0) : 0)) * 
                                  ((configuration.dimensions?.height || 0) + 
                                   (configuration.transom?.enabled ? (configuration.transom?.height || 0) : 0)) / 144
                                ).toFixed(2)} sq ft
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total system area
                              </Typography>
                            </Paper>
                          </Grid>
                        </>
                      ) : (
                        // Sliding doors area calculation
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'primary.main' }}>
                            <Typography variant="subtitle2" color="primary">
                              Total System Area
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {((configuration.dimensions?.width || 0) * (configuration.dimensions?.height || 0) / 144).toFixed(2)} sq ft
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total sliding door system area
                            </Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColorLensIcon fontSize="small" /> Finish Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Type: {configuration.finish.type}
                  </Typography>
                  <Typography variant="body2">
                    Style: {configuration.finish.color}
                  </Typography>
                  <Typography variant="body2">
                    RAL Color: {configuration.finish.ralColor || 'N/A'}
                  </Typography>
                </Stack>
              </Box>

              {configuration.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CommentIcon fontSize="small" /> Notes
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.default',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {configuration.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Grid>
          </Grid>

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
                        {item.brand} - {item.systemModel}
                      </Typography>
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
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          System Details
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            Type: {item.systemType}
                          </Typography>
                          {item.systemType === 'Windows' && item.panels ? (
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                Configuration:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                {item.panels?.map((panel, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      width: '30px',
                                      height: '45px',
                                      bgcolor: panel.operationType === 'Fixed' ? 'grey.100' : 'primary.light',
                                      color: panel.operationType === 'Fixed' ? 'text.primary' : 'primary.contrastText',
                                      border: '1px solid',
                                      borderColor: panel.operationType === 'Fixed' ? 'grey.300' : 'primary.main',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.625rem',
                                      textAlign: 'center',
                                      borderRadius: '2px',
                                      position: 'relative'
                                    }}
                                  >
                                    {panel.operationType.charAt(0)}
                                    {panel.operationType !== 'Fixed' && item.hasMosquitoNet && (
                                      <Typography 
                                        component="span" 
                                        sx={{
                                          fontSize: '0.5rem',
                                          color: 'success.main',
                                          position: 'absolute',
                                          bottom: 2
                                        }}
                                      >
                                        Net
                                      </Typography>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                F: Fixed, A: Awning, C: Casement, H: Hopper, T: Tilt Turn
                                {item.panels.some(p => p.operationType === 'Tilt & Turn' || p.operationType === 'Casement') && 
                                  ' (handle location shown by indicator)'}
                              </Typography>
                            </Box>
                          ) : item.systemType === 'Sliding Doors' ? (
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                Configuration:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                {item.panels?.map((panel, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      width: '30px',
                                      height: '45px',
                                      bgcolor: panel.type === 'Fixed' ? 'grey.100' : 'primary.light',
                                      color: panel.type === 'Fixed' ? 'text.primary' : 'primary.contrastText',
                                      border: '1px solid',
                                      borderColor: panel.type === 'Fixed' ? 'grey.300' : 'primary.main',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.625rem',
                                      textAlign: 'center',
                                      borderRadius: '2px',
                                      position: 'relative'
                                    }}
                                  >
                                    {panel.type === 'Sliding' ? (
                                      panel.direction === 'left' ? '←' : '→'
                                    ) : 'F'}
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          ) : item.systemType === 'Entrance Doors' ? (
                            <Box>
                              {/* Door Configuration Card */}
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 2,
                                  bgcolor: 'background.default',
                                  mb: 3
                                }}
                              >
                                <Grid container spacing={3}>
                                  {/* Left Column - Configuration Details */}
                                  <Grid item xs={12} md={4}>
                                    <Stack spacing={1}>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Configuration Details
                                      </Typography>
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
                                    </Stack>
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
                                      aspectRatio: item.dimensions?.width && item.dimensions?.height ? 
                                        `${(item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                          item.dimensions.width + 
                                          (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)} / 
                                         ${item.dimensions.height + (item.transom?.enabled ? item.transom.height : 0)}` : '16/9',
                                      maxHeight: '200px'
                                    }}>
                                      {/* Transom */}
                                      {item.transom?.enabled && (
                                        <Box sx={{ 
                                          display: 'flex', 
                                          gap: 1,
                                          height: `${(item.transom.height / (item.dimensions.height + item.transom.height)) * 100}%`
                                        }}>
                                          <Paper
                                            sx={{
                                              p: 0.5,
                                              flex: 1,
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
                                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                              Transom ({item.transom.height}")
                                            </Typography>
                                          </Paper>
                                        </Box>
                                      )}

                                      {/* Door and Sidelights */}
                                      <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                                        {/* Left Sidelight */}
                                        {item.leftSidelight?.enabled && (
                                          <Paper
                                            sx={{
                                              p: 0.5,
                                              width: `${(item.leftSidelight.width / ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                                item.dimensions.width + 
                                                (item.rightSidelight?.enabled ? item.rightSidelight.width : 0))) * 100}%`,
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
                                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                              Left ({item.leftSidelight.width}")
                                            </Typography>
                                          </Paper>
                                        )}

                                        {/* Door Section */}
                                        {item.openingType === 'Single Door' && (
                                          <Paper
                                            sx={{
                                              p: 0.5,
                                              flex: 1,
                                              bgcolor: 'primary.light',
                                              color: 'primary.contrastText',
                                              textAlign: 'center',
                                              border: '1px solid',
                                              borderColor: 'primary.main',
                                              position: 'relative',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              minHeight: 0
                                            }}
                                          >
                                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                              Door ({item.dimensions?.width}")
                                            </Typography>
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                [item.handleLocation || 'right']: 0,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '2px',
                                                height: '8px',
                                                bgcolor: 'primary.dark',
                                                borderRadius: '1px',
                                                mr: item.handleLocation === 'right' ? 0.25 : 'auto',
                                                ml: item.handleLocation === 'left' ? 0.25 : 'auto'
                                              }}
                                            />
                                          </Paper>
                                        )}

                                        {item.openingType === 'Double Door' && (
                                          <>
                                            <Paper
                                              sx={{
                                                p: 0.5,
                                                flex: 1,
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                textAlign: 'center',
                                                border: '1px solid',
                                                borderColor: 'primary.main',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: 0
                                              }}
                                            >
                                              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                                Left ({(item.dimensions?.width || 0) / 2}")
                                              </Typography>
                                              <Box
                                                sx={{
                                                  position: 'absolute',
                                                  right: 0,
                                                  top: '50%',
                                                  transform: 'translateY(-50%)',
                                                  width: '2px',
                                                  height: '8px',
                                                  bgcolor: 'primary.dark',
                                                  borderRadius: '1px',
                                                  mr: 0.25
                                                }}
                                              />
                                            </Paper>
                                            <Paper
                                              sx={{
                                                p: 0.5,
                                                flex: 1,
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                textAlign: 'center',
                                                border: '1px solid',
                                                borderColor: 'primary.main',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: 0
                                              }}
                                            >
                                              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                                Right ({(item.dimensions?.width || 0) / 2}")
                                              </Typography>
                                              <Box
                                                sx={{
                                                  position: 'absolute',
                                                  left: 0,
                                                  top: '50%',
                                                  transform: 'translateY(-50%)',
                                                  width: '2px',
                                                  height: '8px',
                                                  bgcolor: 'primary.dark',
                                                  borderRadius: '1px',
                                                  ml: 0.25
                                                }}
                                              />
                                            </Paper>
                                          </>
                                        )}

                                        {item.openingType === 'Pivot Door' && (
                                          <Paper
                                            sx={{
                                              p: 0.5,
                                              flex: 1,
                                              bgcolor: 'primary.light',
                                              color: 'primary.contrastText',
                                              textAlign: 'center',
                                              border: '1px solid',
                                              borderColor: 'primary.main',
                                              position: 'relative',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              minHeight: 0
                                            }}
                                          >
                                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                              Pivot ({item.dimensions?.width}")
                                            </Typography>
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                [item.handleLocation || 'right']: 0,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '2px',
                                                height: '8px',
                                                bgcolor: 'primary.dark',
                                                borderRadius: '1px',
                                                mr: item.handleLocation === 'right' ? 0.25 : 'auto',
                                                ml: item.handleLocation === 'left' ? 0.25 : 'auto'
                                              }}
                                            />
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: '50%',
                                                width: '4px',
                                                height: '4px',
                                                bgcolor: 'primary.dark',
                                                borderRadius: '50%',
                                                transform: 'translate(-50%, -50%)'
                                              }}
                                            />
                                          </Paper>
                                        )}

                                        {/* Right Sidelight */}
                                        {item.rightSidelight?.enabled && (
                                          <Paper
                                            sx={{
                                              p: 0.5,
                                              width: `${(item.rightSidelight.width / ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                                item.dimensions.width + 
                                                (item.rightSidelight?.enabled ? item.rightSidelight.width : 0))) * 100}%`,
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
                                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.6rem' }}>
                                              Right ({item.rightSidelight.width}")
                                            </Typography>
                                          </Paper>
                                        )}
                                      </Box>
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
                                              {(item.leftSidelight?.enabled ? (item.leftSidelight?.width || 0) : 0) + 
                                               (item.dimensions?.width || 0) +
                                               (item.rightSidelight?.enabled ? (item.rightSidelight?.width || 0) : 0)}"
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Typography variant="body2" color="text.secondary">Total Height:</Typography>
                                            <Typography variant="body2">
                                              {(item.dimensions?.height || 0) + 
                                               (item.transom?.enabled ? (item.transom?.height || 0) : 0)}"
                                            </Typography>
                                          </Box>
                                        </Stack>
                                      </Box>

                                      <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                          Area Calculations
                                        </Typography>
                                        <Stack spacing={1}>
                                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <Typography variant="body2" color="text.secondary">Door Area:</Typography>
                                            <Typography variant="body2">
                                              {((item.dimensions?.width || 0) * (item.dimensions?.height || 0) / 144).toFixed(1)} sq ft
                                            </Typography>
                                          </Box>
                                          {(item.leftSidelight?.enabled || item.rightSidelight?.enabled || item.transom?.enabled) && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                              <Typography variant="body2" color="text.secondary">Glass Area:</Typography>
                                              <Typography variant="body2">
                                                {(
                                                  ((item.leftSidelight?.enabled ? (item.leftSidelight?.width || 0) : 0) * 
                                                   (item.dimensions?.height || 0) +
                                                   (item.rightSidelight?.enabled ? (item.rightSidelight?.width || 0) : 0) * 
                                                   (item.dimensions?.height || 0) +
                                                  ((item.leftSidelight?.enabled ? (item.leftSidelight?.width || 0) : 0) + 
                                                   (item.dimensions?.width || 0) +
                                                   (item.rightSidelight?.enabled ? (item.rightSidelight?.width || 0) : 0)) * 
                                                   (item.transom?.enabled ? (item.transom?.height || 0) : 0)
                                                  ) / 144
                                                ).toFixed(1)} sq ft
                                              </Typography>
                                            </Box>
                                          )}
                                          <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'baseline',
                                            pt: 1,
                                            borderTop: '1px solid',
                                            borderColor: 'divider'
                                          }}>
                                            <Typography variant="subtitle2" color="primary">Total Area:</Typography>
                                            <Typography variant="subtitle2" color="primary">
                                              {(
                                                ((item.leftSidelight?.enabled ? (item.leftSidelight?.width || 0) : 0) + 
                                                 (item.dimensions?.width || 0) +
                                                 (item.rightSidelight?.enabled ? (item.rightSidelight?.width || 0) : 0)) * 
                                                ((item.dimensions?.height || 0) + 
                                                 (item.transom?.enabled ? (item.transom?.height || 0) : 0)) / 144
                                              ).toFixed(1)} sq ft
                                            </Typography>
                                          </Box>
                                        </Stack>
                                      </Box>
                                    </Stack>
                                  </Grid>
                                </Grid>
                              </Paper>

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
                            </Box>
                          ) : item.operationType ? (
                            <Typography variant="body2">
                              Operation: {item.operationType}
                            </Typography>
                          ) : null}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Dimensions
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip 
                            icon={<SquareFootIcon />} 
                            label={`Width: ${item.dimensions.width}"`}
                            variant="outlined"
                            size="small"
                          />
                          <Chip 
                            icon={<SquareFootIcon />} 
                            label={`Height: ${item.dimensions.height}"`}
                            variant="outlined"
                            size="small"
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
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
              <Button onClick={handleDownloadPDF} color="primary">
                Download PDF
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
    </Box>
  );
};

export default PricingSummary; 