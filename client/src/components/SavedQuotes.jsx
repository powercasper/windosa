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
import { formatCurrency, formatDate, loadSavedQuotes } from '../utils/helpers';
import AddIcon from '@mui/icons-material/Add';

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
    if (item.systemType === 'Windows') {
      return (
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
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.625rem' }}>
                {panel.operationType === 'Fixed' ? 'F' : 
                 panel.operationType === 'Awning' ? 'A' :
                 panel.operationType === 'Casement' ? 'C' :
                 panel.operationType === 'Hopper' ? 'H' : 'T'}
              </Typography>
              {(panel.operationType === 'Tilt & Turn' || panel.operationType === 'Casement') && (
                <Box
                  sx={{
                    position: 'absolute',
                    [panel.handleLocation || 'right']: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2px',
                    height: '10px',
                    bgcolor: 'primary.dark',
                    borderRadius: '1px',
                    mr: panel.handleLocation === 'right' ? 0.25 : 'auto',
                    ml: panel.handleLocation === 'left' ? 0.25 : 'auto'
                  }}
                />
              )}
            </Box>
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.625rem' }}>
            F: Fixed, A: Awning, C: Casement, H: Hopper, T: Tilt Turn
            {item.panels.some(p => p.operationType === 'Tilt & Turn' || p.operationType === 'Casement') && 
              ' (handle location shown by indicator)'}
          </Typography>
        </Box>
      );
    } else if (item.systemType === 'Sliding Doors') {
      return (
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
                borderRadius: '2px'
              }}
            >
              {panel.type === 'Sliding' ? (
                panel.direction === 'left' ? '←' : '→'
              ) : 'F'}
            </Box>
          ))}
        </Box>
      );
    } else if (item.systemType === 'Entrance Doors') {
      return (
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Opening Type: {item.openingType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Swing Direction: {item.swingDirection}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Handle: {item.handleType}, Lock: {item.lockType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Threshold: {item.threshold}, Hinges: {item.hingeType}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1,
                bgcolor: 'background.default',
                height: '80px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                {/* Door Frame */}
                <Box sx={{ 
                  position: 'absolute',
                  top: '10%',
                  left: '10%',
                  right: '10%',
                  bottom: '10%',
                  border: '2px solid',
                  borderColor: 'grey.400',
                  borderRadius: 1,
                  display: 'flex'
                }}>
                  {/* Door Panel(s) */}
                  {item.openingType === 'Single Door' && (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                      position: 'relative',
                      transform: item.swingDirection?.includes('Out') ? 'scaleX(-1)' : 'none'
                    }}>
                      {/* Handle */}
                      <Box sx={{
                        position: 'absolute',
                        [item.swingDirection?.includes('Left') ? 'right' : 'left']: '10px',
                        top: '50%',
                        width: '20px',
                        height: '4px',
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-50%)'
                      }} />
                    </Box>
                  )}
                  {(item.openingType === 'Double Door' || item.openingType === 'Double Door with Fixed Panel') && (
                    <>
                      <Box sx={{
                        width: '50%',
                        height: '100%',
                        border: '1px solid',
                        borderColor: item.openingType === 'Double Door with Fixed Panel' && 
                                   item.swingDirection?.includes('Right Active') ? 'grey.400' : 'primary.main',
                        bgcolor: item.openingType === 'Double Door with Fixed Panel' && 
                                item.swingDirection?.includes('Right Active') ? 'grey.100' : 'primary.light',
                        position: 'relative'
                      }}>
                        {/* Left Panel Handle */}
                        {(!item.swingDirection?.includes('Right Active')) && (
                          <Box sx={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            width: '20px',
                            height: '4px',
                            bgcolor: 'primary.dark',
                            transform: 'translateY(-50%)'
                          }} />
                        )}
                      </Box>
                      <Box sx={{
                        width: '50%',
                        height: '100%',
                        border: '1px solid',
                        borderColor: item.openingType === 'Double Door with Fixed Panel' && 
                                   item.swingDirection?.includes('Left Active') ? 'grey.400' : 'primary.main',
                        bgcolor: item.openingType === 'Double Door with Fixed Panel' && 
                                item.swingDirection?.includes('Left Active') ? 'grey.100' : 'primary.light',
                        position: 'relative'
                      }}>
                        {/* Right Panel Handle */}
                        {(!item.swingDirection?.includes('Left Active')) && (
                          <Box sx={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            width: '20px',
                            height: '4px',
                            bgcolor: 'primary.dark',
                            transform: 'translateY(-50%)'
                          }} />
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      );
    }
    return null;
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
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Date: {formatDate(selectedQuote.date)}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      Total: {formatCurrency(selectedQuote.totalAmount)}
                    </Typography>
                  </Stack>
                </Grid>
                
                {selectedQuote.items.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="subtitle1" gutterBottom>
                          {item.brand} - {item.systemModel}
                        </Typography>
                      </Stack>
                      {renderItemConfiguration(item)}
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Type: {item.systemType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Dimensions: {item.dimensions.width}" × {item.dimensions.height}"
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Glass Type: {item.glassType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Finish: {item.finish.type} - {item.finish.color}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Operation: {item.operationType}
                          </Typography>
                        </Grid>
                      </Grid>
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