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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { unitCostPerSqft, laborRates } from '../../utils/metadata';
import { generateQuote, generatePDF } from '../../api/config';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const calculateItemPrice = (item) => {
  const height = item.dimensions.height;
  let totalSystemCost = 0;
  let totalArea = 0;

  // Calculate costs for each panel if it's a window with multiple panels
  if (item.systemType === 'Windows' && item.panels) {
    item.panels.forEach(panel => {
      const panelArea = (panel.width * height) / 144; // Convert to sq ft
      totalArea += panelArea;

      const systemUnitCost = unitCostPerSqft[item.brand][item.systemModel][panel.operationType];
      totalSystemCost += systemUnitCost * panelArea;
    });
  } else if (item.systemType === 'Sliding Doors') {
    // For sliding doors, we use the typology-based pricing
    totalArea = (item.dimensions.width * height) / 144;
    const systemUnitCost = unitCostPerSqft[item.brand][item.systemModel][item.operationType];
    totalSystemCost = systemUnitCost * totalArea;

    // Calculate labor based on number of panels
    const numPanels = item.operationType.length; // Length of typology string represents number of panels
    const numFixed = (item.operationType.match(/O/g) || []).length;
    const numSliding = (item.operationType.match(/X/g) || []).length;
    
    // Update labor calculation
    const fixedLaborRate = laborRates['Sliding Fixed'];
    const slidingLaborRate = laborRates['Sliding →'];
    const avgLaborRate = ((numFixed * fixedLaborRate) + (numSliding * slidingLaborRate)) / numPanels;
    item.laborRate = avgLaborRate;
  } else {
    // Single panel calculation (entrance doors)
    totalArea = (item.dimensions.width * height) / 144;
    const systemUnitCost = unitCostPerSqft[item.brand][item.systemModel][item.operationType || 'Fixed'];
    totalSystemCost = systemUnitCost * totalArea;
  }

  // Glass rates remain the same per sq ft regardless of operation type
  const glassRates = {
    'Double Pane': 12.5,
    'Triple Pane': 18.75,
    'Security Glass': 22,
    'Acoustic Glass': 25
  };
  const glassUnitCost = glassRates[item.glassType] || glassRates['Double Pane'];
  const glassCost = glassUnitCost * totalArea;

  // Calculate labor cost based on operation types
  let totalLaborCost = 0;
  if (item.systemType === 'Windows' && item.panels) {
    item.panels.forEach(panel => {
      const panelArea = (panel.width * height) / 144;
      const laborRate = laborRates[panel.operationType];
      totalLaborCost += laborRate * panelArea;
    });
  } else {
    const laborRate = item.laborRate || // Use pre-calculated rate for sliding doors
      (item.operationType ? laborRates[item.operationType] : laborRates['Fixed']);
    totalLaborCost = laborRate * totalArea;
  }

  return {
    systemCost: totalSystemCost,
    glassCost,
    laborCost: totalLaborCost,
    total: totalSystemCost + glassCost + totalLaborCost,
    area: totalArea
  };
};

const PricingSummary = ({ 
  configuration, 
  quoteItems = [], 
  onAddToQuote, 
  onStartNew,
  onEditItem,
  onRemoveItem
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
        Quote Summary
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
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  ) : configuration.systemType === 'Sliding Doors' ? (
                    <Typography variant="body2">
                      Configuration: {configuration.operationType} 
                      ({configuration.operationType.split('').map(type => 
                        type === 'O' ? 'Fixed' : 'Sliding'
                      ).join(', ')})
                    </Typography>
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
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip 
                    icon={<SquareFootIcon />} 
                    label={`Width: ${configuration.dimensions.width}"`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip 
                    icon={<SquareFootIcon />} 
                    label={`Height: ${configuration.dimensions.height}"`}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
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
                                Panes:
                              </Typography>
                              <Stack spacing={1} sx={{ pl: 2 }}>
                                {item.panels.map((panel, idx) => (
                                  <Typography key={idx} variant="body2">
                                    Pane {idx + 1}: {panel.width}" wide - {panel.operationType}
                                  </Typography>
                                ))}
                              </Stack>
                            </Box>
                          ) : (
                            <Typography variant="body2">
                              Operation: {item.operationType}
                            </Typography>
                          )}
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

                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ColorLensIcon fontSize="small" /> Finish Details
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            Type: {item.finish.type}
                          </Typography>
                          <Typography variant="body2">
                            Style: {item.finish.color}
                          </Typography>
                          <Typography variant="body2">
                            RAL Color: {item.finish.ralColor}
                          </Typography>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Cost Breakdown
                        </Typography>
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            System Cost: ${systemCost.toFixed(2)}
                          </Typography>
                          <Typography variant="body2">
                            Glass Cost: ${glassCost.toFixed(2)}
                          </Typography>
                          <Typography variant="body2">
                            Labor Cost: ${laborCost.toFixed(2)}
                          </Typography>
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
        disableScrollLock
      >
        <DialogTitle>
          {quoteDialog.loading ? 'Generating Quote...' : 'Quote Generated'}
        </DialogTitle>
        <DialogContent>
          {quoteDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : quoteDialog.error ? (
            <Alert severity="error">{quoteDialog.error}</Alert>
          ) : quoteDialog.quote ? (
            <>
              <Typography variant="body1" paragraph>
                Quote Number: {quoteDialog.quote.quoteNumber}
              </Typography>
              <Typography variant="body1" paragraph>
                Total Amount: ${pricing.grandTotal.toFixed(2)}
              </Typography>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          {!quoteDialog.loading && !quoteDialog.error && quoteDialog.quote && (
            <Button onClick={handleDownloadPDF} color="primary">
              Download PDF
            </Button>
          )}
          <Button onClick={() => setQuoteDialog(prev => ({ ...prev, open: false }))} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PricingSummary; 