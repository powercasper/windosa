import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import ConfigurationStepper from './components/ConfigurationStepper';
import { fetchMetadata } from './api/config';
import SavedQuotes from './components/SavedQuotes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

const App = () => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedQuotesOpen, setSavedQuotesOpen] = useState(false);
  const [configStepperKey, setConfigStepperKey] = useState(0);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [loadedQuote, setLoadedQuote] = useState(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const data = await fetchMetadata();
        setMetadata(data);
        setError(null);
      } catch (err) {
        setError('Failed to load application data. Please try again later.');
        console.error('Error loading metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, []);

  const handleLoadQuote = (quote, isEdit = false) => {
    setSavedQuotesOpen(false);
    setIsEditingQuote(isEdit);
    setLoadedQuote(quote);
    // Force a remount of ConfigurationStepper to ensure it loads with the saved quote
    setConfigStepperKey(prev => prev + 1);
  };

  const handleQuoteSaved = () => {
    // Reset the loaded quote after saving
    setLoadedQuote(null);
    setIsEditingQuote(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Window & Door Pricing System
            </Typography>
            <Button color="inherit" onClick={() => setSavedQuotesOpen(true)}>
              Saved Quotes
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <ConfigurationStepper 
              key={configStepperKey}
              metadata={metadata} 
              onLoadSavedQuote={handleLoadQuote}
              onQuoteSaved={handleQuoteSaved}
              isEditingQuote={isEditingQuote}
              loadedQuote={loadedQuote}
            />
          )}
        </Box>

        <Dialog
          open={savedQuotesOpen}
          onClose={() => setSavedQuotesOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <SavedQuotes onLoadQuote={handleLoadQuote} />
          </DialogContent>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default App; 