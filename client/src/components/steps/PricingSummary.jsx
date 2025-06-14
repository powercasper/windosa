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
  InputAdornment,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableFooter,
  TableCell
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WindowIcon from '@mui/icons-material/Window';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import CommentIcon from '@mui/icons-material/Comment';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import SummarizeIcon from '@mui/icons-material/Summarize';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalculateIcon from '@mui/icons-material/Calculate';
import PaidIcon from '@mui/icons-material/Paid';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import { unitCostPerSqft, laborRates } from '../../utils/metadata';
import { generateQuote } from '../../api/config';
import { formatCurrency, saveQuote } from '../../utils/helpers';
import ConfigurationPreviewUI from '../ConfigurationPreviewUI';
import { generateQuotePDF } from '../../utils/pdfGenerator';

const STORAGE_KEY = 'orderAdditionalCosts';

// Helper functions for cost distribution
const calculateDistributedCosts = (items, totalArea, additionalCosts) => {
  const { tariff, shipping, delivery } = additionalCosts;
  const totalAdditionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
  
  if (totalArea === 0 || totalAdditionalCosts === 0) return { costPerSqFt: 0, totalDistributedCost: 0 };
  
  const costPerSqFt = totalAdditionalCosts / totalArea;
  return { costPerSqFt, totalDistributedCost: totalAdditionalCosts };
};

