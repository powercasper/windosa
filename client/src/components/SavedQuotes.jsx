import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Grid,
  Chip,
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import WindowIcon from '@mui/icons-material/Window';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import { formatCurrency, formatDate, loadSavedQuotes } from '../utils/helpers';
import AddIcon from '@mui/icons-material/Add';
import ConfigurationPreviewUI from './ConfigurationPreviewUI';

const iconMapping = {
  Windows: WindowIcon,
  'Entrance Doors': DoorFrontIcon,
  'Sliding Doors': DoorSlidingIcon
};

const SavedQuotes = ({ onLoadQuote }) => {
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  useEffect(() => {
    loadSavedQuotesFromStorage();
  }, []);

  const loadSavedQuotesFromStorage = () => {
    const quotes = loadSavedQuotes();
    setSavedQuotes(quotes);
  };

  const handleDeleteQuote = () => {
    const updatedQuotes = savedQuotes.filter(quote => quote.id !== quoteToDelete);
    localStorage.setItem('savedQuotes', JSON.stringify(updatedQuotes));
    setSavedQuotes(updatedQuotes);
    setDeleteDialogOpen(false);
    setQuoteToDelete(null);
  };

  const handleDeleteClick = (quote) => {
    setQuoteToDelete(quote.id);
    setDeleteDialogOpen(true);
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setViewDialogOpen(true);
  };

  const handleEditQuote = (quote) => {
    onLoadQuote(quote, true);
  };

  const renderItemConfiguration = (item) => {
    const Icon = iconMapping[item.systemType];
    
      return (
      <Box sx={{ width: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          {Icon && <Icon sx={{ fontSize: 24, color: 'primary.main' }} />}
          <Typography variant="subtitle1">
            {item.brand} {item.systemModel}
            {item.quantity && item.quantity > 1 && (
              <Chip 
                size="small" 
                label={`Qty: ${item.quantity}`}
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Stack>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              System Type: {item.systemType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dimensions: {item.dimensions.width}" × {item.dimensions.height}"
            </Typography>
            {item.systemType === 'Windows' && (
              <Typography variant="body2" color="text.secondary">
                Operation: {item.operationType}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Glass Type: {item.glassType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Finish: {item.finish.type} - {item.finish.color}
              {item.finish.ralColor && ` (RAL ${item.finish.ralColor})`}
            </Typography>
          </Grid>
        </Grid>

        {item.systemType === 'Windows' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Window Configuration:
            </Typography>
            <ConfigurationPreviewUI configuration={item} maxHeight="200px" />
          </Box>
        )}

        {item.systemType === 'Entrance Doors' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Door Configuration:
            </Typography>
            <ConfigurationPreviewUI configuration={item} maxHeight="200px" />
          </Box>
        )}

        {item.systemType === 'Sliding Doors' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sliding Door Configuration:
            </Typography>
            <ConfigurationPreviewUI configuration={item} maxHeight="200px" />
          </Box>
        )}

        {item.notes && (
          <Box sx={{ mt: 2 }}>
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
                {item.notes}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
      );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Saved Quotes
      </Typography>
      
      {savedQuotes.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No saved quotes found.
          </Typography>
        </Paper>
      ) : (
        <List>
          {savedQuotes.map((quote, index) => (
            <React.Fragment key={quote.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Quote #{quote.id}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(quote.date)}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {formatCurrency(quote.totalAmount)}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${quote.items.length} items`}
                      variant="outlined"
                    />
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleViewQuote(quote)}
                    title="View Quote"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEditQuote(quote)}
                    title="Edit Quote"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(quote)}
                    title="Delete Quote"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* View Quote Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedQuote && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Quote #{selectedQuote.id}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    handleEditQuote(selectedQuote);
                    setViewDialogOpen(false);
                  }}
                  size="small"
                >
                  Edit Quote
                </Button>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(selectedQuote.date)}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      Total: {formatCurrency(selectedQuote.totalAmount)}
                    </Typography>
                    <Chip 
                      label={`${selectedQuote.items.length} items`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                </Grid>
                
                {selectedQuote.items.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      {renderItemConfiguration(item)}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Quote</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quote? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteQuote} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedQuotes; 