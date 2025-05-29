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
} from '@mui/material';
import { unitCostPerSqft, laborRates } from '../../utils/metadata';
import { generateQuote, generatePDF } from '../../api/config';

const PricingSummary = ({ configuration }) => {
  const [pricing, setPricing] = useState({
    systemCost: 0,
    glassCost: 0,
    laborCost: 0,
    total: 0
  });
  const [quoteDialog, setQuoteDialog] = useState({
    open: false,
    loading: false,
    error: null,
    quote: null
  });

  const glassRates = {
    'Double Pane': 12.5,
    'Triple Pane': 18.75,
    'Security Glass': 22,
    'Acoustic Glass': 25
  };

  useEffect(() => {
    if (configuration.brand && configuration.systemModel && configuration.dimensions) {
      const area = (configuration.dimensions.width * configuration.dimensions.height) / 144;
      
      let systemUnitCost = 0;
      if (configuration.systemType === 'Windows' || configuration.systemType === 'Entrance Doors') {
        systemUnitCost = unitCostPerSqft[configuration.brand][configuration.systemModel][configuration.operationType || 'Fixed'];
      } else {
        const systemRates = unitCostPerSqft[configuration.brand][configuration.systemModel];
        systemUnitCost = Object.values(systemRates)[0];
      }
      const systemCost = systemUnitCost * area;

      const glassUnitCost = glassRates[configuration.glassType] || glassRates['Double Pane'];
      const glassCost = glassUnitCost * area;

      const laborRate = configuration.operationType ? 
        laborRates[configuration.operationType] : 
        laborRates['Fixed'];
      const laborCost = laborRate * area;

      const total = systemCost + glassCost + laborCost;

      setPricing({
        systemCost,
        glassCost,
        laborCost,
        total
      });
    }
  }, [configuration]);

  const handleGenerateQuote = async () => {
    setQuoteDialog({
      ...quoteDialog,
      open: true,
      loading: true,
      error: null
    });

    try {
      const quote = await generateQuote(configuration);
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
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `quote-${quoteDialog.quote.quoteNumber}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Show error in dialog
      setQuoteDialog(prev => ({
        ...prev,
        error: 'Failed to download PDF. Please try again.'
      }));
    }
  };

  if (!configuration.systemModel || !configuration.glassType) {
    return (
      <Typography color="error">
        Please complete all previous steps first
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Price Summary
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">
              Configuration Details
            </Typography>
            <Box sx={{ pl: 2, mt: 1 }}>
              <Typography>Brand: {configuration.brand}</Typography>
              <Typography>System: {configuration.systemType}</Typography>
              <Typography>Model: {configuration.systemModel}</Typography>
              {configuration.operationType && (
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
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">
              Cost Breakdown
            </Typography>
            <Box sx={{ pl: 2, mt: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <Typography>System Cost:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography align="right">${pricing.systemCost.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={8}>
                  <Typography>Glass Package:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography align="right">${pricing.glassCost.toFixed(2)}</Typography>
                </Grid>

                <Grid item xs={8}>
                  <Typography>Labor:</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography align="right">${pricing.laborCost.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Total Price:
              </Typography>
              <Typography variant="h5" color="primary">
                ${pricing.total.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleGenerateQuote}
            >
              Generate Quote
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
          ) : quoteDialog.quote && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Quote #{quoteDialog.quote.quoteNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Date: {new Date(quoteDialog.quote.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total Amount: ${quoteDialog.quote.pricing.total.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!quoteDialog.loading && !quoteDialog.error && (
            <>
              <Button onClick={() => setQuoteDialog({ ...quoteDialog, open: false })}>
                Close
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PricingSummary; 