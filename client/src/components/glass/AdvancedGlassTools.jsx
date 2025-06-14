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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Paper,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Science as CalculatorIcon,
  School as EducationIcon,
  FilterAlt as FilterIcon,
  Gavel as ComplianceIcon,
  TrendingUp as PerformanceIcon,
  Lightbulb as TipIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import {
  calculateThermalComfort,
  calculateVisualComfort,
  checkCodeCompliance,
  calculateAnnualPerformance,
  getAdvancedRecommendations,
  buildingCodes
} from '../../utils/performanceCalculators';

import {
  glossary,
  performanceMetrics,
  getTooltipContent,
  getContextualHelp,
  climateGuidance
} from '../../utils/educationalContent';

// Enhanced Tooltip Component
const EducationalTooltip = ({ term, children, placement = "top" }) => {
  const content = getTooltipContent(term);
  
  if (!content) {
    return children;
  }

  return (
    <Tooltip
      title={
        <Box sx={{ p: 1, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {content.term}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {content.shortDescription}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {content.impact}
          </Typography>
        </Box>
      }
      placement={placement}
      arrow
    >
      <Box sx={{ 
        cursor: 'help', 
        borderBottom: '1px dotted',
        borderColor: 'primary.main',
        display: 'inline-block'
      }}>
        {children}
      </Box>
    </Tooltip>
  );
};

// Performance Calculator Tab
const PerformanceCalculatorTab = ({ selectedGlass, glassArea }) => {
  const [conditions, setConditions] = useState({
    interiorTemp: 70,
    exteriorTemp: 32,
    relativeHumidity: 40,
    orientation: 'south',
    climateZone: '4',
    buildingCode: 'IECC_2021'
  });

  const [calculatorType, setCalculatorType] = useState('thermal');

  const thermalComfort = useMemo(() => {
    if (!selectedGlass) return null;
    return calculateThermalComfort(selectedGlass, {
      interiorTemp: conditions.interiorTemp,
      exteriorTemp: conditions.exteriorTemp,
      relativeHumidity: conditions.relativeHumidity,
      glassArea
    });
  }, [selectedGlass, conditions, glassArea]);

  const visualComfort = useMemo(() => {
    if (!selectedGlass) return null;
    return calculateVisualComfort(selectedGlass, {
      orientationFactor: conditions.orientation === 'south' ? 1.0 : 
                        conditions.orientation === 'north' ? 0.5 : 0.7
    });
  }, [selectedGlass, conditions.orientation]);

  const codeCompliance = useMemo(() => {
    if (!selectedGlass) return null;
    return checkCodeCompliance(selectedGlass, {
      code: conditions.buildingCode,
      climateZone: conditions.climateZone
    });
  }, [selectedGlass, conditions.buildingCode, conditions.climateZone]);

  const annualPerformance = useMemo(() => {
    if (!selectedGlass) return null;
    return calculateAnnualPerformance(selectedGlass, {
      glassArea,
      orientation: conditions.orientation,
      climateData: conditions.climateZone <= '2' ? 'hot' : 
                  conditions.climateZone <= '4' ? 'mixed' : 'cold'
    });
  }, [selectedGlass, conditions, glassArea]);

  if (!selectedGlass) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Please select a glass type to see performance calculations.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Control Panel */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculatorIcon />
          Performance Calculator Settings
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Calculator Type</InputLabel>
              <Select
                value={calculatorType}
                label="Calculator Type"
                onChange={(e) => setCalculatorType(e.target.value)}
              >
                <MenuItem value="thermal">Thermal Comfort</MenuItem>
                <MenuItem value="visual">Visual Comfort</MenuItem>
                <MenuItem value="compliance">Code Compliance</MenuItem>
                <MenuItem value="annual">Annual Performance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Building Code</InputLabel>
              <Select
                value={conditions.buildingCode}
                label="Building Code"
                onChange={(e) => setConditions(prev => ({ ...prev, buildingCode: e.target.value }))}
              >
                <MenuItem value="IECC_2021">IECC 2021</MenuItem>
                <MenuItem value="ENERGY_STAR">ENERGY STAR</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Climate Zone</InputLabel>
              <Select
                value={conditions.climateZone}
                label="Climate Zone"
                onChange={(e) => setConditions(prev => ({ ...prev, climateZone: e.target.value }))}
              >
                {Object.keys(buildingCodes[conditions.buildingCode]?.zones || {}).map(zone => (
                  <MenuItem key={zone} value={zone}>
                    Zone {zone}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Window Orientation</InputLabel>
              <Select
                value={conditions.orientation}
                label="Window Orientation"
                onChange={(e) => setConditions(prev => ({ ...prev, orientation: e.target.value }))}
              >
                <MenuItem value="south">South</MenuItem>
                <MenuItem value="north">North</MenuItem>
                <MenuItem value="east">East</MenuItem>
                <MenuItem value="west">West</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Display */}
      {calculatorType === 'thermal' && thermalComfort && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PerformanceIcon />
              Thermal Comfort Analysis
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h4" color="primary.contrastText">
                    {thermalComfort.comfortLevel}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Comfort Level
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <EducationalTooltip term="thermal-comfort">
                      <Typography variant="body2">Interior Surface Temp:</Typography>
                    </EducationalTooltip>
                    <Typography variant="body2" fontWeight="bold">
                      {thermalComfort.interiorSurfaceTemp}°F
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Condensation Risk:</Typography>
                    <Chip 
                      label={thermalComfort.condensationRisk}
                      color={thermalComfort.condensationRisk === 'Low' ? 'success' : 
                            thermalComfort.condensationRisk === 'Medium' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Draft Risk:</Typography>
                    <Chip 
                      label={thermalComfort.draftRisk}
                      color={thermalComfort.draftRisk === 'Low' ? 'success' : 
                            thermalComfort.draftRisk === 'Medium' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {calculatorType === 'compliance' && codeCompliance && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ComplianceIcon />
              Building Code Compliance
            </Typography>
            
            <Alert 
              severity={codeCompliance.compliant ? 'success' : 'warning'}
              sx={{ mb: 2 }}
              icon={codeCompliance.compliant ? <CheckIcon /> : <WarningIcon />}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {codeCompliance.compliant ? 'Code Compliant' : 'Does Not Meet Code Requirements'}
              </Typography>
              <Typography variant="caption">
                {codeCompliance.code} - {codeCompliance.zoneDescription}
              </Typography>
            </Alert>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>U-Factor Compliance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {codeCompliance.uFactorCompliant ? 
                    <CheckIcon color="success" /> : 
                    <WarningIcon color="warning" />
                  }
                  <Typography variant="body2">
                    Current: {codeCompliance.currentValues.uValue} | 
                    Required: ≤ {codeCompliance.requirements.maxUFactor}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (codeCompliance.requirements.maxUFactor / codeCompliance.currentValues.uValue) * 100)}
                  color={codeCompliance.uFactorCompliant ? 'success' : 'warning'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>SHGC Compliance</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {codeCompliance.shgcCompliant ? 
                    <CheckIcon color="success" /> : 
                    <WarningIcon color="warning" />
                  }
                  <Typography variant="body2">
                    Current: {codeCompliance.currentValues.shgc} | 
                    Required: ≤ {codeCompliance.requirements.maxSHGC}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (codeCompliance.requirements.maxSHGC / codeCompliance.currentValues.shgc) * 100)}
                  color={codeCompliance.shgcCompliant ? 'success' : 'warning'}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {calculatorType === 'annual' && annualPerformance && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PerformanceIcon />
              Annual Energy Performance
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="h5" color="error.contrastText">
                    ${annualPerformance.heatingCost}
                  </Typography>
                  <Typography variant="body2" color="error.contrastText">
                    Heating Cost
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="h5" color="warning.contrastText">
                    ${annualPerformance.coolingCost}
                  </Typography>
                  <Typography variant="body2" color="warning.contrastText">
                    Cooling Cost
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h5" color="success.contrastText">
                    ${annualPerformance.lightingSavings}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Lighting Savings
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h5" color="primary.contrastText">
                    ${annualPerformance.totalAnnualCost}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Net Annual Cost
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Educational Content Tab
const EducationalTab = () => {
  const [selectedTopic, setSelectedTopic] = useState('basics');

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <EducationIcon />
        Glass Performance Education
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Topics</Typography>
            <List dense>
              {Object.entries(performanceMetrics).map(([key, metric]) => (
                <ListItem 
                  key={key}
                  button
                  selected={selectedTopic === key}
                  onClick={() => setSelectedTopic(key)}
                >
                  <ListItemText 
                    primary={metric.title}
                    secondary={metric.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={8}>
          {selectedTopic && performanceMetrics[selectedTopic] && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {performanceMetrics[selectedTopic].title}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {performanceMetrics[selectedTopic].whyItMatters}
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Key Factors:
                </Typography>
                <List dense>
                  {performanceMetrics[selectedTopic].factors.map((factor, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={factor} />
                    </ListItem>
                  ))}
                </List>

                <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                  How to Improve:
                </Typography>
                <List dense>
                  {performanceMetrics[selectedTopic].improveWith.map((improvement, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TipIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={improvement} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Advanced Filtering Tab
const AdvancedFilteringTab = ({ allGlassOptions, onFilteredResults }) => {
  const [filters, setFilters] = useState({
    priceRange: [10, 30],
    uFactorMax: 0.5,
    shgcRange: [0.2, 0.8],
    vltMin: 30,
    compliance: '',
    climateZone: '4',
    application: 'residential'
  });

  const filteredGlass = useMemo(() => {
    return allGlassOptions.filter(glass => {
      // Price filter
      if (glass.price < filters.priceRange[0] || glass.price > filters.priceRange[1]) {
        return false;
      }

      // U-Factor filter
      const uFactor = glass.specifications?.thermalTransmission || 0.5;
      if (uFactor > filters.uFactorMax) {
        return false;
      }

      // SHGC filter
      const shgc = glass.specifications?.solarHeatGainCoefficient || 0.6;
      if (shgc < filters.shgcRange[0] || shgc > filters.shgcRange[1]) {
        return false;
      }

      // VLT filter
      const vlt = glass.specifications?.lightTransmittance || 80;
      if (vlt < filters.vltMin) {
        return false;
      }

      // Compliance filter
      if (filters.compliance) {
        const compliance = checkCodeCompliance(glass, {
          code: filters.compliance,
          climateZone: filters.climateZone
        });
        if (!compliance.compliant) {
          return false;
        }
      }

      return true;
    });
  }, [allGlassOptions, filters]);

  React.useEffect(() => {
    onFilteredResults?.(filteredGlass);
  }, [filteredGlass, onFilteredResults]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FilterIcon />
        Advanced Glass Filtering
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Filter Criteria</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]} per sq ft
              </Typography>
              <Slider
                value={filters.priceRange}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue }))}
                valueLabelDisplay="auto"
                min={5}
                max={50}
                step={1}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <EducationalTooltip term="u-factor">
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Maximum U-Factor: {filters.uFactorMax}
                </Typography>
              </EducationalTooltip>
              <Slider
                value={filters.uFactorMax}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, uFactorMax: newValue }))}
                valueLabelDisplay="auto"
                min={0.15}
                max={1.0}
                step={0.05}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <EducationalTooltip term="shgc">
                <Typography variant="body2" sx={{ mb: 1 }}>
                  SHGC Range: {filters.shgcRange[0]} - {filters.shgcRange[1]}
                </Typography>
              </EducationalTooltip>
              <Slider
                value={filters.shgcRange}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, shgcRange: newValue }))}
                valueLabelDisplay="auto"
                min={0.15}
                max={0.9}
                step={0.05}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <EducationalTooltip term="vlt">
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Minimum Light Transmission: {filters.vltMin}%
                </Typography>
              </EducationalTooltip>
              <Slider
                value={filters.vltMin}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, vltMin: newValue }))}
                valueLabelDisplay="auto"
                min={10}
                max={90}
                step={5}
              />
            </Box>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Code Compliance</InputLabel>
              <Select
                value={filters.compliance}
                label="Code Compliance"
                onChange={(e) => setFilters(prev => ({ ...prev, compliance: e.target.value }))}
              >
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="IECC_2021">IECC 2021</MenuItem>
                <MenuItem value="ENERGY_STAR">ENERGY STAR</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setFilters({
                priceRange: [10, 30],
                uFactorMax: 0.5,
                shgcRange: [0.2, 0.8],
                vltMin: 30,
                compliance: '',
                climateZone: '4',
                application: 'residential'
              })}
            >
              Reset Filters
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Filtered Results ({filteredGlass.length} of {allGlassOptions.length} glasses)
          </Typography>
          
          <Grid container spacing={2}>
            {filteredGlass.map((glass) => (
              <Grid item xs={12} sm={6} lg={4} key={glass.id || glass.type}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
                      {glass.productCode || glass.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ${glass.price.toFixed(2)}/sq ft
                    </Typography>
                    
                    {glass.specifications && (
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          U-Factor: {glass.specifications.thermalTransmission}
                        </Typography>
                        <Typography variant="caption">
                          SHGC: {glass.specifications.solarHeatGainCoefficient}
                        </Typography>
                        <Typography variant="caption">
                          Light: {glass.specifications.lightTransmittance}%
                        </Typography>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {filteredGlass.length === 0 && (
            <Alert severity="info">
              No glasses match your current filter criteria. Try adjusting the filters above.
            </Alert>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Main Advanced Glass Tools Component
const AdvancedGlassTools = ({ 
  open, 
  onClose, 
  selectedGlass, 
  allGlassOptions, 
  glassArea 
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [filteredResults, setFilteredResults] = useState([]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{ sx: { height: '95vh' } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Advanced Glass Performance Tools</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalculatorIcon fontSize="small" />
                  Performance Calculator
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon fontSize="small" />
                  Advanced Filtering
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EducationIcon fontSize="small" />
                  Education Center
                </Box>
              } 
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {selectedTab === 0 && (
            <PerformanceCalculatorTab 
              selectedGlass={selectedGlass}
              glassArea={glassArea}
            />
          )}
          
          {selectedTab === 1 && (
            <AdvancedFilteringTab 
              allGlassOptions={allGlassOptions}
              onFilteredResults={setFilteredResults}
            />
          )}
          
          {selectedTab === 2 && (
            <EducationalTab />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          Professional glass performance analysis tools
        </Typography>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedGlassTools; 