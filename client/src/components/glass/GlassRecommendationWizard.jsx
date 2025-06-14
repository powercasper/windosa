import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Alert,
  Rating,
  Grid,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Fade,
  Zoom
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Lightbulb as InsightIcon,
  TrendingUp as PerformanceIcon,
  AttachMoney as CostIcon,
  CheckCircle as CheckIcon,
  EmojiObjects as RecommendationIcon,
  Speed as ConfidenceIcon,
  WbSunny as ClimateIcon,
  Business as ApplicationIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const STEPS = [
  {
    label: 'Project Details',
    description: 'Tell us about your project'
  },
  {
    label: 'Requirements',
    description: 'Specify your priorities'
  },
  {
    label: 'AI Recommendations',
    description: 'Get intelligent glass suggestions'
  }
];

const GlassRecommendationWizard = ({ open, onClose, onSelectGlass, systemType: initialSystemType }) => {
  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  
  // Form state
  const [criteria, setCriteria] = useState({
    systemType: initialSystemType || 'Windows',
    climateZone: 'Mixed',
    applicationType: 'Residential',
    budget: 'medium',
    specialRequirements: []
  });

  // Load profiles on component mount
  useEffect(() => {
    if (open) {
      loadProfiles();
    }
  }, [open]);

  const loadProfiles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/recommendations/profiles');
      const data = await response.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch (error) {
      console.error('Failed to load recommendation profiles:', error);
    }
  };

  const handleNext = async () => {
    if (activeStep === STEPS.length - 2) {
      // Generate recommendations before moving to final step
      await generateRecommendations();
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setRecommendations(null);
    setCriteria({
      systemType: initialSystemType || 'Windows',
      climateZone: 'Mixed',
      applicationType: 'Residential',
      budget: 'medium',
      specialRequirements: []
    });
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/recommendations/glass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(criteria)
      });
      
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialRequirementChange = (requirement) => {
    setCriteria(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(requirement)
        ? prev.specialRequirements.filter(r => r !== requirement)
        : [...prev.specialRequirements, requirement]
    }));
  };

  const handleSelectRecommendation = (glass) => {
    onSelectGlass(glass.type);
    onClose();
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 80) return 'Excellent Match';
    if (confidence >= 60) return 'Good Match';
    return 'Possible Match';
  };

  // Step 1: Project Details
  const renderProjectDetails = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Climate Zone</InputLabel>
            <Select
              value={criteria.climateZone}
              label="Climate Zone"
              onChange={(e) => setCriteria(prev => ({ ...prev, climateZone: e.target.value }))}
            >
              {profiles?.climateProfiles.map(profile => (
                <MenuItem key={profile.id} value={profile.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{profile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.priority.join(', ')}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Application Type</InputLabel>
            <Select
              value={criteria.applicationType}
              label="Application Type"
              onChange={(e) => setCriteria(prev => ({ ...prev, applicationType: e.target.value }))}
            >
              {profiles?.applicationProfiles.map(profile => (
                <MenuItem key={profile.id} value={profile.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{profile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {profile.priorities.join(', ')}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Budget Range</InputLabel>
            <Select
              value={criteria.budget}
              label="Budget Range"
              onChange={(e) => setCriteria(prev => ({ ...prev, budget: e.target.value }))}
            >
              {profiles?.budgetOptions.map(option => (
                <MenuItem key={option.id} value={option.id}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.range}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  // Step 2: Requirements
  const renderRequirements = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Special Requirements (Optional)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select any specific performance requirements for your project:
      </Typography>
      
      <FormGroup>
        <Grid container spacing={1}>
          {profiles?.specialRequirements.map(requirement => (
            <Grid item xs={12} sm={6} key={requirement.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={criteria.specialRequirements.includes(requirement.id)}
                    onChange={() => handleSpecialRequirementChange(requirement.id)}
                  />
                }
                label={requirement.name}
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>

      {criteria.specialRequirements.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Requirements:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {criteria.specialRequirements.map(req => {
              const requirement = profiles.specialRequirements.find(r => r.id === req);
              return (
                <Chip
                  key={req}
                  label={requirement?.name}
                  size="small"
                  sx={{ bgcolor: 'primary.contrastText', color: 'primary.main' }}
                />
              );
            })}
          </Stack>
        </Paper>
      )}
    </Box>
  );

  // Step 3: AI Recommendations
  const renderRecommendations = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            🤖 AI Analyzing Your Requirements...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Matching glass options to your specific needs
          </Typography>
        </Box>
      );
    }

    if (!recommendations) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Alert 
          icon={<AIIcon />}
          severity="success" 
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2">
            {recommendations.analysis.summary}
          </Typography>
        </Alert>

        <Grid container spacing={2}>
          {recommendations.recommendations.map((recommendation, index) => (
            <Grid item xs={12} key={recommendation.glass.id}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    border: index === 0 ? 2 : 1,
                    borderColor: index === 0 ? 'primary.main' : 'divider',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  {index === 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: 16,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      🏆 AI TOP CHOICE
                    </Box>
                  )}

                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ mr: 2 }}>
                            {recommendation.glass.type}
                          </Typography>
                          <Chip
                            icon={<ConfidenceIcon />}
                            label={`${recommendation.confidence}% ${getConfidenceLabel(recommendation.confidence)}`}
                            color={getConfidenceColor(recommendation.confidence)}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body1" color="primary" fontWeight="bold" gutterBottom>
                          ${recommendation.glass.price.toFixed(2)} per sq ft
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {recommendation.glass.description}
                        </Typography>

                        <Typography variant="subtitle2" gutterBottom>
                          🎯 Why This Glass Is Perfect:
                        </Typography>
                        <List dense>
                          {recommendation.matchReasons.slice(0, 3).map((reason, idx) => (
                            <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <CheckIcon color="success" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={reason}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          🔬 Performance Highlights:
                        </Typography>
                        <Stack spacing={1}>
                          {recommendation.performanceHighlights.map((highlight, idx) => (
                            <Box key={idx} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {highlight.metric}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {highlight.value}
                              </Typography>
                              <Typography variant="caption">
                                {highlight.description}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>

                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="caption" color="success.contrastText">
                            💰 Investment Analysis
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.contrastText">
                            {recommendation.costBenefit.annualSavings}
                          </Typography>
                          <Typography variant="caption" color="success.contrastText">
                            {recommendation.costBenefit.paybackPeriod}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>

                  <CardActions>
                    <Button
                      variant={index === 0 ? "contained" : "outlined"}
                      color="primary"
                      startIcon={<RecommendationIcon />}
                      onClick={() => handleSelectRecommendation(recommendation.glass)}
                      fullWidth
                    >
                      Select This Glass
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" />
        AI Glass Recommendation Wizard
        <Button
          onClick={onClose}
          sx={{ ml: 'auto' }}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
      </DialogTitle>
      
      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6">{step.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                {index === 0 && renderProjectDetails()}
                {index === 1 && renderRequirements()}
                {index === 2 && renderRecommendations()}
                
                <Box sx={{ mb: 2, mt: 3 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={loading || (index === 0 && !profiles)}
                    >
                      {index === STEPS.length - 1 ? 'Get New Recommendations' : 'Continue'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                    {index === STEPS.length - 1 && (
                      <Button
                        onClick={handleReset}
                        sx={{ mt: 1 }}
                      >
                        Start Over
                      </Button>
                    )}
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
    </Dialog>
  );
};

export default GlassRecommendationWizard; 