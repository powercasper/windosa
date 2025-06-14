import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Stack,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as SavingsIcon,
  Timeline as PerformanceIcon,
  CompareArrows as CompareIcon,
  Lightbulb as LightIcon,
  Thermostat as ThermalIcon,
  VolumeOff as AcousticIcon,
  WbSunny as SolarIcon,
  EmojiObjects as RecommendIcon
} from '@mui/icons-material';
import { calculateGlassSavings, getGlassRecommendations, formatSavings, climateZones } from '../../utils/energySavingsCalculator';

// Performance bar component
const PerformanceBar = ({ label, value, maxValue, color, unit = '', icon }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight="bold">
          {value}{unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            borderRadius: 4
          }
        }}
      />
    </Box>
  );
};

// Glass comparison card
const GlassComparisonCard = ({ glass, glassArea, savings, isBaseline = false }) => {
  const specs = glass.specifications;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        border: isBaseline ? '2px solid' : '1px solid',
        borderColor: isBaseline ? 'primary.main' : 'divider',
        position: 'relative'
      }}
    >
      {isBaseline && (
        <Chip
          label="Current Selection"
          color="primary"
          size="small"
          sx={{ position: 'absolute', top: -10, left: 16, zIndex: 1 }}
        />
      )}
      
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {glass.productCode || glass.type}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {glass.description}
          </Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
            ${glass.price.toFixed(2)}/sq ft
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Performance Specs */}
        {specs ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Performance Specifications
            </Typography>
            
            <PerformanceBar
              label="Light Transmission"
              value={specs.lightTransmittance}
              maxValue={100}
              color="#4caf50"
              unit="%"
              icon={<LightIcon sx={{ fontSize: 16, color: '#4caf50' }} />}
            />
            
            <PerformanceBar
              label="Solar Control"
              value={Math.round((1 - specs.solarHeatGainCoefficient) * 100)}
              maxValue={100}
              color="#ff9800"
              unit="% blocked"
              icon={<SolarIcon sx={{ fontSize: 16, color: '#ff9800' }} />}
            />
            
            <PerformanceBar
              label="Thermal Efficiency"
              value={Math.round((1 - specs.thermalTransmission) * 100)}
              maxValue={100}
              color="#2196f3"
              unit="% efficient"
              icon={<ThermalIcon sx={{ fontSize: 16, color: '#2196f3' }} />}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <AcousticIcon sx={{ fontSize: 16, color: '#9c27b0' }} />
              <Typography variant="body2" color="text.secondary">
                Acoustic: {specs.acousticValue}dB
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {glass.specs || 'Standard glass specifications'}
            </Typography>
          </Box>
        )}

        {/* Energy Savings */}
        {savings && !isBaseline && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SavingsIcon sx={{ fontSize: 16 }} />
                Energy Savings vs Current
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Annual Savings:</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold" 
                    color={savings.isPositiveSavings ? 'success.main' : 'error.main'}
                  >
                    {savings.isPositiveSavings ? '+' : '-'}{savings.annual}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Payback Period:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {savings.paybackPeriod}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">10-Year Savings:</Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={parseFloat(savings.tenYear.replace('$', '').replace(',', '')) > 0 ? 'success.main' : 'error.main'}
                  >
                    {savings.tenYear}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Recommendations tab content
const RecommendationsTab = ({ recommendations, glassArea, onSelectGlass }) => {
  if (!recommendations?.length) {
    return (
      <Alert severity="info">
        No specific recommendations available. All glass options are displayed for comparison.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Based on your project size ({glassArea.toFixed(0)} sq ft) and climate, here are our top recommendations:
      </Typography>
      
      {recommendations.map((rec, index) => {
        const savings = formatSavings(rec.savings);
        return (
          <Card key={rec.upgrade.glass.id} sx={{ border: index === 0 ? '2px solid' : '1px solid', borderColor: index === 0 ? 'success.main' : 'divider' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {rec.upgrade.glass.productCode || rec.upgrade.glass.type}
                    </Typography>
                    {index === 0 && (
                      <Chip label="Best Choice" color="success" size="small" icon={<RecommendIcon />} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {rec.upgrade.glass.description}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onSelectGlass(rec.upgrade.glass.type)}
                >
                  Select This Glass
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Annual Savings</Typography>
                  <Typography variant="h6" color="success.main">
                    {savings.annual}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Payback</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {savings.paybackPeriod}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">10-Year ROI</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {savings.roiPercentage}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Glass Cost</Typography>
                  <Typography variant="body2">
                    ${rec.upgrade.glass.price.toFixed(2)}/sq ft
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};

const GlassComparison = ({ 
  open, 
  onClose, 
  selectedGlass, 
  allGlassOptions, 
  glassArea,
  onSelectGlass 
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [climateZone, setClimateZone] = useState('Mixed');
  const [compareGlass, setCompareGlass] = useState([]);

  // Get baseline glass (current selection)
  const baselineGlass = selectedGlass || allGlassOptions.find(g => g.type === 'Double Pane') || allGlassOptions[0];
  
  // Calculate savings and recommendations
  const { recommendations } = useMemo(() => {
    return getGlassRecommendations(allGlassOptions, {
      climateZone,
      priority: 'balanced',
      glassArea
    });
  }, [allGlassOptions, climateZone, glassArea]);

  // Initialize comparison glasses
  React.useEffect(() => {
    if (open && compareGlass.length === 0) {
      // Auto-select top 2-3 glasses for comparison
      const topGlasses = recommendations.slice(0, 2).map(r => r.upgrade.glass);
      setCompareGlass([baselineGlass, ...topGlasses]);
    }
  }, [open, recommendations, baselineGlass, compareGlass.length]);

  const handleCompareGlassChange = (event) => {
    const value = event.target.value;
    if (value.length <= 3) { // Limit to 3 glasses
      setCompareGlass(value);
    }
  };

  const calculateComparisonSavings = (glass) => {
    if (glass.id === baselineGlass.id) return null;
    const comparison = calculateGlassSavings(baselineGlass, glass, glassArea, climateZone);
    return formatSavings(comparison.savings);
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareIcon />
          <Typography variant="h6">Glass Performance Comparison</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Climate Zone</InputLabel>
            <Select
              value={climateZone}
              label="Climate Zone"
              onChange={(e) => setClimateZone(e.target.value)}
            >
              {Object.entries(climateZones).map(([key, climate]) => (
                <MenuItem key={key} value={key}>
                  <Tooltip title={climate.description}>
                    <span>{climate.name}</span>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CompareIcon fontSize="small" />
                  Side-by-Side Comparison
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RecommendIcon fontSize="small" />
                  Smart Recommendations
                </Box>
              } 
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <Box>
              {/* Glass Selection for Comparison */}
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Select Glasses to Compare (max 3)</InputLabel>
                  <Select
                    multiple
                    value={compareGlass}
                    onChange={handleCompareGlassChange}
                    renderValue={(selected) => 
                      selected.map(glass => glass.productCode || glass.type).join(', ')
                    }
                  >
                    {allGlassOptions.map((glass) => (
                      <MenuItem key={glass.id || glass.type} value={glass}>
                        {glass.productCode || glass.type} - ${glass.price.toFixed(2)}/sq ft
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Comparison Cards */}
              <Grid container spacing={3}>
                {compareGlass.map((glass) => {
                  const savings = calculateComparisonSavings(glass);
                  const isBaseline = glass.id === baselineGlass.id;
                  
                  return (
                    <Grid item xs={12} md={4} key={glass.id || glass.type}>
                      <GlassComparisonCard
                        glass={glass}
                        glassArea={glassArea}
                        savings={savings}
                        isBaseline={isBaseline}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {selectedTab === 1 && (
            <RecommendationsTab
              recommendations={recommendations}
              glassArea={glassArea}
              onSelectGlass={onSelectGlass}
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Calculations based on {climateZones[climateZone].name} • {glassArea.toFixed(0)} sq ft glass area
        </Typography>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlassComparison; 