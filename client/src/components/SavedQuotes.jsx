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

        {item.systemType === 'Windows' && item.panels && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configuration:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {item.panels.map((panel, index) => (
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    position: 'relative'
                  }}
                >
                  {panel.operationType === 'Fixed' ? 'F' : 
                   panel.operationType === 'Awning' ? 'A' :
                   panel.operationType === 'Casement' ? 'C' :
                   panel.operationType === 'Tilt Only' ? 'T' : 'TT'}
                  
                  {/* Grid Lines */}
                  {item.grid?.enabled && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none'
                    }}>
                      {/* Vertical Grid Lines */}
                      {Array.from({ length: item.grid.horizontal - 1 }).map((_, i) => (
                        <Box
                          key={`v-${i}`}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${((i + 1) * 100) / item.grid.horizontal}%`,
                            width: '1px',
                            bgcolor: 'grey.400'
                          }}
                        />
                      ))}
                      {/* Horizontal Grid Lines */}
                      {Array.from({ length: item.grid.vertical - 1 }).map((_, i) => (
                        <Box
                          key={`h-${i}`}
                          sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: `${((i + 1) * 100) / item.grid.vertical}%`,
                            height: '1px',
                            bgcolor: 'grey.400'
                          }}
                        />
                      ))}
                    </Box>
                  )}

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
                        mr: panel.handleLocation === 'right' ? 0.25 : 'auto',
                        ml: panel.handleLocation === 'left' ? 0.25 : 'auto'
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {item.systemType === 'Entrance Doors' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Door Configuration:
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
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                      Transom ({item.transom.height}")
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Door Layout */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flex: 1,
                height: item.transom?.enabled ? 
                  `${(item.dimensions.height / (item.dimensions.height + item.transom.height)) * 100}%` : 
                  '100%'
              }}>
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
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                      Left ({item.leftSidelight.width}")
                    </Typography>
                  </Paper>
                )}

                {/* Door Panels */}
                {item.openingType === 'Double Door' ? (
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
                      {item.doorType === 'glass' && item.grid?.enabled && (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: 'none'
                        }}>
                          {/* Vertical Grid Lines */}
                          {Array.from({ length: item.grid.horizontal - 1 }).map((_, i) => {
                            const doorWidth = item.dimensions.width / 2;
                            const gridProfileWidth = (1 / doorWidth) * 100;
                            const position = ((i + 1) * 100) / item.grid.horizontal;
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
                          {Array.from({ length: item.grid.vertical - 1 }).map((_, i) => {
                            const totalHeight = item.dimensions.height;
                            const gridProfileHeight = (1 / totalHeight) * 100;
                            const position = ((i + 1) * 100) / item.grid.vertical;
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
                        {(item.dimensions?.width || 0) / 2}"
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
                      {item.doorType === 'glass' && item.grid?.enabled && (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: 'none'
                        }}>
                          {/* Vertical Grid Lines */}
                          {Array.from({ length: item.grid.horizontal - 1 }).map((_, i) => {
                            const doorWidth = item.dimensions.width / 2;
                            const gridProfileWidth = (1 / doorWidth) * 100;
                            const position = ((i + 1) * 100) / item.grid.horizontal;
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
                          {Array.from({ length: item.grid.vertical - 1 }).map((_, i) => {
                            const totalHeight = item.dimensions.height;
                            const gridProfileHeight = (1 / totalHeight) * 100;
                            const position = ((i + 1) * 100) / item.grid.vertical;
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
                        {(item.dimensions?.width || 0) / 2}"
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
                ) : (
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
                      minHeight: '60px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Grid Lines for Glass Doors */}
                    {item.doorType === 'glass' && item.grid?.enabled && (
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none'
                      }}>
                        {/* Vertical Grid Lines */}
                        {Array.from({ length: item.grid.horizontal - 1 }).map((_, i) => {
                          const doorWidth = item.dimensions.width;
                          const gridProfileWidth = (1 / doorWidth) * 100;
                          const position = ((i + 1) * 100) / item.grid.horizontal;
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
                        {Array.from({ length: item.grid.vertical - 1 }).map((_, i) => {
                          const totalHeight = item.dimensions.height;
                          const gridProfileHeight = (1 / totalHeight) * 100;
                          const position = ((i + 1) * 100) / item.grid.vertical;
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
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Single Door ({item.dimensions?.width}")
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                      {item.dimensions?.width}" × {item.dimensions?.height}"
                    </Typography>
                    <Box
                      sx={{
                        position: 'absolute',
                        [item.swingDirection?.toLowerCase().includes('left') ? 'left' : 'right']: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '12px',
                        bgcolor: 'primary.dark',
                        borderRadius: '2px',
                        [item.swingDirection?.toLowerCase().includes('left') ? 'ml' : 'mr']: 0.5
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
                    <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                      Right ({item.rightSidelight.width}")
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Box>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Opening Type: {item.openingType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Swing Direction: {item.swingDirection}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Handle: {item.handleType}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lock: {item.lockType}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        {item.systemType === 'Sliding Doors' && item.panels && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configuration:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {item.panels.map((panel, index) => (
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    fontSize: '0.75rem'
                  }}
                >
                  {panel.type === 'Fixed' ? 'F' :
                   panel.direction === 'left' ? '←' : '→'}
                </Box>
              ))}
            </Box>
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