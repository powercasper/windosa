import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Radio,
  CardActionArea,
  Paper,
  Chip,
  Divider,
  Tooltip,
  Stack,
  Button,
  Collapse,
  Alert,
  CircularProgress,
  Skeleton,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  TextField
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  TrendingUp as SavingsIcon,
  Science as AdvancedIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  performanceLevels 
} from '../../utils/glassDatabase';
import GlassComparison from '../glass/GlassComparison';
import EnergySavingsSummary from '../glass/EnergySavingsSummary';
import AdvancedGlassTools from '../glass/AdvancedGlassTools';
import GlassRecommendationWizard from '../glass/GlassRecommendationWizard';
import glassService from '../../services/glassService';

// Performance indicator component
const PerformanceIndicator = ({ label, value, level, unit = '', icon }) => {
  const color = performanceLevels[level] ? performanceLevels[level][value]?.color : '#666';
  
  return (
    <Box sx={{ textAlign: 'center', minWidth: '70px' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
        {label}
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          color: color || '#666',
          fontSize: '0.9rem',
          lineHeight: 1.2
        }}
      >
        {icon && <span style={{ marginRight: '2px' }}>{icon}</span>}
        {value}{unit}
      </Typography>
    </Box>
  );
};

// Glass card skeleton for loading state
const GlassCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="80%" height={28} />
          <Skeleton variant="rectangular" width={80} height={20} sx={{ mt: 0.5, borderRadius: 1 }} />
        </Box>
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
      
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={3} key={i}>
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ flexGrow: 1 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ alignSelf: 'center' }} />
    </CardContent>
  </Card>
);

