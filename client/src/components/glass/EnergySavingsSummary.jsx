import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
  Alert
} from '@mui/material';
import {
  TrendingUp as SavingsIcon,
  Schedule as TimeIcon,
  WbSunny as EcoIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { calculateGlassSavings, formatSavings } from '../../utils/energySavingsCalculator';

const EnergySavingsSummary = ({ 
  selectedGlass, 
  glassArea, 
  climateZone = 'Mixed',
  baselineGlass = null 
}) => {
  // If no baseline provided, create a standard double pane baseline
  const baseline = baselineGlass || {
    type: 'Double Pane',
    price: 12.5,
    specifications: {
      thermalTransmission: 0.5,
      solarHeatGainCoefficient: 0.6
    }
  };

  // Only show savings if we have an enhanced glass selected
  if (!selectedGlass?.specifications || selectedGlass.type === baseline.type) {
    return null;
  }

  const comparison = calculateGlassSavings(baseline, selectedGlass, glassArea, climateZone);
  const savings = formatSavings(comparison.savings);

  // Don't show if savings are minimal or negative
  if (!savings.isPositiveSavings || parseFloat(savings.annual.replace('$', '')) < 50) {
    return null;
  }

  const getPaybackColor = () => {
    const years = parseFloat(savings.paybackPeriod.replace(' years', ''));
    if (years <= 3) return 'success';
    if (years <= 7) return 'warning';
    return 'error';
  };

  const getSavingsLevel = () => {
    const annualSavings = parseFloat(savings.annual.replace('$', ''));
    if (annualSavings >= 200) return { level: 'High', progress: 85, color: '#4caf50' };
    if (annualSavings >= 100) return { level: 'Good', progress: 65, color: '#2196f3' };
    return { level: 'Moderate', progress: 40, color: '#ff9800' };
  };

  const savingsLevel = getSavingsLevel();

  return (
    <Card 
      sx={{ 
        mt: 2,
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%)',
        border: '1px solid',
        borderColor: 'success.light'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EcoIcon sx={{ color: 'success.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.dark' }}>
            Energy Savings with {selectedGlass.productCode || selectedGlass.type}
          </Typography>
          <Chip 
            label={`${savingsLevel.level} Savings`} 
            size="small" 
            sx={{ 
              bgcolor: savingsLevel.color, 
              color: 'white',
              fontSize: '0.7rem'
            }} 
          />
        </Box>

        <Grid container spacing={2} alignItems="center">
          {/* Annual Savings */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main', mb: 0.5 }}>
                {savings.annual}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Annual Energy Savings
              </Typography>
            </Box>
          </Grid>

          {/* Payback Period */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: getPaybackColor() + '.main', mb: 0.5 }}>
                {savings.paybackPeriod}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Payback Period
              </Typography>
            </Box>
          </Grid>

          {/* 10-Year Savings */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                {savings.tenYear}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                10-Year Total Savings
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Savings Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Efficiency Level
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: savingsLevel.color }}>
              {savingsLevel.level}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={savingsLevel.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: savingsLevel.color,
                borderRadius: 3
              }
            }}
          />
        </Box>

        {/* Quick Info */}
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          bgcolor: 'rgba(255,255,255,0.7)', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <InfoIcon sx={{ fontSize: 16, color: 'info.main' }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Based on {glassArea.toFixed(0)} sq ft of glass in a {climateZone.toLowerCase()} climate zone.
              Calculations include heating, cooling, and glass upgrade costs.
            </Typography>
          </Stack>
        </Box>

        {/* Call to Action */}
        {parseFloat(savings.annual.replace('$', '')) >= 150 && (
          <Alert 
            severity="success" 
            sx={{ mt: 2, bgcolor: 'success.light', '& .MuiAlert-message': { fontSize: '0.875rem' } }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Excellent Choice! This glass upgrade pays for itself in {savings.paybackPeriod} and 
              saves you {savings.tenYear} over 10 years.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergySavingsSummary; 