const calculateTypeMetrics = (items, type, additionalCosts) => {
  const typeItems = items.filter(({ item }) => item.systemType === type);
  
  const totalArea = typeItems.reduce((sum, { item }) => {
    if (type === 'Windows') {
      return sum + ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
    } else if (type === 'Entrance Doors') {
      return sum + (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                    item.dimensions.width +
                    (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                   (item.dimensions.height + 
                    (item.transom?.enabled ? item.transom.height : 0)) / 144);
    } else if (type === 'Sliding Doors') {
      return sum + ((item.dimensions.width * item.dimensions.height) / 144);
    }
    return sum;
  }, 0);

  const baseCost = typeItems.reduce((sum, { total }) => sum + total, 0);
  
  // Calculate total area of all items for distribution ratio
  const allItemsArea = items.reduce((sum, { item }) => {
    if (item.systemType === 'Windows') {
      return sum + ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
    } else if (item.systemType === 'Entrance Doors') {
      return sum + (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                    item.dimensions.width +
                    (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                   (item.dimensions.height + 
                    (item.transom?.enabled ? item.transom.height : 0)) / 144);
    } else if (item.systemType === 'Sliding Doors') {
      return sum + ((item.dimensions.width * item.dimensions.height) / 144);
    }
    return sum;
  }, 0);

  const { costPerSqFt: additionalCostPerSqFt } = calculateDistributedCosts(items, allItemsArea, additionalCosts);
  const distributedCost = totalArea * additionalCostPerSqFt;
  
  const totalCost = baseCost + distributedCost;
  const costPerSqFt = totalArea > 0 ? totalCost / totalArea : 0;

  return {
    totalArea: totalArea.toFixed(1),
    baseCost: baseCost.toFixed(2),
    distributedCost: distributedCost.toFixed(2),
    totalCost: totalCost.toFixed(2),
    costPerSqFt: costPerSqFt.toFixed(2)
  };
};

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

  // Get quantity (default to 1 if not specified)
  const quantity = item.quantity || 1;

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
    
    // Safely access door unit cost with fallback
    let doorUnitCost = 0;
    try {
      const brandCosts = unitCostPerSqft[item.brand];
      if (brandCosts && brandCosts[item.systemModel] && typeof brandCosts[item.systemModel] === 'object') {
        doorUnitCost = brandCosts[item.systemModel][item.openingType];
      }
    } catch (error) {
      console.warn('Error accessing door cost for', item.brand, item.systemModel, item.openingType);
    }

    // Use fallback values if doorUnitCost is not found
    if (!doorUnitCost) {
      const fallbackDoorCosts = {
        'Single Door': 70,
        'Double Door': 75,
        'Pivot Door': 85
      };
      doorUnitCost = fallbackDoorCosts[item.openingType] || 70;
      console.warn(`Using fallback door cost ${doorUnitCost} for ${item.brand} ${item.systemModel} ${item.openingType}`);
    }
    
    totalSystemCost += doorArea * doorUnitCost;
    totalGlassCost += doorArea * glassUnitCost;
    totalArea += doorArea;

    // Calculate fixed glass areas (sidelights and transom) with safe access
    let fixedUnitCost = 0;
    try {
      const brandCosts = unitCostPerSqft[item.brand];
      if (brandCosts && brandCosts[item.systemModel] && typeof brandCosts[item.systemModel] === 'object') {
        fixedUnitCost = brandCosts[item.systemModel]['Fixed'];
      }
    } catch (error) {
      console.warn('Error accessing fixed cost for', item.brand, item.systemModel);
    }

    // Use fallback for fixed panels if not found
    if (!fixedUnitCost) {
      fixedUnitCost = 32; // Default fixed panel cost
      console.warn(`Using fallback fixed cost ${fixedUnitCost} for ${item.brand} ${item.systemModel}`);
    }

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

      // Safely access system unit cost with fallback values
      let systemUnitCost = 0;
      try {
        const brandCosts = unitCostPerSqft[item.brand];
        if (brandCosts && brandCosts[item.systemModel] && typeof brandCosts[item.systemModel] === 'object') {
          systemUnitCost = brandCosts[item.systemModel][panel.operationType];
        }
      } catch (error) {
        console.warn('Error accessing system cost for', item.brand, item.systemModel, panel.operationType);
      }

      // Use fallback values if systemUnitCost is not found
      if (!systemUnitCost) {
        // Default fallback costs per operation type
        const fallbackCosts = {
          'Fixed': 25,
          'Tilt & Turn': 40,
          'Casement': 32,
          'Awning': 30,
          'Tilt Only': 37
        };
        systemUnitCost = fallbackCosts[panel.operationType] || 30;
        console.warn(`Using fallback cost ${systemUnitCost} for ${item.brand} ${item.systemModel} ${panel.operationType}`);
      }

      totalSystemCost += systemUnitCost * panelArea;
      
      // Add mosquito net cost if the panel is operational and has a net
      if (panel.operationType !== 'Fixed' && panel.hasMosquitoNet) {
        totalSystemCost += 100; // $100 per mosquito net
      }

      totalGlassCost += glassUnitCost * panelArea;
      
      const laborRate = laborRates[panel.operationType] || 5; // Fallback labor rate
      totalLaborCost += laborRate * panelArea;
    });
  } else if (item.systemType === 'Sliding Doors') {
    // For sliding doors, we use the typology-based pricing
    const area = (item.dimensions.width * item.dimensions.height) / 144;
    totalArea = area;
    
    // Safely access sliding door costs with fallback
    let costs = null;
    let systemUnitCost = 0;
    
    try {
      const brandCosts = unitCostPerSqft[item.brand];
      if (brandCosts && brandCosts[item.systemModel] && typeof brandCosts[item.systemModel] === 'object') {
        costs = brandCosts[item.systemModel];
        systemUnitCost = costs[item.operationType];
      }
    } catch (error) {
      console.warn('Error accessing sliding door cost for', item.brand, item.systemModel, item.operationType);
    }
    
    if (!systemUnitCost) {
      console.warn('No direct cost found for configuration:', item.operationType);
      // Determine fallback cost based on panel composition
      const numFixed = (item.operationType.match(/O/g) || []).length;
      const numSliding = (item.operationType.match(/X/g) || []).length;
      const totalPanels = numFixed + numSliding;

      if (totalPanels === 5) {
        if (numFixed === 1) {
          systemUnitCost = (costs && costs['OXXXX']) || 33.9;
        } else if (numFixed === 2) {
          systemUnitCost = item.operationType.includes('OO') ? 
            ((costs && costs['OOXXX']) || 33.2) : 
            ((costs && costs['OXXXO']) || 33.5);
        } else {
          systemUnitCost = (costs && costs['OXXXX']) || 33.9;
        }
      } else if (totalPanels === 6) {
        if (numFixed === 0) {
          systemUnitCost = (costs && costs['XXXXXX']) || 35.5;
        } else if (numFixed === 2) {
          systemUnitCost = (costs && costs['OXXXXO']) || 34.32;
        } else if (numFixed === 4) {
          systemUnitCost = (costs && costs['OOXXOO']) || 33.8;
        } else {
          systemUnitCost = (costs && costs['OXXXXO']) || 34.32;
        }
      } else {
        systemUnitCost = (costs && costs['OXXO']) || 31.16; // Default fallback
      }
      
      // If still no cost found, use a generic fallback
      if (!systemUnitCost) {
        systemUnitCost = 32; // Generic sliding door fallback
        console.warn(`Using generic fallback cost ${systemUnitCost} for ${item.brand} ${item.systemModel} ${item.operationType}`);
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
    systemCost: totalSystemCost * quantity,
    glassCost: totalGlassCost * quantity,
    laborCost: totalLaborCost * quantity,
    total: (totalSystemCost + totalGlassCost + totalLaborCost) * quantity,
    area: totalArea * quantity
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
  clientInfo = {},
  quoteItems = [], 
  onAddToQuote, 
  onStartNew,
  onAddNewItem, // New prop for adding items to existing quotes
  onEditItem,
  onRemoveItem,
  onQuoteSaved,
  onCopyItem,  // Add new prop
  onUpdateItemQuantity, // New prop for inline quantity updates
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
  
  // State for inline quantity editing
  const [editingQuantity, setEditingQuantity] = useState(null); // itemId or 'current' for current item
  const [tempQuantity, setTempQuantity] = useState('');
  
  // Initialize costs from storage or defaults
  const storedCosts = getStoredCosts();
  const [tariff, setTariff] = useState(storedCosts?.tariff || savedQuote?.tariff || '0');
  const [margin, setMargin] = useState(storedCosts?.margin || savedQuote?.margin || '30');
  const [shipping, setShipping] = useState(storedCosts?.shipping || savedQuote?.shipping || '0');
  const [delivery, setDelivery] = useState(storedCosts?.delivery || savedQuote?.delivery || '0');
  
  const [totalCost, setTotalCost] = useState(0);
  const [orderTotalPrice, setOrderTotalPrice] = useState(0);

  // Add isGeneratingPDF state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // Quantity editing functions
  const handleQuantityEdit = (itemId, currentQuantity) => {
    setEditingQuantity(itemId);
    setTempQuantity(String(currentQuantity || 1));
  };

  const handleQuantityCancel = () => {
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleQuantityChange = (value) => {
    // Only allow positive integers
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setTempQuantity(value);
    }
  };

  const handleQuantitySave = (itemId) => {
    const newQuantity = parseInt(tempQuantity) || 1;
    
    if (itemId === 'current') {
      // For current item, show an alert that they need to add to quote first
      alert('To change quantity, please add this item to your quote first, then edit the quantity from the quote items below.');
      setEditingQuantity(null);
      setTempQuantity('');
      return;
    }

    // Update item quantity without navigation
    if (onUpdateItemQuantity) {
      onUpdateItemQuantity(itemId, newQuantity);
    } else {
      // Fallback: Find the item and update its quantity via onEditItem
      const itemToUpdate = quoteItems.find(item => item.id === itemId);
      if (itemToUpdate && onEditItem) {
        const updatedItem = { ...itemToUpdate, quantity: newQuantity };
        onEditItem(updatedItem);
      }
    }
    
    setEditingQuantity(null);
    setTempQuantity('');
  };

  const handleQuantityKeyPress = (event, itemId) => {
    if (event.key === 'Enter') {
      handleQuantitySave(itemId);
    } else if (event.key === 'Escape') {
      handleQuantityCancel();
    }
  };

  // Editable Quantity Component
  const EditableQuantityChip = ({ itemId, quantity, size = "small", sx = {} }) => {
    const isEditing = editingQuantity === itemId;
    const isCurrentItem = itemId === 'current';
    
    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ...sx }}>
          <TextField
            size="small"
            value={tempQuantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            onKeyPress={(e) => handleQuantityKeyPress(e, itemId)}
            autoFocus
            sx={{ 
              width: '60px',
              '& .MuiInputBase-input': {
                textAlign: 'center',
                fontSize: size === 'small' ? '0.75rem' : '0.875rem'
              }
            }}
            inputProps={{
              min: 1,
              max: 999
            }}
          />
          <IconButton 
            size="small" 
            onClick={() => handleQuantitySave(itemId)}
            sx={{ p: 0.25, color: 'success.main' }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleQuantityCancel}
            sx={{ p: 0.25, color: 'error.main' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    return (
      <Tooltip title={isCurrentItem ? "Add to quote first to edit quantity" : "Click to edit quantity"}>
        <Chip
          size={size}
          label={`Qty: ${quantity || 1}`}
          color="primary"
          variant="outlined"
          onClick={() => handleQuantityEdit(itemId, quantity)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white'
            },
            ...sx
          }}
        />
      </Tooltip>
    );
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
        // Include client information
        clientInfo,
        customerName: clientInfo.isCompany ? 
          `${clientInfo.companyName} (${clientInfo.firstName} ${clientInfo.lastName})` :
          `${clientInfo.firstName} ${clientInfo.lastName}`,
        projectName: clientInfo.projectName,
        // Include additional costs
        tariff,
        margin,
        shipping,
        delivery
      };
      
      const savedQuoteResult = saveQuote(quoteToSave);
      setSaveSuccess(true);
      setQuoteDialog(prev => ({ ...prev, open: false }));
      
      // Notify parent components that the quote was saved, passing the saved quote data
      if (onQuoteSaved) {
        onQuoteSaved(savedQuoteResult);
      }
    } catch (error) {
      setQuoteDialog(prev => ({
        ...prev,
        error: 'Failed to save quote. Please try again.'
      }));
    }
  };

  // Add handleDownloadPDF function
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Calculate total area for cost distribution
      const totalArea = pricing.items.reduce((sum, { item }) => {
        if (item.systemType === 'Windows') {
          return sum + ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
        } else if (item.systemType === 'Entrance Doors') {
          return sum + (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                      item.dimensions.width +
                      (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                     (item.dimensions.height + 
                      (item.transom?.enabled ? item.transom.height : 0)) / 144);
        } else if (item.systemType === 'Sliding Doors') {
          return sum + ((item.dimensions.width * item.dimensions.height) / 144);
        }
        return sum;
      }, 0);

      // Calculate additional costs per sq ft
      const additionalCosts = {
        tariff: parseFloat(tariff || 0),
        shipping: parseFloat(shipping || 0),
        delivery: parseFloat(delivery || 0),
        margin: parseFloat(margin || 0)
      };
      
      const totalAdditionalCosts = additionalCosts.tariff + additionalCosts.shipping + additionalCosts.delivery;
      const additionalCostPerSqFt = totalArea > 0 ? totalAdditionalCosts / totalArea : 0;

      // Prepare items with all necessary data
      const itemsWithPricing = pricing.items.map(({ item, systemCost, glassCost, laborCost, total, area }) => {
        const itemArea = (() => {
          if (item.systemType === 'Windows') {
            return ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
          } else if (item.systemType === 'Entrance Doors') {
            return (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                    item.dimensions.width +
                    (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                   (item.dimensions.height + 
                    (item.transom?.enabled ? item.transom.height : 0)) / 144);
          } else if (item.systemType === 'Sliding Doors') {
            return ((item.dimensions.width * item.dimensions.height) / 144);
          }
          return 0;
        })();

        // Calculate item's proportional additional costs
        const itemAdditionalCosts = itemArea * additionalCostPerSqFt;
        const totalWithAdditions = total + itemAdditionalCosts;
        const marginMultiplier = 1 / (1 - (additionalCosts.margin / 100));
        const finalPrice = totalWithAdditions * marginMultiplier;

        return {
          ...item,
          pricing: {
            systemCost,
            glassCost,
            laborCost,
            baseTotal: total,
            additionalCosts: itemAdditionalCosts,
            finalPrice,
            area: itemArea
          },
          dimensions: {
            ...item.dimensions,
            totalWidth: item.systemType === 'Windows' ?
              item.panels.reduce((sum, panel) => sum + panel.width, 0) :
              ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
               item.dimensions.width +
               (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)),
            totalHeight: item.dimensions.height +
              (item.systemType === 'Entrance Doors' && item.transom?.enabled ? 
               item.transom.height : 0)
          }
        };
      });

      await generateQuotePDF({
        ...quoteDialog.quote,
        items: itemsWithPricing,
        totalAmount: pricing.grandTotal,
        clientInfo,
        customerName: clientInfo.isCompany ? 
          `${clientInfo.companyName} (${clientInfo.firstName} ${clientInfo.lastName})` :
          `${clientInfo.firstName} ${clientInfo.lastName}`,
        projectName: clientInfo.projectName,
        additionalCosts,
        totalArea,
        pricing: {
          totalSystemCost: pricing.totalSystemCost,
          totalGlassCost: pricing.totalGlassCost,
          totalLaborCost: pricing.totalLaborCost,
          grandTotal: pricing.grandTotal
        }
      });
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

      {/* Client Information Display */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon /> Client Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Client:</Typography>
            <Typography variant="body1">
              {clientInfo.isCompany && clientInfo.companyName ? 
                `${clientInfo.companyName}` : 
                clientInfo.firstName || clientInfo.lastName ?
                  `${clientInfo.firstName || ''} ${clientInfo.lastName || ''}`.trim() :
                  'JC'
              }
            </Typography>
            {(clientInfo.isCompany && clientInfo.jobTitle) && (
              <Typography variant="body2" color="text.secondary">
                {clientInfo.jobTitle}
              </Typography>
            )}
            {!clientInfo.isCompany && !clientInfo.jobTitle && (
              <Typography variant="body2" color="text.secondary">
                john colt, CEO
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Project:</Typography>
            <Typography variant="body1">{clientInfo.projectName || 'Colr esidence'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {clientInfo.projectType || 'residential'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Contact:</Typography>
            <Typography variant="body2">{clientInfo.email || 'jc@gm.com'}</Typography>
            <Typography variant="body2">{clientInfo.phone || '(555) 123-4567'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Address:</Typography>
            <Typography variant="body2">
              {clientInfo.address?.street ? (
                <>
                  {clientInfo.address.street}<br />
                  {clientInfo.address.city && `${clientInfo.address.city}, `}
                  {clientInfo.address.state} {clientInfo.address.zipCode}
                </>
              ) : (
                <>
                  7801 N Lamar Blvd<br />
                  Austin, TX 78724
                </>
              )}
            </Typography>
          </Grid>
                 </Grid>
       </Paper>

      {/* Project Details */}
      {pricing.items.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SummarizeIcon /> Project Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Total Items:</Typography>
              <Typography variant="h6" color="primary">{pricing.items.length}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Total Quantity:</Typography>
              <Typography variant="h6" color="primary">
                {pricing.items.reduce((sum, { item }) => sum + (item.quantity || 1), 0)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Total Area:</Typography>
              <Typography variant="h6" color="primary">
                {pricing.items.reduce((sum, { item }) => {
                  let area = 0;
                  if (item.systemType === 'Windows') {
                    area = (item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144;
                  } else if (item.systemType === 'Entrance Doors') {
                    area = ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                           item.dimensions.width +
                           (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                          (item.dimensions.height + 
                           (item.transom?.enabled ? item.transom.height : 0)) / 144;
                  } else if (item.systemType === 'Sliding Doors') {
                    area = (item.dimensions.width * item.dimensions.height) / 144;
                  }
                  return sum + area;
                }, 0).toFixed(1)} sq ft
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Project Total:</Typography>
              <Typography variant="h6" color="primary">
                ${(() => {
                  const baseCost = pricing.items.reduce((sum, { total }) => sum + total, 0);
                  const additionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
                  const totalWithAdditions = baseCost + additionalCosts;
                  const marginMultiplier = 1 / (1 - (parseFloat(margin || 0) / 100));
                  return (totalWithAdditions * marginMultiplier).toFixed(2);
                })()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {!isConfigurationEmpty && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">
                Current Item
              </Typography>
              <EditableQuantityChip
                itemId="current"
                quantity={configuration.quantity}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" color="primary">
                  {currentItemPrice ? formatCurrency(currentItemPrice.total) : '-'}
                </Typography>
                {currentItemPrice && (configuration.quantity || 1) > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(currentItemPrice.total / (configuration.quantity || 1))} each
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddToQuote}
                startIcon={<AddIcon />}
              >
                Add to Quote
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Configuration Preview */}
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  p: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                  Configuration Preview
                </Typography>
                <Box sx={{ mt: 2 }}>
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
                </Box>
              </Paper>
            </Grid>

            {/* Configuration Details */}
            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  p: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                  Configuration Details
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                      Type:
                  </Typography>
                  <Typography variant="body2">
                      {configuration.systemType}
                  </Typography>
                  </Box>
                  {configuration.systemType === 'Entrance Doors' && (
                    <>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Opening:
                            </Typography>
                        <Typography variant="body2">
                          {configuration.openingType}
                            </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Swing:
                          </Typography>
                        <Typography variant="body2">
                          {configuration.swingDirection}
                        </Typography>
                    </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Handle:
                      </Typography>
                        <Typography variant="body2">
                          {configuration.handleType}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Lock:
                        </Typography>
                        <Typography variant="body2">
                          {configuration.lockType}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Threshold:
                        </Typography>
                        <Typography variant="body2">
                          {configuration.threshold}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                          Hinge:
                        </Typography>
                        <Typography variant="body2">
                          {configuration.hingeType}
                        </Typography>
                      </Box>
                      {configuration.grid?.enabled && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '100px' }}>
                            Grid:
              </Typography>
                          <Typography variant="body2">
                            {configuration.grid.horizontal}H × {configuration.grid.vertical}V Divided Lights
              </Typography>
                          </Box>
                        )}
                    </>
                )}
                  {configuration.systemType === 'Windows' && configuration.panels && (
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
                )}
                  {configuration.systemType === 'Sliding Doors' && configuration.panels && (
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
                  )}
                </Stack>
                                </Paper>
            </Grid>

            {/* System Dimensions */}
            <Grid item xs={12} md={4}>
                                <Paper
                variant="outlined"
                                  sx={{
                  height: '100%',
                  p: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="subtitle1" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                  System Dimensions
                                  </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Measurements
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
              </Paper>
                    </Grid>

            {/* Finish Details and Cost Breakdown */}
            <Grid item xs={12}>
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
                        <Typography variant="body2">{configuration.finish?.type}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Style:</Typography>
                        <Typography variant="body2">{configuration.finish?.color}</Typography>
                </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">RAL:</Typography>
                        <Typography variant="body2">{configuration.finish?.ralColor}</Typography>
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
                        <Typography variant="body2">${currentItemPrice?.systemCost.toFixed(2) || '0.00'}</Typography>
              </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Glass:</Typography>
                        <Typography variant="body2">${currentItemPrice?.glassCost.toFixed(2) || '0.00'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Labor:</Typography>
                        <Typography variant="body2">${currentItemPrice?.laborCost.toFixed(2) || '0.00'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
            </Grid>
          </Paper>

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
            </Grid>
          </Grid>
        </Paper>
      )}

      {pricing.items.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Quote Items
            </Typography>
            <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={savedQuote && onAddNewItem ? onAddNewItem : onStartNew}
              startIcon={<AddIcon />}
              size="small"
            >
              Add Another Item
            </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateQuote}
                size="small"
              >
                Generate Quote
              </Button>
            </Stack>
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
                  {/* Header with Item Number and Actions */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WindowIcon color="primary" />
                        Item {item.itemNumber} - {item.brand} {item.systemModel}
                          <EditableQuantityChip
                            itemId={item.id}
                            quantity={item.quantity}
                            sx={{ ml: 1 }}
                          />
                      </Typography>
                      {item.location && (
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Location: {item.location}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" color="primary">
                          ${total.toFixed(2)}
                        </Typography>
                        {(item.quantity || 1) > 1 && (
                          <Typography variant="caption" color="text.secondary">
                            ${(total / (item.quantity || 1)).toFixed(2)} each
                          </Typography>
                        )}
                      </Box>
                      {typeof onCopyItem === 'function' && (
                        <IconButton 
                          edge="end" 
                          aria-label="copy" 
                          onClick={() => {
                            const itemCopy = JSON.parse(JSON.stringify(item));
                            delete itemCopy.id;
                            delete itemCopy.itemNumber;
                            onCopyItem(itemCopy);
                          }}
                          title="Copy item"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      )}
                      <IconButton edge="end" aria-label="edit" onClick={() => onEditItem(item)} title="Edit item">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => onRemoveItem(item.id)} title="Delete item">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Main Content Grid */}
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 2,
                                  bgcolor: 'background.default',
                      mb: 2
                                }}
                              >
                                <Grid container spacing={3}>
                      {/* Configuration Preview */}
                                  <Grid item xs={12} md={4}>
                        <Paper
                          variant="outlined"
                          sx={{
                            height: '100%',
                            p: 2,
                            bgcolor: 'background.paper'
                          }}
                        >
                          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                                      Configuration Preview
                                    </Typography>
                          <Box sx={{ mt: 2 }}>
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
                              </Box>
                        </Paper>
                                  </Grid>

                      {/* Configuration Details */}
                                  <Grid item xs={12} md={4}>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                            height: '100%',
                                  p: 2,
                            bgcolor: 'background.paper'
                          }}
                        >
                          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                                        Configuration Details
                              </Typography>
                          <Stack spacing={1.5} sx={{ mt: 2 }}>
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
                                          </Paper>
                      </Grid>

                      {/* System Dimensions */}
                      <Grid item xs={12} md={4}>
                                          <Paper
                          variant="outlined"
                                            sx={{
                            height: '100%',
                            p: 2,
                            bgcolor: 'background.paper'
                                            }}
                                          >
                          <Typography variant="subtitle1" color="primary" gutterBottom sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                            System Dimensions
                                            </Typography>
                          <Stack spacing={2} sx={{ mt: 2 }}>
                                      <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Measurements
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
                        </Paper>
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
                  onClick={savedQuote && onAddNewItem ? onAddNewItem : onStartNew}
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
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  bgcolor: 'background.paper',
                  mb: 3
                }}
              >
                <Typography variant="h6" gutterBottom color="primary" sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  Cost Order Details
                </Typography>

                <Grid container spacing={3}>
                  {/* Windows Summary */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: 'background.default'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WindowIcon fontSize="small" />
                        Windows
                      </Typography>
                      <Stack spacing={1}>
                        {(() => {
                          const metrics = calculateTypeMetrics(pricing.items, 'Windows', { tariff, shipping, delivery });
                          return (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Total Area:</Typography>
                                <Typography variant="body2">{metrics.totalArea} sq ft</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Base Cost:</Typography>
                                <Typography variant="body2">${metrics.baseCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Additional Costs:</Typography>
                                <Typography variant="body2">${metrics.distributedCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" color="primary">Total Cost:</Typography>
                                <Typography variant="subtitle2" color="primary">${metrics.totalCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Cost per sq ft:</Typography>
                                <Typography variant="body2">${metrics.costPerSqFt}</Typography>
                              </Box>
                            </>
                          );
                        })()}
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Entrance Doors Summary */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: 'background.default'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MeetingRoomIcon fontSize="small" />
                        Entrance Doors
                      </Typography>
                      <Stack spacing={1}>
                        {(() => {
                          const metrics = calculateTypeMetrics(pricing.items, 'Entrance Doors', { tariff, shipping, delivery });
                          return (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Total Area:</Typography>
                                <Typography variant="body2">{metrics.totalArea} sq ft</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Base Cost:</Typography>
                                <Typography variant="body2">${metrics.baseCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Additional Costs:</Typography>
                                <Typography variant="body2">${metrics.distributedCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" color="primary">Total Cost:</Typography>
                                <Typography variant="subtitle2" color="primary">${metrics.totalCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Cost per sq ft:</Typography>
                                <Typography variant="body2">${metrics.costPerSqFt}</Typography>
                              </Box>
                            </>
                          );
                        })()}
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Sliding Doors Summary */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: 'background.default'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DoorSlidingIcon fontSize="small" />
                        Sliding Doors
                      </Typography>
                      <Stack spacing={1}>
                        {(() => {
                          const metrics = calculateTypeMetrics(pricing.items, 'Sliding Doors', { tariff, shipping, delivery });
                          return (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Total Area:</Typography>
                                <Typography variant="body2">{metrics.totalArea} sq ft</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Base Cost:</Typography>
                                <Typography variant="body2">${metrics.baseCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Additional Costs:</Typography>
                                <Typography variant="body2">${metrics.distributedCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" color="primary">Total Cost:</Typography>
                                <Typography variant="subtitle2" color="primary">${metrics.totalCost}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Cost per sq ft:</Typography>
                                <Typography variant="body2">${metrics.costPerSqFt}</Typography>
                              </Box>
                            </>
                          );
                        })()}
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Total Order Summary */}
                  <Grid item xs={12} md={6} lg={3}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: 'background.default',
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SummarizeIcon fontSize="small" />
                        Total Order
                      </Typography>
                      <Stack spacing={1}>
                        {(() => {
                          const totalArea = pricing.items.reduce((sum, { item }) => {
                            if (item.systemType === 'Windows') {
                              return sum + ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
                            } else if (item.systemType === 'Entrance Doors') {
                              return sum + (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                        item.dimensions.width +
                                        (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                                       (item.dimensions.height + 
                                        (item.transom?.enabled ? item.transom.height : 0)) / 144);
                            } else if (item.systemType === 'Sliding Doors') {
                              return sum + ((item.dimensions.width * item.dimensions.height) / 144);
                            }
                            return sum;
                          }, 0);

                          const baseCost = pricing.items.reduce((sum, { total }) => sum + total, 0);
                          const additionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
                          const totalCost = baseCost + additionalCosts;
                          const marginPercent = parseFloat(margin || 0);
                          const marginMultiplier = marginPercent / 100;
                          const finalPrice = totalCost / (1 - marginMultiplier);
                          const profit = finalPrice - totalCost;
                          const costPerSqFt = totalArea > 0 ? finalPrice / totalArea : 0;

                          return (
                            <>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Total Area:</Typography>
                                <Typography variant="body2">{totalArea.toFixed(1)} sq ft</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Base Cost:</Typography>
                                <Typography variant="body2">${baseCost.toFixed(2)}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Additional Costs:</Typography>
                                <Typography variant="body2">${additionalCosts.toFixed(2)}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" color="primary">Total Cost:</Typography>
                                <Typography variant="subtitle2" color="primary">${totalCost.toFixed(2)}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" color="text.secondary">Cost per sq ft:</Typography>
                                <Typography variant="body2">${costPerSqFt.toFixed(2)}</Typography>
                              </Box>
                            </>
                          );
                        })()}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Detailed Pricing Breakdown - Restructured */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                      Detailed Pricing Breakdown
                    </Typography>
                  </Grid>

                  {/* Product and Additional Costs Combined */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: 'background.default'
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon fontSize="small" />
                        Cost Breakdown
                      </Typography>
                      <Stack spacing={2}>
                        {/* Product Costs */}
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Product Costs
                          </Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">System Cost:</Typography>
                              <Typography variant="body2">
                                ${pricing.items.reduce((sum, { systemCost }) => sum + systemCost, 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Glass Cost:</Typography>
                              <Typography variant="body2">
                                ${pricing.items.reduce((sum, { glassCost }) => sum + glassCost, 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Labor Cost:</Typography>
                              <Typography variant="body2">
                                ${pricing.items.reduce((sum, { laborCost }) => sum + laborCost, 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                              <Typography variant="subtitle2" color="primary">Total Product Cost:</Typography>
                              <Typography variant="subtitle2" color="primary">
                                ${pricing.items.reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Additional Costs */}
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Additional Costs
                          </Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Tariff:</Typography>
                              <Typography variant="body2">${parseFloat(tariff || 0).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                              <Typography variant="body2">${parseFloat(shipping || 0).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Typography variant="body2" color="text.secondary">Delivery:</Typography>
                              <Typography variant="body2">${parseFloat(delivery || 0).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                              <Typography variant="subtitle2" color="primary">Total Additional:</Typography>
                              <Typography variant="subtitle2" color="primary">
                                ${(parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0)).toFixed(2)}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Final Calculation */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        height: '100%',
                        bgcolor: 'background.default',
                        borderColor: 'success.main',
                        borderWidth: 2
                      }}
                    >
                      <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaidIcon fontSize="small" />
                        Final Calculation
                      </Typography>
                      <Stack spacing={2}>
                        {(() => {
                          const baseCost = pricing.items.reduce((sum, { total }) => sum + total, 0);
                          const additionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
                          const totalCost = baseCost + additionalCosts;
                          const marginPercent = parseFloat(margin || 0);
                          const marginMultiplier = marginPercent / 100;
                          const finalPrice = totalCost / (1 - marginMultiplier);
                          const profit = finalPrice - totalCost;
                          const profitMarginPercent = (profit / finalPrice) * 100;

                          return (
                            <>
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Cost Summary
                                </Typography>
                                <Stack spacing={1}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography variant="body2" color="text.secondary">Product Cost:</Typography>
                                    <Typography variant="body2">${baseCost.toFixed(2)}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography variant="body2" color="text.secondary">Additional Cost:</Typography>
                                    <Typography variant="body2">${additionalCosts.toFixed(2)}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" color="primary">Total Cost:</Typography>
                                    <Typography variant="subtitle2" color="primary">${totalCost.toFixed(2)}</Typography>
                                  </Box>
                                </Stack>
                              </Box>

                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Profit Calculation
                                </Typography>
                                <Stack spacing={1}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography variant="body2" color="text.secondary">Margin Rate:</Typography>
                                    <Typography variant="body2">{marginPercent}%</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography variant="body2" color="text.secondary">Profit Amount:</Typography>
                                    <Typography variant="body2">${profit.toFixed(2)}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Typography variant="body2" color="text.secondary">Profit Margin:</Typography>
                                    <Typography variant="body2">{profitMarginPercent.toFixed(1)}%</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                                    <Typography variant="subtitle2" color="success.main">Final Price:</Typography>
                                    <Typography variant="subtitle2" color="success.main">${finalPrice.toFixed(2)}</Typography>
                                  </Box>
                                </Stack>
                              </Box>
                            </>
                          );
                        })()}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Itemized Overview Table */}
        <Box sx={{ mt: 4 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="h6" gutterBottom color="primary" sx={{ pb: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormatListNumberedIcon />
              Itemized Overview
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Position</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity [Pcs.]</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Area [ft²]</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Base Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price*</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pricing.items.map(({ item, total }, index) => {
                    const itemArea = (() => {
                      if (item.systemType === 'Windows') {
                        return ((item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144);
                      } else if (item.systemType === 'Entrance Doors') {
                        return (((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                item.dimensions.width +
                                (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                               (item.dimensions.height + 
                                (item.transom?.enabled ? item.transom.height : 0)) / 144);
                      } else if (item.systemType === 'Sliding Doors') {
                        return ((item.dimensions.width * item.dimensions.height) / 144);
                      }
                      return 0;
                    })();

                    // Calculate total area for all items
                    const totalArea = pricing.items.reduce((sum, { item }) => {
                      let area = 0;
                      if (item.systemType === 'Windows') {
                        area = (item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144;
                      } else if (item.systemType === 'Entrance Doors') {
                        area = ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                               item.dimensions.width +
                               (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                              (item.dimensions.height + 
                               (item.transom?.enabled ? item.transom.height : 0)) / 144;
                      } else if (item.systemType === 'Sliding Doors') {
                        area = (item.dimensions.width * item.dimensions.height) / 144;
                      }
                      return sum + area;
                    }, 0);

                    // Calculate proportional additional costs for this item
                    const additionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
                    const itemAdditionalCosts = (itemArea / totalArea) * additionalCosts;
                    
                    // Calculate unit price including additional costs and margin
                    const baseUnitPrice = total;
                    const unitPriceWithAdditions = baseUnitPrice + itemAdditionalCosts;
                    const marginMultiplier = 1 / (1 - (parseFloat(margin || 0) / 100));
                    const finalUnitPrice = unitPriceWithAdditions * marginMultiplier;
                    
                    const description = (() => {
                      if (item.systemType === 'Windows') {
                        return `${item.brand} ${item.systemModel} - ${item.panels.map(p => p.operationType).join('/')}`;
                      } else if (item.systemType === 'Entrance Doors') {
                        return `${item.brand} ${item.systemModel} - ${item.openingType}`;
                      } else if (item.systemType === 'Sliding Doors') {
                        return `${item.brand} ${item.systemModel} - ${item.operationType}`;
                      }
                      return '';
                    })();

                    return (
                      <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{String(index + 1).padStart(3, '0')}</TableCell>
                        <TableCell>{item.quantity || 1}</TableCell>
                        <TableCell>{description}</TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell align="right">{itemArea.toFixed(1)}</TableCell>
                        <TableCell align="right">${(baseUnitPrice / (item.quantity || 1)).toFixed(2)}</TableCell>
                        <TableCell align="right">${(finalUnitPrice / (item.quantity || 1)).toFixed(2)}</TableCell>
                        <TableCell align="right">${finalUnitPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ 
                    '& td': { 
                      borderTop: '2px solid',
                      borderColor: 'divider',
                      py: 1.5,
                      fontWeight: 'bold'
                    } 
                  }}>
                    <TableCell colSpan={2}>{pricing.items.length} Positions</TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell align="right">
                      {pricing.items.reduce((sum, { item }) => {
                        let area = 0;
                        if (item.systemType === 'Windows') {
                          area = (item.panels.reduce((w, p) => w + p.width, 0) * item.dimensions.height) / 144;
                        } else if (item.systemType === 'Entrance Doors') {
                          area = ((item.leftSidelight?.enabled ? item.leftSidelight.width : 0) + 
                                 item.dimensions.width +
                                 (item.rightSidelight?.enabled ? item.rightSidelight.width : 0)) * 
                                (item.dimensions.height + 
                                 (item.transom?.enabled ? item.transom.height : 0)) / 144;
                        } else if (item.systemType === 'Sliding Doors') {
                          area = (item.dimensions.width * item.dimensions.height) / 144;
                        }
                        return sum + area;
                      }, 0).toFixed(1)}
                    </TableCell>
                    <TableCell align="right">
                      ${pricing.items.reduce((sum, { total }) => sum + total, 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">
                      ${(() => {
                        const baseCost = pricing.items.reduce((sum, { total }) => sum + total, 0);
                        const additionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
                        const totalWithAdditions = baseCost + additionalCosts;
                        const marginMultiplier = 1 / (1 - (parseFloat(margin || 0) / 100));
                        return (totalWithAdditions * marginMultiplier).toFixed(2);
                      })()}
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grand Total Net</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${(() => {
                        const baseCost = pricing.items.reduce((sum, { total }) => sum + total, 0);
                        return baseCost.toFixed(2);
                      })()}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ 
                    '& td': { 
                      borderTop: '2px solid',
                      borderColor: 'divider',
                      py: 1.5
                    }
                  }}>
                    <TableCell colSpan={6}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>Total Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                      ${(() => {
                        const baseCost = pricing.items.reduce((sum, { total }) => sum + total, 0);
                        const additionalCosts = parseFloat(tariff || 0) + parseFloat(shipping || 0) + parseFloat(delivery || 0);
                        const totalWithAdditions = baseCost + additionalCosts;
                        const marginMultiplier = 1 / (1 - (parseFloat(margin || 0) / 100));
                        return (totalWithAdditions * marginMultiplier).toFixed(2);
                      })()}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                * Unit Price includes proportionally distributed additional costs (tariff, shipping, delivery) and margin
              </Typography>
            </TableContainer>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default PricingSummary; 