import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import ContactsIcon from '@mui/icons-material/Contacts';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ProjectIcon from '@mui/icons-material/Assignment';

const ClientInformation = ({ clientInfo = {}, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Company Information (optional)
    isCompany: false,
    companyName: '',
    jobTitle: '',
    
    // Project Information
    projectName: '',
    projectType: '',
    preferredContactMethod: 'email',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    
    // Additional Notes
    notes: '',
    
    ...clientInfo
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clientInfo && Object.keys(clientInfo).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...clientInfo,
        address: {
          ...prev.address,
          ...clientInfo.address
        }
      }));
    }
  }, [clientInfo]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value;
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    
    if (formatted.length <= 14) { // Max length for formatted phone
      setFormData(prev => ({ ...prev, phone: formatted }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Company validation if isCompany is true
    if (formData.isCompany && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    // Project validation
    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate(formData);
      onNext();
    }
  };

  const handleSaveAndContinue = () => {
    onUpdate(formData);
  };

  // Auto-save changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onUpdate(formData);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [formData, onUpdate]);

  const formatDisplayName = () => {
    if (formData.isCompany && formData.companyName) {
      return `${formData.companyName} (${formData.firstName} ${formData.lastName})`;
    }
    return `${formData.firstName} ${formData.lastName}`.trim();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Client Information
      </Typography>
      
      <Stack spacing={3}>
        {/* Personal Information Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon /> Personal Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                error={!!errors.phone}
                helperText={errors.phone}
                placeholder="(555) 123-4567"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Preferred Contact Method</InputLabel>
                <Select
                  value={formData.preferredContactMethod}
                  onChange={handleChange('preferredContactMethod')}
                  label="Preferred Contact Method"
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="both">Both Email and Phone</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Company Information Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon /> Company Information
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isCompany}
                  onChange={handleChange('isCompany')}
                />
              }
              label="This is a company project"
            />
          </Box>
          
          {formData.isCompany && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Company Name"
                  required={formData.isCompany}
                  value={formData.companyName}
                  onChange={handleChange('companyName')}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={handleChange('jobTitle')}
                  placeholder="e.g., Project Manager"
                />
              </Grid>
            </Grid>
          )}
          
          {!formData.isCompany && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Enable "Company Project" above if this quote is for a business or organization.
            </Alert>
          )}
        </Paper>

        {/* Project Information Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ProjectIcon /> Project Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Project Name"
                required
                value={formData.projectName}
                onChange={handleChange('projectName')}
                error={!!errors.projectName}
                helperText={errors.projectName}
                placeholder="e.g., Smith Residence, Downtown Office Building"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Project Type</InputLabel>
                <Select
                  value={formData.projectType}
                  onChange={handleChange('projectType')}
                  label="Project Type"
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="residential">Residential</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="industrial">Industrial</MenuItem>
                  <MenuItem value="renovation">Renovation</MenuItem>
                  <MenuItem value="new-construction">New Construction</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Address Information Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon /> Project Address
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={handleChange('address.street')}
                placeholder="123 Main Street"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={handleChange('address.city')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.address.state}
                onChange={handleChange('address.state')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={formData.address.zipCode}
                onChange={handleChange('address.zipCode')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.address.country}
                  onChange={handleChange('address.country')}
                  label="Country"
                >
                  <MenuItem value="United States">United States</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                  <MenuItem value="Mexico">Mexico</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Additional Notes Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactsIcon /> Additional Notes
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Special Requirements or Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Any special requirements, timeline constraints, or additional information..."
            helperText={`${formData.notes.length}/1000 characters`}
            inputProps={{ maxLength: 1000 }}
          />
        </Paper>

        {/* Summary Section */}
        {(formData.firstName || formData.lastName) && (
          <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Quote Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Client:</Typography>
                <Typography variant="body1">{formatDisplayName()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Project:</Typography>
                <Typography variant="body1">{formData.projectName || 'Untitled Project'}</Typography>
              </Grid>
              {formData.email && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1">{formData.email}</Typography>
                </Grid>
              )}
              {formData.phone && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  <Typography variant="body1">{formData.phone}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 4, 
          pt: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)', 
          display: 'flex', 
          justifyContent: 'space-between' 
        }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onBack}
            size="large"
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            size="large"
          >
            Continue to Configuration
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ClientInformation; 