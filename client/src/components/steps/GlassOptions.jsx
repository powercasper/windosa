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
  TextField,
  AlertTitle
} from '@mui/material';
import {
  CompareArrows as CompareIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  TrendingUp as SavingsIcon,
  Science as AdvancedIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import GlassComparison from '../glass/GlassComparison';
import EnergySavingsSummary from '../glass/EnergySavingsSummary';
import AdvancedGlassTools from '../glass/AdvancedGlassTools';
import GlassRecommendationWizard from '../glass/GlassRecommendationWizard';
import glassService from '../../services/glassService';

// Performance levels for color coding
const performanceLevels = {
  lightLevel: {
    80: { color: '#4caf50', level: 'Excellent' },
    70: { color: '#8bc34a', level: 'Very Good' },
    60: { color: '#ffc107', level: 'Good' },
    50: { color: '#ff9800', level: 'Fair' },
    40: { color: '#f44336', level: 'Poor' }
  },
  solarControl: {
    0.2: { color: '#4caf50', level: 'Excellent' },
    0.3: { color: '#8bc34a', level: 'Very Good' },
    0.4: { color: '#ffc107', level: 'Good' },
    0.5: { color: '#ff9800', level: 'Fair' },
    0.6: { color: '#f44336', level: 'Poor' }
  },
  thermalEfficiency: {
    '0.2 W/m²K': { color: '#4caf50', level: 'Excellent' },
    '0.3 W/m²K': { color: '#8bc34a', level: 'Very Good' },
    '0.4 W/m²K': { color: '#ffc107', level: 'Good' },
    '0.5 W/m²K': { color: '#ff9800', level: 'Fair' },
    '0.6 W/m²K': { color: '#f44336', level: 'Poor' }
  },
  acousticLevel: {
    35: { color: '#4caf50', level: 'Excellent' },
    33: { color: '#8bc34a', level: 'Very Good' },
    30: { color: '#ffc107', level: 'Good' },
    28: { color: '#ff9800', level: 'Fair' },
    25: { color: '#f44336', level: 'Poor' }
  }
};

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
  const isCustomIgu = glass.isCustom;
  
  return (
    <Card
      sx={{
        transition: 'all 0.3s ease-in-out',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        bgcolor: isSelected ? 'primary.light' : (isCustomIgu ? 'warning.light' : 'background.paper'),
        '&:hover': {
          transform: 'scale(1.02)',
          bgcolor: isSelected ? 'primary.light' : (isCustomIgu ? 'warning.light' : 'grey.100'),
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
                  color: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'inherit'),
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
                    bgcolor: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'primary.light'),
                    color: isSelected ? 'primary.main' : (isCustomIgu ? 'warning.main' : 'primary.contrastText'),
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
                color: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'inherit'),
                '&.Mui-checked': {
                  color: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'primary.main')
                }
              }}
            />
          </Box>

          {/* Description */}
          <Typography 
            color={isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'textSecondary')} 
            sx={{ mb: 2, fontSize: '0.9rem' }}
          >
            {isCustomIgu ? 'Custom configured IGU with your selected specifications. Based on SKN 183 performance with custom pricing.' : glass.description}
          </Typography>

          {/* Custom IGU Configuration */}
          {isCustomIgu && glass.iguConfiguration && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                Configuration:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • {glass.iguConfiguration.exteriorCoating !== 'None' ? glass.iguConfiguration.exteriorCoating : 'No coating'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • {glass.iguConfiguration.spacer}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                • {glass.iguConfiguration.interiorGlass}
              </Typography>
            </Box>
          )}

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
          <Box sx={{ mt: 2, pt: 1, borderTop: 1, borderColor: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'divider') }}>
            <Typography 
              variant="subtitle1" 
              sx={{
                color: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'primary.main'),
                fontWeight: isSelected ? 600 : 500,
                textAlign: 'center'
              }}
            >
              {isCustomIgu ? `$${glass.customPrice.toFixed(2)} total` : `$${glass.price.toFixed(2)} per sq ft`}
            </Typography>
            {isCustomIgu && (
              <Typography 
                variant="caption" 
                sx={{
                  color: isSelected ? 'primary.contrastText' : (isCustomIgu ? 'warning.contrastText' : 'text.secondary'),
                  textAlign: 'center',
                  display: 'block',
                  mt: 0.5
                }}
              >
                (${glass.price.toFixed(2)} per sq ft)
              </Typography>
            )}
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
  const [customIguConfigured, setCustomIguConfigured] = useState(false);
  const [iguOptions, setIguOptions] = useState(null);
  const [iguConfig, setIguConfig] = useState(configuration.iguConfig || {
    type: 'Double',
    composition: 'sgg CLIMAPLUS ECLAZ',
    exteriorThickness: 6,
    exteriorCoating: 'None',
    spacer: 'SWISSPACER_AD_GREY',
    interiorGlass: 'PLANITHERM_XN_4MM'
  });

  // Load IGU configuration data from server
  const loadIguConfigurationData = async () => {
    try {
      const data = await glassService.getIguConfigurationData();
      setIguOptions(data);
      
      // Update default configuration if not already set
      if (!configuration.iguConfig) {
        setIguConfig(data.defaultConfiguration);
      }
    } catch (error) {
      console.error('Failed to load IGU configuration data:', error);
      // Fallback to hardcoded data
      setIguOptions({
        basePrice: 27.98,
        exchangeRate: 1.18,
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
      });
    }
  };

  // Effect to handle IGU config changes and calculate price
  useEffect(() => {
    if (!iguOptions || !configuration.dimensions) return;

    const calculatePrice = async () => {
      try {
        const priceData = await glassService.calculateIguPrice(iguConfig, configuration.dimensions);
        
        console.group('IGU Configuration Update');
        console.log('Timestamp:', new Date().toLocaleTimeString());
        console.log('Current Selections:', iguConfig);
        console.log('--- Price Calculation ---');
        console.log(`Base Price: €${priceData.breakdown.basePrice.toFixed(2)}`);
        console.log(`Coating Surcharge: €${priceData.breakdown.coatingSurcharge.toFixed(2)}`);
        console.log(`Spacer Surcharge: €${priceData.breakdown.spacerSurcharge.toFixed(2)}`);
        console.log(`Interior Glass Surcharge: €${priceData.breakdown.interiorSurcharge.toFixed(2)}`);
        console.log('-------------------------');
        console.log(`Total Price per sqm: €${priceData.pricePerSqm.toFixed(2)}`);
        console.log('--- USD Price Calculation ---');
        console.log(`Exchange Rate: 1 EUR = ${iguOptions.exchangeRate} USD`);
        console.log(`Total Square Feet: ${priceData.areaSqFt.toFixed(2)} sq ft`);
        console.log(`Total Square Meters: ${priceData.areaSqm.toFixed(4)} sqm`);
        console.log(`Total EUR Price: €${priceData.totalEurPrice.toFixed(2)}`);
        console.log(`Total USD Price: $${priceData.totalUsdPrice.toFixed(2)}`);
        console.log(`Price per sq ft: $${priceData.pricePerSqFt.toFixed(2)} USD/sq ft`);
        console.log('---------------------------');
        console.groupEnd();

        setCalculatedIguPrice(priceData.totalUsdPrice);
        onUpdate({ iguConfig: { ...iguConfig, calculatedPrice: priceData.pricePerSqm } });
      } catch (error) {
        console.error('Failed to calculate IGU price:', error);
        setCalculatedIguPrice(null);
      }
    };

    calculatePrice();
  }, [iguConfig, configuration.dimensions, iguOptions]);

  // Effect to mark custom IGU as configured when price is calculated
  useEffect(() => {
    setCustomIguConfigured(calculatedIguPrice !== null);
  }, [calculatedIguPrice]);

  // Load IGU configuration data on component mount
  useEffect(() => {
    loadIguConfigurationData();
  }, []);

  const handleIguChange = (event) => {
    const { name, value } = event.target;
    setIguConfig(prev => ({ ...prev, [name]: value }));
  };

  // Load glass options from server
  const loadGlassOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate glass area for area-based pricing
      const glassArea = calculateGlassArea();
      const areaSqm = glassArea * 0.092903; // Convert sq ft to sqm (1 sq ft = 0.092903 sqm)
      
      // Prepare panel info for sliding doors and windows
      let panelInfo = null;
      if ((configuration.systemType === 'Sliding Doors' || configuration.systemType === 'Windows') && configuration.panels) {
        panelInfo = {
          panels: configuration.panels,
          totalWidth: configuration.dimensions.width,
          totalHeight: configuration.dimensions.height
        };
      }
      
      const data = await glassService.getAllGlassOptions(areaSqm, panelInfo);
      
      // Convert object to array for easier handling
      const optionsArray = Object.values(data);
      
      // Add custom IGU option if configured
      if (customIguConfigured && calculatedIguPrice !== null) {
        const customIguOption = {
          id: 'custom-igu',
          productCode: 'Custom IGU',
          type: 'Custom IGU Configuration',
          category: 'Custom Glazing',
          price: calculatedIguPrice / (configuration.dimensions.width * configuration.dimensions.height / 144), // Price per sq ft
          isCustom: true,
          customPrice: calculatedIguPrice,
          iguConfiguration: iguConfig
        };
        optionsArray.unshift(customIguOption); // Add to beginning
      }
      
      setGlassOptions(optionsArray);
      
      console.log(`✅ Loaded ${optionsArray.length} glass options from server`);
      console.log(`📏 Glass area: ${glassArea.toFixed(2)} sq ft (${areaSqm.toFixed(4)} sqm)`);
      if (panelInfo) {
        console.log(`🚪 Panel info: ${panelInfo.panels.length} panels`);
      }
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
  }, [customIguConfigured, calculatedIguPrice]); // Reload when custom IGU changes

  // Get glass by type for detailed information
  const getGlassByType = async (glassType) => {
    try {
      // If it's our custom IGU, use SKN 183 details but with custom price
      if (glassType === 'Custom IGU Configuration') {
        const skn183Details = await glassService.getGlassByType('SKN 183');
        return {
          ...skn183Details,
          type: 'Custom IGU Configuration',
          productCode: 'Custom IGU',
          price: calculatedIguPrice / (configuration.dimensions.width * configuration.dimensions.height / 144),
          customPrice: calculatedIguPrice,
          iguConfiguration: iguConfig,
          isCustom: true
        };
      }
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
  const areaSqm = glassArea * 0.092903; // Convert sq ft to sqm

  // Check if large IGU surcharge applies based on system type
  let largeIguSurcharge = 0;
  let surchargeReason = null;
  
  if ((configuration.systemType === 'Sliding Doors' || configuration.systemType === 'Windows') && configuration.panels) {
    // For sliding doors and windows: check each panel size individually
    const maxPanelAreaSqm = Math.max(...configuration.panels.map(panel => {
      const panelWidthInches = panel.width || (configuration.dimensions.width / configuration.panels.length);
      const panelHeightInches = configuration.dimensions.height;
      const panelAreaSqIn = panelWidthInches * panelHeightInches;
      return panelAreaSqIn * 0.00064516; // Convert to sqm
    }));
    
    if (maxPanelAreaSqm > 6) {
      largeIguSurcharge = 50;
      surchargeReason = `Panel over 6 sqm (${maxPanelAreaSqm.toFixed(2)} sqm)`;
    } else if (maxPanelAreaSqm > 4) {
      largeIguSurcharge = 30;
      surchargeReason = `Panel over 4 sqm (${maxPanelAreaSqm.toFixed(2)} sqm)`;
    }
  } else {
    // For other systems: use total area
    if (areaSqm > 6) {
      largeIguSurcharge = 50;
      surchargeReason = 'Glass over 6 sqm';
    } else if (areaSqm > 4) {
      largeIguSurcharge = 30;
      surchargeReason = 'Glass over 4 sqm';
    }
  }

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

      {/* Large IGU Surcharge Warning */}
      {largeIguSurcharge > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<InfoIcon />}
        >
          <AlertTitle>Large IGU Surcharge Applied</AlertTitle>
          <Typography variant="body2">
            Your glass area is {areaSqm.toFixed(2)} sqm ({glassArea.toFixed(1)} sq ft). 
            A {largeIguSurcharge}% surcharge has been applied due to {surchargeReason?.toLowerCase()}.
          </Typography>
        </Alert>
      )}

      {/* NEW IGU Configurator */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon />
            Custom IGU Configurator
          </Typography>
          <Button 
            onClick={() => setShowIguConfigurator(!showIguConfigurator)}
            endIcon={showIguConfigurator ? <CollapseIcon /> : <ExpandIcon />}
            disabled={!iguOptions}
          >
            {showIguConfigurator ? 'Hide' : 'Show'}
          </Button>
        </Stack>
        <Collapse in={showIguConfigurator}>
          <Divider sx={{ my: 2 }} />
          {!iguOptions ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Loading IGU configuration data...
              </Typography>
            </Box>
          ) : (
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
                    helperText={`Base price: €${iguOptions.basePrice.toFixed(2)} / sqm`}
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
          )}
          
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
    </Box>
  );
};

export default GlassOptions; 