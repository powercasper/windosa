import React from 'react';
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
  Stack
} from '@mui/material';
import { 
  glassDatabase, 
  legacyGlassOptions, 
  getAllGlassOptions, 
  getGlassByType,
  performanceLevels 
} from '../../utils/glassDatabase';

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
          {!hasSpecs && (
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
  // Get all glass options (enhanced + legacy for backward compatibility)
  const allGlassOptions = getAllGlassOptions();
  
  const handleGlassSelect = (glassType) => {
    // Get the full glass object for storing detailed information
    const selectedGlass = getGlassByType(glassType);
    
    // Update configuration with glass type and detailed glass object
    onUpdate({ 
      glassType,
      glassDetails: selectedGlass // Store full glass details for PDF generation
    });
    onNext();
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Glass Package
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Choose the glass package that best meets your performance requirements. 
        Higher performance glass provides better energy efficiency and comfort.
      </Typography>

      <Grid container spacing={3}>
        {allGlassOptions.map((glass) => {
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
    </Box>
  );
};

export default GlassOptions; 