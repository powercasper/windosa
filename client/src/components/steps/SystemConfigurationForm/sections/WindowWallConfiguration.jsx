import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Chip,
  Tooltip,
  Drawer,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import WindowIcon from '@mui/icons-material/Window';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import DoorSlidingIcon from '@mui/icons-material/DoorSliding';
import SettingsIcon from '@mui/icons-material/Settings';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StraightIcon from '@mui/icons-material/Straight';
import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SystemModelSelector from '../components/SystemModelSelector';
import { useMetadata } from '../../../../contexts/MetadataContext';
import glassService from '../../../../services/glassService';

// Available cell types for Window Wall
const cellTypes = [
  { value: 'Fixed Window', label: 'Fixed Window', icon: WindowIcon },
  { value: 'Operable Window', label: 'Operable Window', icon: WindowIcon },
  { value: 'Entrance Door', label: 'Entrance Door', icon: DoorFrontIcon },
  { value: 'Sliding Door', label: 'Sliding Door', icon: DoorSlidingIcon }
];

// Helper function to check if a cell type should show the system model selector
const shouldShowSystemModelSelector = (cellType) => {
  return ['Operable Window', 'Entrance Door', 'Sliding Door'].includes(cellType);
};

const WindowWallConfiguration = ({ configuration, onUpdate }) => {
  const { metadata } = useMetadata();
  const [addCellDialog, setAddCellDialog] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [addDirection, setAddDirection] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [warning, setWarning] = useState('');
  const [selectedCellId, setSelectedCellId] = useState(null);
  const [mergeStartCellId, setMergeStartCellId] = useState(null);
  const [mergeEndCellId, setMergeEndCellId] = useState(null);
  const [setupRows, setSetupRows] = useState(configuration.grid?.rows || 3);
  const [setupCols, setSetupCols] = useState(configuration.grid?.columns || 3);
  
  // Glass options state
  const [glassOptions, setGlassOptions] = useState([]);
  const [loadingGlass, setLoadingGlass] = useState(false);
  
  // Enhanced selection state for rectangular area selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const gridRef = useRef(null);

  // Initialize grid if not exists
  useEffect(() => {
    if (!configuration.grid) {
      onUpdate({
        grid: {
          rows: 1,
          columns: 1,
          columnWidths: [36],
          rowHeights: [48],
          cells: [
            {
              id: 'cell-1',
              row: 0,
              col: 0,
              rowSpan: 1,
              colSpan: 1,
              width: 36,
              height: 48,
              type: 'Fixed Window',
              systemModel: '', // Initialize systemModel for operable cell types
              glassType: '',
              operationType: '',
              panels: [],
              finish: {
                type: 'Powder Coated',
                color: 'Standard',
                ralColor: '7016'
              },
              config: {
                systemType: 'Fixed Window',
                dimensions: { width: 36, height: 48 },
                finish: {
                  type: 'Powder Coated',
                  color: 'Standard',
                  ralColor: '7016'
                }
              }
            }
          ]
        }
      });
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedCells(new Set());
        setMergeStartCellId(null);
        setMergeEndCellId(null);
        setSelectedCellId(null);
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load glass options when editing a cell
  useEffect(() => {
    if (editingCell && shouldShowSystemModelSelector(editingCell.type)) {
      loadGlassOptions(editingCell);
    }
  }, [editingCell]);

  // Helper to get cell by position
  const getCellByPosition = (row, col) => {
    return configuration.grid?.cells.find(cell => 
      cell.row === row && cell.col === col && cell.rowSpan === 1 && cell.colSpan === 1
    );
  };

  // Helper to get all cells in a rectangular area
  const getCellsInArea = (startRow, startCol, endRow, endCol) => {
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    
    const cells = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cell = getCellByPosition(row, col);
        if (cell) {
          cells.push(cell);
        }
      }
    }
    return cells;
  };

  // Handle mouse down for drag selection
  const handleMouseDown = (cell, event) => {
    if (!configuration.grid) return;
    
    setIsDragging(true);
    setDragStart({ row: cell.row, col: cell.col });
    setDragEnd({ row: cell.row, col: cell.col });
    setSelectedCells(new Set([cell.id]));
    
    // Clear previous merge selection
    setMergeStartCellId(null);
    setMergeEndCellId(null);
  };

  // Handle mouse move for drag selection
  const handleMouseMove = (event) => {
    if (!isDragging || !dragStart || !gridRef.current) return;
    
    // Find the cell under the mouse cursor
    const target = event.target.closest('[data-cell-id]');
    if (!target) return;
    
    const cellId = target.getAttribute('data-cell-id');
    const cell = configuration.grid.cells.find(c => c.id === cellId);
    if (!cell) return;
    
    setDragEnd({ row: cell.row, col: cell.col });
    
    // Update selected cells
    const cellsInArea = getCellsInArea(dragStart.row, dragStart.col, cell.row, cell.col);
    setSelectedCells(new Set(cellsInArea.map(cell => cell.id)));
  };

  // Handle mouse up to finish selection
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;
    
    setIsDragging(false);
    
    // If we have a valid selection (more than one cell), set up for merging
    if (selectedCells.size > 1) {
      const selectedCellsArray = Array.from(selectedCells);
      const firstCell = configuration.grid.cells.find(cell => cell.id === selectedCellsArray[0]);
      const lastCell = configuration.grid.cells.find(cell => cell.id === selectedCellsArray[selectedCellsArray.length - 1]);
      
      if (firstCell && lastCell) {
        setMergeStartCellId(firstCell.id);
        setMergeEndCellId(lastCell.id);
      }
    } else {
      // Single cell selection - open edit dialog
      const cellId = Array.from(selectedCells)[0];
      if (cellId) {
        setSelectedCellId(cellId);
        const cell = configuration.grid.cells.find(c => c.id === cellId);
        setEditingCell(cell);
        setDrawerOpen(true);
      }
    }
    
    setDragStart(null);
    setDragEnd(null);
  };

  // Handle click for single cell selection
  const handleCellClick = (cell, event) => {
    // If we're not dragging, handle as single click
    if (!isDragging) {
      setSelectedCellId(cell.id);
      setEditingCell(cell);
      setDrawerOpen(true);
      setSelectedCells(new Set([cell.id]));
      setMergeStartCellId(null);
      setMergeEndCellId(null);
    }
  };

  const handleAddCell = (direction) => {
    setAddDirection(direction);
    setAddCellDialog(true);
  };

  const handleCellTypeSelect = (cellType) => {
    const newCell = {
      id: `cell-${Date.now()}`,
      type: cellType,
      rowSpan: 1,
      colSpan: 1,
      width: 36,
      height: 48,
      systemModel: '', // Initialize systemModel for operable cell types
      glassType: '',
      operationType: '',
      panels: [],
      finish: {
        type: 'Powder Coated',
        color: 'Standard',
        ralColor: '7016'
      },
      config: {
        systemType: cellType,
        dimensions: { width: 36, height: 48 },
        finish: {
          type: 'Powder Coated',
          color: 'Standard',
          ralColor: '7016'
        }
      }
    };

    // Calculate new position based on direction
    const currentGrid = configuration.grid;
    let newRow = 0, newCol = 0;

    switch (addDirection) {
      case 'top':
        newRow = 0;
        newCol = Math.floor(currentGrid.columns / 2);
        // Expand grid upward
        currentGrid.rows += 1;
        // Shift all existing cells down
        currentGrid.cells.forEach(cell => cell.row += 1);
        break;
      case 'bottom':
        newRow = currentGrid.rows;
        newCol = Math.floor(currentGrid.columns / 2);
        currentGrid.rows += 1;
        break;
      case 'left':
        newRow = Math.floor(currentGrid.rows / 2);
        newCol = 0;
        currentGrid.columns += 1;
        currentGrid.cells.forEach(cell => cell.col += 1);
        break;
      case 'right':
        newRow = Math.floor(currentGrid.rows / 2);
        newCol = currentGrid.columns;
        currentGrid.columns += 1;
        break;
    }

    newCell.row = newRow;
    newCell.col = newCol;

    const updatedCells = [...currentGrid.cells, newCell];
    
    onUpdate({
      grid: {
        ...currentGrid,
        cells: updatedCells
      }
    });

    setAddCellDialog(false);
    setAddDirection(null);
  };

  const handleRemoveCell = (cellId) => {
    const updatedCells = configuration.grid.cells.filter(cell => cell.id !== cellId);
    
    // Recalculate grid dimensions
    const maxRow = Math.max(...updatedCells.map(cell => cell.row + cell.rowSpan - 1), 0);
    const maxCol = Math.max(...updatedCells.map(cell => cell.col + cell.colSpan - 1), 0);
    
    onUpdate({
      grid: {
        rows: maxRow + 1,
        columns: maxCol + 1,
        cells: updatedCells
      }
    });
  };

  const handleCellConfig = (cellId) => {
    setSelectedCellId(cellId);
    setSelectedCell(cellId);
    setEditingCell(configuration.grid.cells.find(cell => cell.id === cellId));
    setDrawerOpen(true);
  };

  const handleAddRow = (cellId, direction) => {
    const grid = configuration.grid;
    const cell = grid.cells.find(c => c.id === cellId);
    if (!cell) return;
    let insertAt = direction === 'above' ? cell.row : cell.row + cell.rowSpan;
    // Insert a new row at insertAt, shift cells at/after insertAt
    const newRowHeights = [...(grid.rowHeights || Array(grid.rows).fill(48))];
    newRowHeights.splice(insertAt, 0, 48);
    const newCells = grid.cells.map(c => {
      if (c.row >= insertAt) {
        return { ...c, row: c.row + 1 };
      }
      return c;
    });
    // Add new cell in the new row, same col/colSpan as selected
    const newCell = {
      id: `cell-${Date.now()}`,
      row: insertAt,
      col: cell.col,
      rowSpan: 1,
      colSpan: cell.colSpan,
      width: 36,
      height: 48,
      type: 'Fixed Window',
      config: {
        systemType: 'Fixed Window',
        dimensions: { width: 36, height: 48 },
        finish: { type: 'Powder Coated', color: 'Standard', ralColor: '7016' }
      }
    };
    onUpdate({
      grid: {
        ...grid,
        rows: grid.rows + 1,
        rowHeights: newRowHeights,
        cells: [...newCells, newCell]
      }
    });
  };

  const handleAddCol = (cellId, direction) => {
    const grid = configuration.grid;
    const cell = grid.cells.find(c => c.id === cellId);
    if (!cell) return;
    let insertAt = direction === 'left' ? cell.col : cell.col + cell.colSpan;
    // Insert a new col at insertAt, shift cells at/after insertAt
    const newColWidths = [...(grid.columnWidths || Array(grid.columns).fill(36))];
    newColWidths.splice(insertAt, 0, 36);
    const newCells = grid.cells.map(c => {
      if (c.col >= insertAt) {
        return { ...c, col: c.col + 1 };
      }
      return c;
    });
    // Add new cell in the new col, same row/rowSpan as selected
    const newCell = {
      id: `cell-${Date.now()}`,
      row: cell.row,
      col: insertAt,
      rowSpan: cell.rowSpan,
      colSpan: 1,
      width: 36,
      height: 48,
      type: 'Fixed Window',
      config: {
        systemType: 'Fixed Window',
        dimensions: { width: 36, height: 48 },
        finish: { type: 'Powder Coated', color: 'Standard', ralColor: '7016' }
      }
    };
    onUpdate({
      grid: {
        ...grid,
        columns: grid.columns + 1,
        columnWidths: newColWidths,
        cells: [...newCells, newCell]
      }
    });
  };

  function isCellOverlap(cell, updatedCells) {
    // Returns true if the cell would overlap with any other cell in updatedCells
    const occupied = new Set();
    for (const c of updatedCells) {
      if (c.id === cell.id) continue;
      for (let r = c.row; r < c.row + c.rowSpan; r++) {
        for (let col = c.col; col < c.col + c.colSpan; col++) {
          occupied.add(`${r},${col}`);
        }
      }
    }
    // Check the new/edited cell
    for (let r = cell.row; r < cell.row + cell.rowSpan; r++) {
      for (let col = cell.col; col < cell.col + cell.colSpan; col++) {
        if (occupied.has(`${r},${col}`)) return true;
      }
    }
    return false;
  }

  const handleCellPropertyChange = (field, value) => {
    if (!editingCell) return;
    const updatedCell = { ...editingCell, [field]: value };
    
    // Clear systemModel if cell type changes to non-operable
    if (field === 'type' && !shouldShowSystemModelSelector(value)) {
      updatedCell.systemModel = '';
    }
    
    const updatedCells = configuration.grid.cells.map(cell =>
      cell.id === editingCell.id ? updatedCell : cell
    );
    
    if (['rowSpan', 'colSpan', 'row', 'col'].includes(field)) {
      if (isCellOverlap(updatedCell, updatedCells)) {
        setWarning('Cell overlap detected! Change not applied.');
        return;
      } else {
        setWarning('');
      }
    }
    
    // Update cell dimensions to match grid dimensions if width/height changed
    if (field === 'width' || field === 'height') {
      const grid = configuration.grid;
      if (field === 'width' && grid.columnWidths) {
        // Calculate the total width this cell should span
        const totalCellWidth = grid.columnWidths.slice(updatedCell.col, updatedCell.col + updatedCell.colSpan).reduce((sum, width) => sum + width, 0);
        if (Math.abs(value - totalCellWidth) > 0.1) {
          setWarning(`Cell width should match grid columns (${totalCellWidth}"). Adjusting...`);
          updatedCell.width = totalCellWidth;
        }
      }
      if (field === 'height' && grid.rowHeights) {
        // Calculate the total height this cell should span
        const totalCellHeight = grid.rowHeights.slice(updatedCell.row, updatedCell.row + updatedCell.rowSpan).reduce((sum, height) => sum + height, 0);
        if (Math.abs(value - totalCellHeight) > 0.1) {
          setWarning(`Cell height should match grid rows (${totalCellHeight}"). Adjusting...`);
          updatedCell.height = totalCellHeight;
        }
      }
    }
    
    onUpdate({
      grid: {
        ...configuration.grid,
        cells: updatedCells
      }
    });
    setEditingCell(updatedCell);
  };

  const handleGridSizeChange = (type, idx, value) => {
    const arr = [...configuration.grid[type]];
    // Special logic for rowHeights: adjust next row to keep total height constant
    if (type === 'rowHeights') {
      const oldValue = arr[idx];
      const delta = value - oldValue;
      arr[idx] = value;
      if (idx < arr.length - 1) {
        // Adjust the next row
        arr[idx + 1] = Math.max(1, arr[idx + 1] - delta);
      }
    } else if (type === 'columnWidths') {
      // (Optional: similar logic for columns)
      arr[idx] = value;
    } else {
      arr[idx] = value;
    }
    // Validate and ensure consistency
    const updatedGrid = {
      ...configuration.grid,
      [type]: arr
    };
    const validatedGrid = validateGridDimensions(updatedGrid);
    onUpdate({
      grid: validatedGrid
    });
    // Recalculate total dimensions for display
    const totalWidth = type === 'columnWidths' ? arr.reduce((sum, width) => sum + width, 0) : 
                      configuration.grid.columnWidths?.reduce((sum, width) => sum + width, 0) || 0;
    const totalHeight = type === 'rowHeights' ? arr.reduce((sum, height) => sum + height, 0) : 
                       configuration.grid.rowHeights?.reduce((sum, height) => sum + height, 0) || 0;
    console.log(`Updated ${type}[${idx}] to ${value}. Total ${type === 'columnWidths' ? 'width' : 'height'}: ${type === 'columnWidths' ? totalWidth : totalHeight}"`);
  };

  // Helper to get cell by id
  const getCellById = (id) => configuration.grid.cells.find(cell => cell.id === id);

  // Load glass options for a cell
  const loadGlassOptions = async (cell) => {
    if (!cell || !cell.width || !cell.height) return;
    
    try {
      setLoadingGlass(true);
      const glassArea = (cell.width * cell.height) / 144; // Convert to sq ft
      const areaSqm = glassArea * 0.092903; // Convert sq ft to sqm
      
      const data = await glassService.getAllGlassOptions(areaSqm);
      const optionsArray = Object.values(data);
      setGlassOptions(optionsArray);
    } catch (error) {
      console.error('Failed to load glass options:', error);
      setGlassOptions([]);
    } finally {
      setLoadingGlass(false);
    }
  };

  // Handle finish change
  const handleFinishChange = (field) => (event) => {
    if (!editingCell) return;
    
    const updatedCell = { ...editingCell };
    if (!updatedCell.finish) {
      updatedCell.finish = { type: '', color: '', ralColor: '' };
    }
    
    updatedCell.finish[field] = event.target.value;
    
    // Reset color when type changes
    if (field === 'type') {
      updatedCell.finish.color = '';
    }
    
    handleCellPropertyChange('finish', updatedCell.finish);
  };

  // Handle RAL color change
  const handleRalColorChange = (event) => {
    if (!editingCell) return;
    
    const value = event.target.value;
    if (value === '' || (/^\d{0,4}$/.test(value))) {
      const updatedCell = { ...editingCell };
      if (!updatedCell.finish) {
        updatedCell.finish = { type: '', color: '', ralColor: '' };
      }
      updatedCell.finish.ralColor = value;
      handleCellPropertyChange('finish', updatedCell.finish);
    }
  };

  // Handle operation type change
  const handleOperationTypeChange = (event) => {
    if (!editingCell) return;
    handleCellPropertyChange('operationType', event.target.value);
  };

  // Handle glass type change
  const handleGlassTypeChange = (event) => {
    if (!editingCell) return;
    handleCellPropertyChange('glassType', event.target.value);
  };

  // Handle panel configuration
  const handlePanelChange = (index, field, value) => {
    if (!editingCell) return;
    
    const updatedPanels = [...(editingCell.panels || [])];
    if (!updatedPanels[index]) {
      updatedPanels[index] = { width: 0, operationType: 'Fixed' };
    }
    updatedPanels[index][field] = value;
    
    handleCellPropertyChange('panels', updatedPanels);
  };

  // Add panel
  const addPanel = () => {
    if (!editingCell) return;
    
    const updatedPanels = [...(editingCell.panels || []), { width: 0, operationType: 'Fixed' }];
    handleCellPropertyChange('panels', updatedPanels);
  };

  // Remove panel
  const removePanel = (index) => {
    if (!editingCell) return;
    
    const updatedPanels = editingCell.panels.filter((_, i) => i !== index);
    handleCellPropertyChange('panels', updatedPanels);
  };

  // Helper to get selected cell range (rectangular)
  const getSelectedCellRange = () => {
    if (!mergeStartCellId || !mergeEndCellId) return null;
    const start = getCellById(mergeStartCellId);
    const end = getCellById(mergeEndCellId);
    if (!start || !end) return null;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row + start.rowSpan - 1, end.row + end.rowSpan - 1);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col + start.colSpan - 1, end.col + end.colSpan - 1);
    // Get all cells in this range
    const rangeCells = configuration.grid.cells.filter(cell =>
      cell.row >= minRow && cell.row + cell.rowSpan - 1 <= maxRow &&
      cell.col >= minCol && cell.col + cell.colSpan - 1 <= maxCol
    );
    // Only allow merge if all cells are 1x1 and the range is filled
    const expectedCount = (maxRow - minRow + 1) * (maxCol - minCol + 1);
    if (rangeCells.length !== expectedCount) return null;
    if (!rangeCells.every(cell => cell.rowSpan === 1 && cell.colSpan === 1)) return null;
    return { minRow, maxRow, minCol, maxCol, rangeCells };
  };

  // Merge handler
  const handleMergeCells = () => {
    const range = getSelectedCellRange();
    if (!range) return;
    const { minRow, maxRow, minCol, maxCol, rangeCells } = range;
    console.log('Merging cells:', rangeCells.map(c => c.id), 'into', { minRow, maxRow, minCol, maxCol });
    
    // Calculate merged cell dimensions based on grid
    const grid = configuration.grid;
    const mergedWidth = grid.columnWidths ? 
      grid.columnWidths.slice(minCol, maxCol + 1).reduce((sum, width) => sum + width, 0) : 
      (maxCol - minCol + 1) * 36;
    const mergedHeight = grid.rowHeights ? 
      grid.rowHeights.slice(minRow, maxRow + 1).reduce((sum, height) => sum + height, 0) : 
      (maxRow - minRow + 1) * 48;
    
    // Top-left cell becomes merged
    const mergedCell = {
      ...rangeCells[0],
      row: minRow,
      col: minCol,
      rowSpan: maxRow - minRow + 1,
      colSpan: maxCol - minCol + 1,
      width: mergedWidth,
      height: mergedHeight
    };
    
    // Remove all other cells in range
    const newCells = configuration.grid.cells.filter(cell => !rangeCells.includes(cell));
    newCells.push(mergedCell);
    onUpdate({
      grid: {
        ...configuration.grid,
        cells: newCells
      }
    });
    setMergeStartCellId(null);
    setMergeEndCellId(null);
    console.log('Merge complete. New cells:', newCells.map(c => c.id));
    console.log('Merged cell dimensions:', { width: mergedWidth, height: mergedHeight });
  };

  // Unmerge handler
  const handleUnmergeCell = (cellId) => {
    const cell = getCellById(cellId);
    if (!cell || (cell.rowSpan === 1 && cell.colSpan === 1)) return;
    console.log('Unmerging cell:', cellId, 'at', cell.row, cell.col, 'span', cell.rowSpan, cell.colSpan);
    
    // Replace merged cell with 1x1 cells
    const newCells = configuration.grid.cells.filter(c => c.id !== cellId);
    const grid = configuration.grid;
    
    for (let r = 0; r < cell.rowSpan; r++) {
      for (let c = 0; c < cell.colSpan; c++) {
        // Calculate individual cell dimensions based on grid
        const cellWidth = grid.columnWidths ? grid.columnWidths[cell.col + c] : 36;
        const cellHeight = grid.rowHeights ? grid.rowHeights[cell.row + r] : 48;
        
        newCells.push({
          id: `cell-${Date.now()}-${r}-${c}`,
          row: cell.row + r,
          col: cell.col + c,
          rowSpan: 1,
          colSpan: 1,
          width: cellWidth,
          height: cellHeight,
          type: cell.type,
          systemModel: cell.systemModel || '', // Preserve systemModel
          glassType: cell.glassType || '',
          operationType: cell.operationType || '',
          panels: cell.panels || [],
          finish: cell.finish || { type: 'Powder Coated', color: 'Standard', ralColor: '7016' },
          config: { ...cell.config }
        });
      }
    }
    onUpdate({
      grid: {
        ...configuration.grid,
        cells: newCells
      }
    });
    setMergeStartCellId(null);
    setMergeEndCellId(null);
    console.log('Unmerge complete. New cells:', newCells.map(c => c.id));
  };

  // Helper function to validate and ensure grid consistency
  const validateGridDimensions = (grid) => {
    if (!grid) return grid;
    
    const { rows, columns, cells, columnWidths = [], rowHeights = [] } = grid;
    
    // Ensure we have the right number of dimensions
    const safeColWidths = columnWidths.length === columns ? columnWidths : Array(columns).fill(36);
    const safeRowHeights = rowHeights.length === rows ? rowHeights : Array(rows).fill(48);
    
    // Calculate total dimensions
    const totalWidth = safeColWidths.reduce((sum, width) => sum + width, 0);
    const totalHeight = safeRowHeights.reduce((sum, height) => sum + height, 0);
    
    console.log('Grid validation:', {
      rows, columns,
      totalWidth, totalHeight,
      columnWidths: safeColWidths,
      rowHeights: safeRowHeights
    });
    
    return {
      ...grid,
      columnWidths: safeColWidths,
      rowHeights: safeRowHeights
    };
  };

  const handleCreateGrid = () => {
    const rows = Math.max(1, parseInt(setupRows) || 1);
    const columns = Math.max(1, parseInt(setupCols) || 1);
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        cells.push({
          id: `cell-${r}-${c}-${Date.now()}`,
          row: r,
          col: c,
          rowSpan: 1,
          colSpan: 1,
          width: 36,
          height: 48,
          type: 'Unset',
          config: {}
        });
      }
    }
    
    const newGrid = validateGridDimensions({
      rows,
      columns,
      columnWidths: Array(columns).fill(36),
      rowHeights: Array(rows).fill(48),
      cells
    });
    
    onUpdate({
      grid: newGrid
    });
    setMergeStartCellId(null);
    setMergeEndCellId(null);
    setSelectedCellId(null);
  };

  const renderGrid = () => {
    if (!configuration.grid) return null;
    const { rows, columns, cells, columnWidths = [], rowHeights = [] } = configuration.grid;
    // For display, use 1fr units for a clean, proportional look
    const gridStyle = {
      display: 'grid',
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '8px',
      minHeight: '320px',
      minWidth: '320px',
      position: 'relative',
      background: '#f7f9fa',
      border: '1.5px solid #e0e0e0',
      borderRadius: 10,
      padding: 16,
      margin: '0 auto',
      boxShadow: '0 2px 8px 0 rgba(60,60,60,0.04)'
    };
    
    // Highlight merge range
    const mergeRange = getSelectedCellRange();
    if (mergeStartCellId || mergeEndCellId) {
      console.log('Merge selection:', { mergeStartCellId, mergeEndCellId, mergeRange });
    }
    
    return (
      <Box 
        ref={gridRef}
        sx={gridStyle}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {cells.map((cell) => {
          const isSelected = selectedCellId === cell.id;
          const isMergeStart = mergeStartCellId === cell.id;
          const isMergeEnd = mergeEndCellId === cell.id;
          const isInSelectedArea = selectedCells.has(cell.id);
          let isInMergeRange = false;
          if (mergeRange) {
            isInMergeRange =
              cell.row >= mergeRange.minRow && cell.row + cell.rowSpan - 1 <= mergeRange.maxRow &&
              cell.col >= mergeRange.minCol && cell.col + cell.colSpan - 1 <= mergeRange.maxCol;
          }
          
          // Determine background color based on selection state
          let bgColor = 'background.paper';
          if (isInSelectedArea && selectedCells.size > 1) {
            bgColor = 'info.light';
          } else if (isInMergeRange) {
            bgColor = 'warning.light';
          } else if (isSelected) {
            bgColor = 'primary.light';
          }
          
          // Determine border style
          let borderStyle = '1px solid rgba(0, 0, 0, 0.12)';
          if (isMergeStart || isMergeEnd) {
            borderStyle = '2px solid #ff9800';
          } else if (isSelected) {
            borderStyle = '2px solid #1976d2';
          } else if (isInSelectedArea && selectedCells.size > 1) {
            borderStyle = '2px solid #2196f3';
          }
          
          return (
            <Paper
              key={cell.id}
              data-cell-id={cell.id}
              sx={{
                gridRow: `${cell.row + 1} / span ${cell.rowSpan}`,
                gridColumn: `${cell.col + 1} / span ${cell.colSpan}`,
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                minHeight: '64px',
                minWidth: '64px',
                bgcolor: bgColor,
                border: borderStyle,
                boxShadow: isSelected ? 2 : 0,
                cursor: 'pointer',
                userSelect: 'none',
                fontSize: 13,
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 1
                }
              }}
              onMouseDown={(e) => handleMouseDown(cell, e)}
              onClick={(e) => handleCellClick(cell, e)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, width: '100%', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {cell.type !== 'Unset' ? (React.createElement(cellTypes.find(t => t.value === cell.type)?.icon || WindowIcon, { sx: { fontSize: 18 } })) : <ViewModuleIcon sx={{ fontSize: 18, color: 'grey.400' }} />}
                  <Typography variant="body2" fontWeight="medium" sx={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 60 }}>
                    {cell.type !== 'Unset' ? cell.type : 'Unset'}
                  </Typography>
                </Box>
                <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleRemoveCell(cell.id); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ fontSize: 12, lineHeight: 1.2 }}>
                {(() => {
                  // Calculate actual cell dimensions based on grid
                  const grid = configuration.grid;
                  let cellWidth = cell.width || 0;
                  let cellHeight = cell.height || 0;
                  if (grid.columnWidths && grid.rowHeights) {
                    cellWidth = grid.columnWidths.slice(cell.col, cell.col + cell.colSpan).reduce((sum, width) => sum + width, 0);
                    cellHeight = grid.rowHeights.slice(cell.row, cell.row + cell.rowSpan).reduce((sum, height) => sum + height, 0);
                  }
                  return `${cellWidth}" × ${cellHeight}"`;
                })()}
              </Typography>
              
              {/* Show system model for operable cells */}
              {shouldShowSystemModelSelector(cell.type) && cell.systemModel && (
                <Typography variant="caption" color="primary" textAlign="center" sx={{ fontSize: 11, lineHeight: 1.2, fontWeight: 'medium' }}>
                  {cell.systemModel}
                </Typography>
              )}
              
              {/* Show glass type if selected */}
              {cell.glassType && (
                <Typography variant="caption" color="success.main" textAlign="center" sx={{ fontSize: 10, lineHeight: 1.2 }}>
                  {cell.glassType}
                </Typography>
              )}
              
              {/* Show operation type for operable windows */}
              {cell.type === 'Operable Window' && cell.operationType && (
                <Typography variant="caption" color="info.main" textAlign="center" sx={{ fontSize: 10, lineHeight: 1.2 }}>
                  {cell.operationType}
                </Typography>
              )}
              {/* Unmerge button for merged cells */}
              {(cell.rowSpan > 1 || cell.colSpan > 1) && (
                <Button size="small" color="warning" variant="outlined" sx={{ mt: 0.5, fontSize: 11, px: 1, py: 0.2, minHeight: 0, minWidth: 0 }} onClick={e => { e.stopPropagation(); handleUnmergeCell(cell.id); }}>Unmerge</Button>
              )}
            </Paper>
          );
        })}
        
        {/* Selection rectangle overlay */}
        {isDragging && dragStart && dragEnd && (
          <Box
            sx={{
              position: 'absolute',
              border: '2px dashed #2196f3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              pointerEvents: 'none',
              zIndex: 10
            }}
            style={{
              left: `${Math.min(dragStart.col, dragEnd.col) * (100 / columns)}%`,
              top: `${Math.min(dragStart.row, dragEnd.row) * (100 / rows)}%`,
              width: `${(Math.abs(dragEnd.col - dragStart.col) + 1) * (100 / columns)}%`,
              height: `${(Math.abs(dragEnd.row - dragStart.row) + 1) * (100 / rows)}%`
            }}
          />
        )}
        
        {/* Merge button for valid range */}
        {mergeRange && (
          <Button variant="contained" color="warning" sx={{ position: 'absolute', bottom: -48, left: '50%', transform: 'translateX(-50%)' }} onClick={handleMergeCells}>
            Merge Cells ({selectedCells.size} cells)
          </Button>
        )}
      </Box>
    );
  };

  const renderSVGPreview = () => {
    if (!configuration.grid) return null;
    const { rows, columns, columnWidths = [], rowHeights = [], cells } = configuration.grid || {};
    const safeColWidths = columnWidths.length === columns ? columnWidths : Array(columns).fill(36);
    const safeRowHeights = rowHeights.length === rows ? rowHeights : Array(rows).fill(48);

    const totalWidth = safeColWidths.reduce((a, b) => a + b, 0);
    const totalHeight = safeRowHeights.reduce((a, b) => a + b, 0);
    const svgW = 600, svgH = 300;
    const scaleX = svgW / totalWidth;
    const scaleY = svgH / totalHeight;

    const getX = (col) => safeColWidths.slice(0, col).reduce((a, b) => a + b, 0) * scaleX;
    const getY = (row) => safeRowHeights.slice(0, row).reduce((a, b) => a + b, 0) * scaleY;
    const getW = (col, colSpan) => safeColWidths.slice(col, col + colSpan).reduce((a, b) => a + b, 0) * scaleX;
    const getH = (row, rowSpan) => safeRowHeights.slice(row, row + rowSpan).reduce((a, b) => a + b, 0) * scaleY;

    // Draw grid lines
    let gridLines = [];
    let x = 0;
    for (let c = 0; c <= columns; c++) {
      gridLines.push(<line key={`v${c}`} x1={x} y1={0} x2={x} y2={svgH} stroke="#bbb" strokeWidth={1} />);
      x += (safeColWidths[c] || 0) * scaleX;
    }
    let y = 0;
    for (let r = 0; r <= rows; r++) {
      gridLines.push(<line key={`h${r}`} x1={0} y1={y} x2={svgW} y2={y} stroke="#bbb" strokeWidth={1} />);
      y += (safeRowHeights[r] || 0) * scaleY;
    }

    // Draw cells
    const cellRects = cells.map(cell => {
      const x = getX(cell.col);
      const y = getY(cell.row);
      const w = getW(cell.col, cell.colSpan);
      const h = getH(cell.row, cell.rowSpan);
      return (
        <g key={cell.id}>
          <rect x={x} y={y} width={w} height={h} fill="#e3eaff" stroke="#333" strokeWidth={2} rx={6} />
          <text x={x + w/2} y={y + h/2} textAnchor="middle" alignmentBaseline="middle" fontSize={16} fill="#333">
            {cell.type}
          </text>
        </g>
      );
    });

    // Add dimension lines and text
    // Horizontal dimensions (above grid)
    let dimLines = [];
    x = 0;
    for (let c = 0; c < columns; c++) {
      const w = safeColWidths[c] * scaleX;
      // Arrowed line
      dimLines.push(
        <g key={`hdim${c}`}>
          <line x1={x} y1={-18} x2={x + w} y2={-18} stroke="#444" strokeWidth={1.5} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={x + w/2} y={-22} textAnchor="middle" fontSize={13} fill="#222">{safeColWidths[c]}"</text>
        </g>
      );
      x += w;
    }
    // Total width
    if (columns > 1) {
      dimLines.push(
        <g key="htotal">
          <line x1={0} y1={-38} x2={svgW} y2={-38} stroke="#222" strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={svgW/2} y={-42} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#111">{totalWidth}"</text>
        </g>
      );
    }
    // Vertical dimensions (left of grid)
    y = 0;
    for (let r = 0; r < rows; r++) {
      const h = safeRowHeights[r] * scaleY;
      dimLines.push(
        <g key={`vdim${r}`}>
          <line x1={-18} y1={y} x2={-18} y2={y + h} stroke="#444" strokeWidth={1.5} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={-22} y={y + h/2} textAnchor="end" fontSize={13} fill="#222" alignmentBaseline="middle">{safeRowHeights[r]}"</text>
        </g>
      );
      y += h;
    }
    // Total height
    if (rows > 1) {
      dimLines.push(
        <g key="vtotal">
          <line x1={-38} y1={0} x2={-38} y2={svgH} stroke="#222" strokeWidth={2} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <text x={-42} y={svgH/2} textAnchor="end" fontSize={14} fontWeight="bold" fill="#111" alignmentBaseline="middle">{totalHeight}"</text>
        </g>
      );
    }
    // Add marker definitions for arrows
    const svgDefs = (
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,4 L8,2 L8,6 Z" fill="#444" />
        </marker>
      </defs>
    );

    return (
      <svg width={svgW} height={svgH + 50} style={{ border: '1px solid #888', background: '#f8fafd', marginTop: 24, overflow: 'visible' }}>
        {svgDefs}
        <g transform="translate(50,50)">
          {gridLines}
          {cellRects}
          {dimLines}
        </g>
      </svg>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ViewModuleIcon /> Window Wall Configuration
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            label="Rows"
            type="number"
            size="small"
            value={setupRows}
            onChange={e => setSetupRows(e.target.value)}
            sx={{ width: 100 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Columns"
            type="number"
            size="small"
            value={setupCols}
            onChange={e => setSetupCols(e.target.value)}
            sx={{ width: 120 }}
            inputProps={{ min: 1 }}
          />
          <Button variant="contained" onClick={handleCreateGrid}>Create Grid</Button>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          1. Set grid size. 2. Drag to select a rectangular area (e.g., 2x2) to merge cells. 3. Click a cell to assign system type. Press Esc to clear selection.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => {
              setSelectedCells(new Set());
              setMergeStartCellId(null);
              setMergeEndCellId(null);
              setSelectedCellId(null);
            }}
            disabled={selectedCells.size === 0 && !mergeStartCellId && !selectedCellId}
          >
            Clear Selection
          </Button>
          {selectedCells.size > 1 && (
            <Typography variant="caption" color="info.main" sx={{ alignSelf: 'center' }}>
              {selectedCells.size} cells selected - drag to adjust or click "Merge Cells" below
            </Typography>
          )}
        </Box>
        <Box sx={{ mt: 2, position: 'relative' }}>
          {renderGrid()}
        </Box>

        {configuration.grid?.cells && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Grid Summary: {configuration.grid.rows} × {configuration.grid.columns} ({configuration.grid.cells.length} cells)
            </Typography>
            
            {/* Dimension Summary */}
            {configuration.grid.columnWidths && configuration.grid.rowHeights && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Total Dimensions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    Width: {configuration.grid.columnWidths.reduce((sum, width) => sum + width, 0)}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Height: {configuration.grid.rowHeights.reduce((sum, height) => sum + height, 0)}"
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Column widths: {configuration.grid.columnWidths.join('", ')}"
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    Row heights: {configuration.grid.rowHeights.join('", ')}"
                  </Typography>
                </Box>
              </Box>
            )}
            
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {configuration.grid.cells.map((cell) => (
                <Chip
                  key={cell.id}
                  label={`${cell.type} (${cell.row + 1},${cell.col + 1})${shouldShowSystemModelSelector(cell.type) && cell.systemModel ? ` - ${cell.systemModel}` : ''}${cell.glassType ? ` | ${cell.glassType}` : ''}${cell.type === 'Operable Window' && cell.operationType ? ` | ${cell.operationType}` : ''}`}
                  size="small"
                  variant="outlined"
                  icon={React.createElement(cellTypes.find(t => t.value === cell.type)?.icon || WindowIcon)}
                  color={shouldShowSystemModelSelector(cell.type) && cell.systemModel ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {renderSVGPreview()}

      {/* Add Cell Dialog */}
      <Dialog open={addCellDialog} onClose={() => setAddCellDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Cell</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Select the type of system for the new cell:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {cellTypes.map((cellType) => (
              <Grid item xs={6} key={cellType.value}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => handleCellTypeSelect(cellType.value)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    {React.createElement(cellType.icon, { sx: { fontSize: 40, mb: 1 } })}
                    <Typography variant="body2">{cellType.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCellDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 600, p: 3, maxHeight: '100vh', overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>Configure Cell</Typography>
          {editingCell && (
            <>
              {/* Basic Cell Configuration */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon fontSize="small" /> Basic Configuration
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>Cell Type</InputLabel>
                      <Select
                        value={editingCell.type}
                        onChange={e => handleCellPropertyChange('type', e.target.value)}
                        label="Cell Type"
                      >
                        {cellTypes.map((cellType) => (
                          <MenuItem key={cellType.value} value={cellType.value}>{cellType.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    {/* System Model Selector for operable cell types */}
                    {shouldShowSystemModelSelector(editingCell.type) && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          System Type / Model for this {editingCell.type}
                        </Typography>
                        <SystemModelSelector
                          brand={configuration.brand}
                          systemType={editingCell.type === 'Operable Window' ? 'Windows' : 
                                     editingCell.type === 'Entrance Door' ? 'Entrance Doors' : 
                                     editingCell.type === 'Sliding Door' ? 'Sliding Doors' : 'Windows'}
                          systemModel={editingCell.systemModel || ''}
                          onChange={(value) => handleCellPropertyChange('systemModel', value)}
                          metadata={metadata}
                          label="Model"
                          fullWidth={true}
                        />
                      </Box>
                    )}
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Width (inches)"
                          type="number"
                          fullWidth
                          value={editingCell.width}
                          onChange={e => handleCellPropertyChange('width', Math.max(1, parseFloat(e.target.value) || 1))}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Height (inches)"
                          type="number"
                          fullWidth
                          value={editingCell.height}
                          onChange={e => handleCellPropertyChange('height', Math.max(1, parseFloat(e.target.value) || 1))}
                        />
                      </Grid>
                    </Grid>
                    
                    {warning && (
                      <Typography color="error">{warning}</Typography>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Glass Options */}
              {shouldShowSystemModelSelector(editingCell.type) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WindowIcon fontSize="small" /> Glass Options
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Glass Type</InputLabel>
                        <Select
                          value={editingCell.glassType || ''}
                          onChange={handleGlassTypeChange}
                          label="Glass Type"
                          disabled={loadingGlass}
                        >
                          {glassOptions.map((glass) => (
                            <MenuItem key={glass.type} value={glass.type}>
                              {glass.type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {editingCell.glassType && (
                        <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                          <Typography variant="body2">
                            Selected: {editingCell.glassType}
                          </Typography>
                          <Typography variant="caption">
                            Area: {((editingCell.width * editingCell.height) / 144).toFixed(2)} sq ft
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Operation Types for Operable Windows */}
              {editingCell.type === 'Operable Window' && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildIcon fontSize="small" /> Operation Configuration
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <FormControl fullWidth>
                        <InputLabel>Operation Type</InputLabel>
                        <Select
                          value={editingCell.operationType || ''}
                          onChange={handleOperationTypeChange}
                          label="Operation Type"
                        >
                          {metadata?.windowOperables?.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* Panel Configuration for Windows */}
                      {editingCell.operationType && editingCell.operationType !== 'Fixed' && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Panel Configuration
                          </Typography>
                          <Stack spacing={1}>
                            {(editingCell.panels || []).map((panel, index) => (
                              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                  label="Width"
                                  type="number"
                                  size="small"
                                  value={panel.width || 0}
                                  onChange={(e) => handlePanelChange(index, 'width', parseFloat(e.target.value) || 0)}
                                  sx={{ width: 100 }}
                                />
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <InputLabel>Type</InputLabel>
                                  <Select
                                    value={panel.operationType || 'Fixed'}
                                    onChange={(e) => handlePanelChange(index, 'operationType', e.target.value)}
                                    label="Type"
                                  >
                                    {metadata?.windowOperables?.map((type) => (
                                      <MenuItem key={type} value={type}>
                                        {type}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => removePanel(index)}
                                  disabled={editingCell.panels.length <= 1}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ))}
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={addPanel}
                              startIcon={<AddIcon />}
                            >
                              Add Panel
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Finish Options */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ColorLensIcon fontSize="small" /> Finish Options
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Finish Type</InputLabel>
                          <Select
                            value={editingCell.finish?.type || ''}
                            onChange={handleFinishChange('type')}
                            label="Finish Type"
                          >
                            {Object.keys(metadata?.finishOptions || {}).map((finish) => (
                              <MenuItem key={finish} value={finish}>
                                {finish}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Finish Style</InputLabel>
                          <Select
                            value={editingCell.finish?.color || ''}
                            onChange={handleFinishChange('color')}
                            label="Finish Style"
                            disabled={!editingCell.finish?.type}
                          >
                            {editingCell.finish?.type && metadata?.finishOptions?.[editingCell.finish.type]?.map((style) => (
                              <MenuItem key={style} value={style}>
                                {style}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    <TextField
                      label="RAL Color Code (optional)"
                      value={editingCell.finish?.ralColor || ''}
                      onChange={handleRalColorChange}
                      placeholder="e.g., 7016"
                      helperText="Enter a 4-digit RAL color code"
                      inputProps={{ maxLength: 4 }}
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Grid Configuration */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StraightIcon fontSize="small" /> Grid Configuration
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Total Grid Dimensions
                    </Typography>
                    {configuration.grid?.columnWidths && configuration.grid?.rowHeights && (
                      <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="body2" color="primary.main">
                            Width: {configuration.grid.columnWidths.reduce((sum, width) => sum + width, 0)}"
                          </Typography>
                          <Typography variant="body2" color="primary.main">
                            Height: {configuration.grid.rowHeights.reduce((sum, height) => sum + height, 0)}"
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Typography variant="caption">Column Widths (inches):</Typography>
                    <Stack direction="row" spacing={1}>
                      {Array(configuration.grid?.columns || 1).fill(0).map((_, idx) => (
                        <TextField
                          key={idx}
                          type="number"
                          size="small"
                          value={configuration.grid?.columnWidths?.[idx] || 36}
                          onChange={e => handleGridSizeChange('columnWidths', idx, Math.max(1, parseFloat(e.target.value) || 1))}
                          sx={{ width: 60 }}
                          inputProps={{ min: 1, step: 0.5 }}
                        />
                      ))}
                    </Stack>
                    
                    <Typography variant="caption">Row Heights (inches):</Typography>
                    <Stack direction="row" spacing={1}>
                      {Array(configuration.grid?.rows || 1).fill(0).map((_, idx) => (
                        <TextField
                          key={idx}
                          type="number"
                          size="small"
                          value={configuration.grid?.rowHeights?.[idx] || 48}
                          onChange={e => handleGridSizeChange('rowHeights', idx, Math.max(1, parseFloat(e.target.value) || 1))}
                          sx={{ width: 60 }}
                          inputProps={{ min: 1, step: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default WindowWallConfiguration; 