import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Grid,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { unitCostPerSqft, laborRates } from '../../utils/metadata';
import { generateQuote, generatePDF } from '../../api/config';

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
  } else {
    // Single panel calculation (doors or legacy windows)
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
    const laborRate = item.operationType ? 
      laborRates[item.operationType] : 
      laborRates['Fixed'];
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
        items: [...quoteItems, configuration].filter(item => item.systemModel && item.glassType),
        totalAmount: pricing.grandTotal
      });
      setQuoteDialog({
        open: true,
        loading: false,
        error: null,
        quote
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

  if (pricing.items.length === 0) {
    return (
      <Typography color="error">
        Please add at least one item to the quote
      </Typography>
    );
  }

  return (
    <Box>
      {!isConfigurationEmpty && (
        <>
          <Typography variant="h5" gutterBottom>
            Current Item Summary
          </Typography>
          <Paper sx={{ p: 3, mb: 3 }}>
            {showAddSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Item added to quote successfully!
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {configuration.brand} - {configuration.systemModel}
                </Typography>
                <Box sx={{ pl: 2, mt: 1 }}>
                  <Typography>System Type: {configuration.systemType}</Typography>
                  {configuration.panels ? (
                    <>
                      <Typography>Panels:</Typography>
                      {configuration.panels.map((panel, index) => (
                        <Box key={index} sx={{ pl: 2 }}>
                          <Typography>
                            Panel {index + 1}: {panel.operationType} - {panel.width}"
                          </Typography>
                        </Box>
                      ))}
                    </>
                  ) : configuration.operationType && (
                    <Typography>Operation: {configuration.operationType}</Typography>
                  )}
                  <Typography>
                    Dimensions: {configuration.dimensions.width}" × {configuration.dimensions.height}"
                  </Typography>
                  <Typography>Glass: {configuration.glassType}</Typography>
                  <Typography>
                    Finish: {configuration.finish.type} - {configuration.finish.color}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ pl: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Typography>System Cost:</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography align="right">${currentItemPrice?.systemCost.toFixed(2) || '0.00'}</Typography>
                    </Grid>

                    <Grid item xs={8}>
                      <Typography>Glass Package:</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography align="right">${currentItemPrice?.glassCost.toFixed(2) || '0.00'}</Typography>
                    </Grid>

                    <Grid item xs={8}>
                      <Typography>Labor:</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography align="right">${currentItemPrice?.laborCost.toFixed(2) || '0.00'}</Typography>
                    </Grid>

                    <Grid item xs={8}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Item Total:
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle1" fontWeight="bold" align="right">
                        ${currentItemPrice?.total.toFixed(2) || '0.00'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {!isConfigurationEmpty ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToQuote}
            startIcon={<AddIcon />}
          >
            Add to Quote
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={onStartNew}
            startIcon={<AddIcon />}
          >
            Configure New Item
          </Button>
        )}
      </Box>

      {quoteItems.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Quote Summary
          </Typography>
          <Paper sx={{ p: 3 }}>
            <List>
              {pricing.items.map((pricedItem, index) => (
                <React.Fragment key={pricedItem.item.id}>
                  <ListItem
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      position: 'relative',
                      pr: 8 // Make room for the action buttons
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute',
                      right: 16,
                      top: 16,
                      display: 'flex',
                      gap: 1
                    }}>
                      <IconButton 
                        size="small"
                        onClick={() => onEditItem(pricedItem.item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => onRemoveItem(pricedItem.item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="h6">
                        Item {index + 1}: {pricedItem.item.brand} - {pricedItem.item.systemModel}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ pl: 2, mt: 1 }}>
                            <Typography>System Type: {pricedItem.item.systemType}</Typography>
                            {pricedItem.item.operationType && (
                              <Typography>Operation: {pricedItem.item.operationType}</Typography>
                            )}
                            <Typography>
                              Dimensions: {pricedItem.item.dimensions.width}" × {pricedItem.item.dimensions.height}"
                            </Typography>
                            <Typography>Glass: {pricedItem.item.glassType}</Typography>
                            <Typography>
                              Finish: {pricedItem.item.finish.type} - {pricedItem.item.finish.color}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ pl: 2 }}>
                            <Grid container spacing={1}>
                              <Grid item xs={8}>
                                <Typography>System Cost:</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography align="right">${pricedItem.systemCost.toFixed(2)}</Typography>
                              </Grid>

                              <Grid item xs={8}>
                                <Typography>Glass Package:</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography align="right">${pricedItem.glassCost.toFixed(2)}</Typography>
                              </Grid>

                              <Grid item xs={8}>
                                <Typography>Labor:</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography align="right">${pricedItem.laborCost.toFixed(2)}</Typography>
                              </Grid>

                              <Grid item xs={8}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Item Total:
                                </Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography variant="subtitle1" fontWeight="bold" align="right">
                                  ${pricedItem.total.toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </ListItem>
                  {index < pricing.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ pl: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <Typography variant="h6">Total System Cost:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" align="right">${pricing.totalSystemCost.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={8}>
                  <Typography variant="h6">Total Glass Cost:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" align="right">${pricing.totalGlassCost.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={8}>
                  <Typography variant="h6">Total Labor Cost:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" align="right">${pricing.totalLaborCost.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Grand Total:
              </Typography>
              <Typography variant="h5" color="primary">
                ${pricing.grandTotal.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleGenerateQuote}
              >
                Generate Quote
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Dialog
        open={quoteDialog.open}
        onClose={() => setQuoteDialog({ ...quoteDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {quoteDialog.loading ? 'Generating Quote...' : 'Quote Generated'}
        </DialogTitle>
        <DialogContent>
          {quoteDialog.loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : quoteDialog.error ? (
            <Alert severity="error">{quoteDialog.error}</Alert>
          ) : (
            <Box>
              <Typography gutterBottom>
                Quote #{quoteDialog.quote?.quoteNumber} has been generated successfully.
              </Typography>
              <Typography color="textSecondary">
                You can now download the PDF version of your quote.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setQuoteDialog({ ...quoteDialog, open: false })}
            color="inherit"
          >
            Close
          </Button>
          {!quoteDialog.loading && !quoteDialog.error && (
            <Button
              onClick={handleDownloadPDF}
              color="primary"
              variant="contained"
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PricingSummary; 