// Enhanced glass card component
const EnhancedGlassCard = ({ glass, isSelected, onSelect }) => {
  const hasSpecs = glass.specifications;
  
  return (
    <Card
      sx={{
        transition: 'all 0.3s ease-in-out',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        bgcolor: isSelected ? 'primary.light' : 'background.paper',
        '&:hover': {
          transform: 'scale(1.02)',
          bgcolor: isSelected ? 'primary.light' : 'grey.100',
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      elevation={isSelected ? 6 : 1}
    >
      <CardActionArea onClick={() => onSelect(glass.type)} sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6"
                sx={{
                  color: isSelected ? 'primary.contrastText' : 'inherit',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '1.1rem',
                  lineHeight: 1.3
                }}
              >
                {glass.productCode ? `${glass.productCode}` : glass.type}
              </Typography>
              {glass.category && (
                <Chip 
                  label={glass.category} 
                  size="small" 
                  sx={{ 
                    mt: 0.5,
                    bgcolor: isSelected ? 'primary.contrastText' : 'primary.light',
                    color: isSelected ? 'primary.main' : 'primary.contrastText',
                    fontSize: '0.7rem'
                  }} 
                />
              )}
            </Box>
            <Radio
              checked={isSelected}
              value={glass.type}
              name="glass-selection"
              sx={{
                color: isSelected ? 'primary.contrastText' : 'inherit',
                '&.Mui-checked': {
                  color: isSelected ? 'primary.contrastText' : 'primary.main'
                }
              }}
            />
          </Box>

          {/* Description */}
          <Typography 
            color={isSelected ? 'primary.contrastText' : 'textSecondary'} 
            sx={{ mb: 2, fontSize: '0.9rem' }}
          >
            {glass.description}
          </Typography>

          {/* Technical Specifications - Only for enhanced glass */}
          {hasSpecs && (
            <>
              <Divider sx={{ my: 1, bgcolor: isSelected ? 'primary.contrastText' : 'divider' }} />
              
              {/* Key Performance Indicators */}
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 1, 
                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  Performance Specifications
                </Typography>
                
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={3}>
                    <Tooltip title="Light Transmittance - Visible light passing through">
                      <Box>
                        <PerformanceIndicator 
                          label="Light" 
                          value={glass.specifications.lightTransmittance} 
                          unit="%" 
                          level="lightLevel"
                          icon="☀️"
                        />
                      </Box>
                    </Tooltip>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Tooltip title="Solar Heat Gain Coefficient - Solar energy transmission">
                      <Box>
                        <PerformanceIndicator 
                          label="Solar" 
                          value={glass.specifications.solarHeatGainCoefficient} 
                          level="solarControl"
                          icon="🔥"
                        />
                      </Box>
                    </Tooltip>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Tooltip title="Thermal Transmission - Heat transfer rate">
                      <Box>
                        <PerformanceIndicator 
                          label="Thermal" 
                          value={glass.specifications.thermalTransmission} 
                          level="thermalEfficiency"
                          icon="🌡️"
                        />
                      </Box>
                    </Tooltip>
                  </Grid>
                  
                  <Grid item xs={3}>
                    <Tooltip title="Acoustic Rating - Sound reduction performance">
                      <Box>
                        <PerformanceIndicator 
                          label="Acoustic" 
                          value={glass.specifications.acousticValue} 
                          unit="dB"
                          level="acousticLevel"
                          icon="🔇"
                        />
                      </Box>
                    </Tooltip>
                  </Grid>
                </Grid>

                {/* Construction Details */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: isSelected ? 'primary.contrastText' : 'text.secondary',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}
                >
                  {glass.specifications.construction}
                </Typography>
              </Box>
            </>
          )}

          {/* Standard specifications for legacy glass */}
          {!hasSpecs && glass.specs && (
            <>
              <Typography 
                variant="body2" 
                color={isSelected ? 'primary.contrastText' : 'textSecondary'}
                sx={{ mb: 1 }}
              >
                Specifications: {glass.specs}
              </Typography>
            </>
          )}

          {/* Spacer to push price to bottom */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Price */}
          <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: isSelected ? 'primary.contrastText' : 'divider' }}>
            <Typography 
              variant="subtitle1" 
              sx={{
                color: isSelected ? 'primary.contrastText' : 'primary.main',
                fontWeight: isSelected ? 600 : 500,
                textAlign: 'center'
              }}
            >
              ${glass.price.toFixed(2)} per sq ft
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const GlassOptions = ({ configuration, onUpdate, onNext }) => {
  // State management for server-side data
  const [glassOptions, setGlassOptions] = useState([]);
  const [selectedGlass, setSelectedGlass] = useState(configuration.glassType || '');
  const [comparisonList, setComparisonList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for comparison and energy savings
  const [showEnergySavings, setShowEnergySavings] = useState(false);
  const [showRecommendationWizard, setShowRecommendationWizard] = useState(false);
  
  // State for the new IGU configurator
  const [showIguConfigurator, setShowIguConfigurator] = useState(false);
  const [calculatedIguPrice, setCalculatedIguPrice] = useState(null);
  const [iguConfig, setIguConfig] = useState(configuration.iguConfig || {
    type: 'Double',
    composition: 'sgg CLIMAPLUS ECLAZ',
    exteriorThickness: 6,
    exteriorCoating: 'None',
    spacer: 'SWISSPACER_AD_GREY',
    interiorGlass: 'PLANITHERM_XN_4MM'
  });

  const iguOptions = {
    exteriorCoatings: [
      { id: 'None', name: 'None', surcharge: 0 },
      { id: 'SKN_165', name: 'Cool-Lite SKN 165', surcharge: 36.35 },
      { id: 'SKN_176', name: 'Cool-Lite SKN 176', surcharge: 36.35 },
      { id: 'SKN_183', name: 'Cool-Lite SKN 183', surcharge: 36.35 },
      { id: 'XTREME_61_29', name: 'Cool-Lite XTREME 61/29', surcharge: 37.85 },
      { id: 'XTREME_70_33', name: 'Cool-Lite XTREME 70/33', surcharge: 37.85 },
    ],
    spacers: [
      { id: 'SWISSPACER_AD_GREY', name: 'SWISSPACER AD: titan-grey; black', surcharge: 1.50 },
      { id: 'SWISSPACER_AD_BROWN', name: 'SWISSPACER AD: light brown, dark brown, white', surcharge: 2.50 },
      { id: 'SWISSPACER_ULTIMATE_GREY', name: 'SWISSPACER ULTIMATE: titan-grey; black', surcharge: 2.50 },
    ],
    interiorGlass: [
      { id: 'PLANITHERM_XN_4MM', name: 'PLANITHERM XN 4mm (Ug=1.1)', surcharge: 20.72 },
      { id: 'PLANITHERM_XN_6MM', name: 'PLANITHERM XN 6mm (Ug=1.1)', surcharge: 28.34 },
      { id: 'PLANITHERM_XN_8MM', name: 'PLANITHERM XN 8mm (Ug=1.1)', surcharge: 38.86 },
      { id: 'PLANITHERM_XN_10MM', name: 'PLANITHERM XN 10mm (Ug=1.1)', surcharge: 38.48 },
      { id: 'PLANITHERM_ONE_4MM', name: 'PLANITHERM ONE 4mm (Ug=1.0)', surcharge: 39.99 },
      { id: 'PLANITHERM_ONE_6MM', name: 'PLANITHERM ONE 6mm (Ug=1.0)', surcharge: 43.32 },
    ]
  };

  // Effect to handle IGU config changes and log them
  useEffect(() => {
    const basePrice = 27.98;
    const coatingSurcharge = iguOptions.exteriorCoatings.find(c => c.id === iguConfig.exteriorCoating)?.surcharge || 0;
    const spacerSurcharge = iguOptions.spacers.find(s => s.id === iguConfig.spacer)?.surcharge || 0;
    const interiorSurcharge = iguOptions.interiorGlass.find(g => g.id === iguConfig.interiorGlass)?.surcharge || 0;
    
    const totalSqmPrice = basePrice + coatingSurcharge + spacerSurcharge + interiorSurcharge;

    console.group('IGU Configuration Update');
    console.log('Timestamp:', new Date().toLocaleTimeString());
    console.log('Current Selections:', iguConfig);
    console.log('--- Price Calculation ---');
    console.log(`Base Price: €${basePrice.toFixed(2)}`);
    console.log(`Coating Surcharge: €${coatingSurcharge.toFixed(2)}`);
    console.log(`Spacer Surcharge: €${spacerSurcharge.toFixed(2)}`);
    console.log(`Interior Glass Surcharge: €${interiorSurcharge.toFixed(2)}`);
    console.log('-------------------------');
    console.log(`Total Price per sqm: €${totalSqmPrice.toFixed(2)}`);
    console.groupEnd();

    onUpdate({ iguConfig: { ...iguConfig, calculatedPrice: totalSqmPrice } });

    // Calculate price in USD
    if (configuration.dimensions && configuration.dimensions.width > 0 && configuration.dimensions.height > 0) {
      const { width, height } = configuration.dimensions;
      // Dimensions are in inches, convert to sqm
      const areaSqIn = width * height;
      const areaSqm = areaSqIn * 0.00064516; // 1 sq inch = 0.00064516 sqm
      
      const totalEurPrice = areaSqm * totalSqmPrice;
      const totalUsdPrice = totalEurPrice * 1.18; // Exchange rate: 1 EUR = 1.18 USD
      
      console.log('--- USD Price Calculation ---');
      console.log(`Exchange Rate: 1 EUR = 1.18 USD`);
      console.log(`Total Square Feet: ${(areaSqIn / 144).toFixed(2)} sq ft`);
      console.log(`Total Square Meters: ${areaSqm.toFixed(4)} sqm`);
      console.log(`Total EUR Price: €${totalEurPrice.toFixed(2)}`);
      console.log(`Total USD Price: $${totalUsdPrice.toFixed(2)}`);
      console.log(`Price per sq ft: $${(totalUsdPrice / (areaSqIn / 144)).toFixed(2)} USD/sq ft`);
      console.log('---------------------------');
      
      setCalculatedIguPrice(totalUsdPrice);
    } else {
      setCalculatedIguPrice(null);
    }

  }, [iguConfig, configuration.dimensions]);

  const handleIguChange = (event) => {
    const { name, value } = event.target;
    setIguConfig(prev => ({ ...prev, [name]: value }));
  };

  // Load glass options from server
  const loadGlassOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await glassService.getAllGlassOptions();
      
      // Convert object to array for easier handling
      const optionsArray = Object.values(data);
      setGlassOptions(optionsArray);
      
      console.log(`✅ Loaded ${optionsArray.length} glass options from server`);
      if (data.fallback) {
        console.warn('⚠️ Using fallback glass data');
      }
    } catch (err) {
      console.error('❌ Failed to load glass options:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadGlassOptions();
  }, []);

  // Get glass by type for detailed information
  const getGlassByType = async (glassType) => {
    try {
      return await glassService.getGlassByType(glassType);
    } catch (err) {
      console.warn('Failed to get glass details, using local data:', err);
      return glassOptions.find(g => g.type === glassType) || null;
    }
  };

  const handleGlassSelect = async (glassType) => {
    // Get the full glass object for storing detailed information
    const selectedGlass = await getGlassByType(glassType);
    
    // Update configuration with glass type and detailed glass object
    onUpdate({ 
      glassType,
      glassDetails: selectedGlass // Store full glass details for PDF generation
    });
    onNext();
  };

  const handleCompareGlass = async (glassType) => {
    // Select glass but don't proceed to next step
    const selectedGlass = await getGlassByType(glassType);
    onUpdate({ 
      glassType,
      glassDetails: selectedGlass
    });
    // Don't call onNext() - stay on this step for comparison
  };

  if (!configuration.systemModel) {
    return (
      <Typography color="error">
        Please complete the system configuration first
      </Typography>
    );
  }

  // Calculate total glass area based on system type
  const calculateGlassArea = () => {
    if (configuration.systemType === 'Windows' && configuration.panels) {
      const totalWidth = configuration.panels.reduce((sum, panel) => sum + panel.width, 0);
      return (totalWidth * configuration.dimensions.height) / 144;
    } else if (configuration.systemType === 'Entrance Doors') {
      const totalWidth = (configuration.leftSidelight?.enabled ? configuration.leftSidelight.width : 0) + 
                        configuration.dimensions.width + 
                        (configuration.rightSidelight?.enabled ? configuration.rightSidelight.width : 0);
      const totalHeight = configuration.dimensions.height + 
                         (configuration.transom?.enabled ? configuration.transom.height : 0);
      return (totalWidth * totalHeight) / 144;
    } else if (configuration.systemType === 'Sliding Doors') {
      return (configuration.dimensions.width * configuration.dimensions.height) / 144;
    }
    return (configuration.dimensions.width * configuration.dimensions.height) / 144;
  };

  const glassArea = calculateGlassArea();

  // Error state
  if (error && !loading && glassOptions.length === 0) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Select Glass Package
        </Typography>
        
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
        >
          Failed to load glass options: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Glass Package
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Choose the glass package that best meets your performance requirements. 
        Higher performance glass provides better energy efficiency and comfort.
      </Typography>

      {/* Loading or Error States */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <GlassCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Show any errors while still displaying data */}
      {error && !loading && glassOptions.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
        >
          Using cached data. Server connection issue: {error}
        </Alert>
      )}

      {/* Glass Options Grid */}
      {!loading && glassOptions.length > 0 && (
        <Grid container spacing={3}>
          {glassOptions.map((glass) => {
            const isSelected = configuration.glassType === glass.type;
            return (
              <Grid item xs={12} sm={6} lg={4} key={glass.type || glass.id}>
                <EnhancedGlassCard 
                  glass={glass}
                  isSelected={isSelected}
                  onSelect={handleGlassSelect}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Comparison and Energy Savings Tools */}
      {!loading && glassOptions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => setShowRecommendationWizard(true)}
              sx={{ borderRadius: 2 }}
              color="primary"
            >
              🤖 AI Glass Wizard
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CompareIcon />}
              onClick={() => setShowComparison(true)}
              sx={{ borderRadius: 2 }}
            >
              Compare Glass Options
            </Button>
            
            {configuration.glassType && (
              <Button
                variant={showEnergySavings ? "contained" : "outlined"}
                startIcon={<SavingsIcon />}
                onClick={() => setShowEnergySavings(!showEnergySavings)}
                sx={{ borderRadius: 2 }}
                color="success"
              >
                {showEnergySavings ? 'Hide' : 'Show'} Energy Savings
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<AdvancedIcon />}
              onClick={() => setShowAdvancedTools(true)}
              sx={{ borderRadius: 2 }}
              color="info"
            >
              Advanced Tools
            </Button>
          </Stack>

          {/* Energy Savings Summary */}
          <Collapse in={showEnergySavings && configuration.glassType}>
            <EnergySavingsSummary
              selectedGlass={configuration.glassDetails}
              glassArea={glassArea}
              climateZone="Mixed" // Could be enhanced to detect user's climate zone
            />
          </Collapse>
        </Box>
      )}

      {/* Selected Glass Summary */}
      {configuration.glassType && (
        <Paper sx={{ mt: 3, p: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="h6">
                Selected: {configuration.glassType}
              </Typography>
              <Typography variant="body2">
                Total Glass Area: {glassArea.toFixed(2)} sq ft
              </Typography>
            </Box>
            
            {configuration.glassDetails?.specifications && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Key Specifications:
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Light: {configuration.glassDetails.specifications.lightTransmittance}%
                  </Typography>
                  <Typography variant="body2">
                    Solar: {configuration.glassDetails.specifications.solarHeatGainCoefficient}
                  </Typography>
                  <Typography variant="body2">
                    Thermal: {configuration.glassDetails.specifications.thermalTransmission}
                  </Typography>
                  <Typography variant="body2">
                    Acoustic: {configuration.glassDetails.specifications.acousticValue}dB
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>
      )}

      {/* Glass Comparison Dialog */}
      <GlassComparison
        open={showComparison}
        onClose={() => setShowComparison(false)}
        selectedGlass={configuration.glassDetails}
        allGlassOptions={glassOptions}
        glassArea={glassArea}
        onSelectGlass={handleCompareGlass}
      />

      {/* Advanced Glass Tools Dialog */}
      <AdvancedGlassTools
        open={showAdvancedTools}
        onClose={() => setShowAdvancedTools(false)}
        selectedGlass={configuration.glassDetails}
        allGlassOptions={glassOptions}
        glassArea={glassArea}
      />

      {/* AI Glass Recommendation Wizard */}
      <GlassRecommendationWizard
        open={showRecommendationWizard}
        onClose={() => setShowRecommendationWizard(false)}
        onSelectGlass={handleGlassSelect}
        systemType={configuration.systemType}
      />

      {/* NEW IGU Configurator */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Custom IGU Configurator
          </Typography>
          <Button 
            onClick={() => setShowIguConfigurator(!showIguConfigurator)}
            endIcon={showIguConfigurator ? <CollapseIcon /> : <ExpandIcon />}
          >
            {showIguConfigurator ? 'Hide' : 'Show'}
          </Button>
        </Stack>
        <Collapse in={showIguConfigurator}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Column 1: IGU Type and Composition */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">1. IGU Type</FormLabel>
                  <RadioGroup row name="type" value={iguConfig.type} onChange={handleIguChange}>
                    <FormControlLabel value="Double" control={<Radio />} label="Double Unit" />
                    <FormControlLabel value="Triple" control={<Radio />} label="Triple Unit" />
                  </RadioGroup>
                </FormControl>
                <TextField
                  label="2. Base Composition"
                  value={iguConfig.composition}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                  helperText="Base price: €27.98 / sqm"
                />
                <TextField
                  label="3. Exterior Glass Thickness"
                  value={`${iguConfig.exteriorThickness}mm`}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                  helperText="Auto-calculated based on dimensions"
                />
              </Stack>
            </Grid>
            {/* Column 2: Selections */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel id="exterior-coating-label">4. Exterior Coating</InputLabel>
                  <Select
                    labelId="exterior-coating-label"
                    name="exteriorCoating"
                    value={iguConfig.exteriorCoating}
                    label="4. Exterior Coating"
                    onChange={handleIguChange}
                  >
                    {iguOptions.exteriorCoatings.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name} (+€{option.surcharge.toFixed(2)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="spacer-label">5. Spacer</InputLabel>
                  <Select
                    labelId="spacer-label"
                    name="spacer"
                    value={iguConfig.spacer}
                    label="5. Spacer"
                    onChange={handleIguChange}
                  >
                    {iguOptions.spacers.map(option => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name} (+€{option.surcharge.toFixed(2)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            {/* Column 3: Interior Glass */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="interior-glass-label">6. Interior Glass</InputLabel>
                <Select
                  labelId="interior-glass-label"
                  name="interiorGlass"
                  value={iguConfig.interiorGlass}
                  label="6. Interior Glass"
                  onChange={handleIguChange}
                >
                  {iguOptions.interiorGlass.map(option => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name} (+€{option.surcharge.toFixed(2)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {calculatedIguPrice !== null && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1, backgroundColor: 'grey.100' }}>
              <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 'bold' }}>
                Estimated Custom IGU Cost: ${calculatedIguPrice.toFixed(2)} USD
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This price is an estimate for the custom IGU based on your configuration and system dimensions ({configuration.dimensions.width}" x {configuration.dimensions.height}"). Final price may vary.
              </Typography>
            </Box>
          )}

        </Collapse>
      </Paper>
    </Box>
  );
};

export default GlassOptions; 