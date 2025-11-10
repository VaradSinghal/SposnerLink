import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Brands, Events } from '../services/firestoreService';
import { findMatchesForBrand } from '../services/apiService';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Grow, Fade, Skeleton } from '@mui/material';
import { FormSkeleton } from '../components/SkeletonLoader';

const BrandProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [checkingBrand, setCheckingBrand] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    productServiceType: '',
    description: '',
    website: '',
    targetAudience: {
      ageRange: {
        min: 18,
        max: 65,
      },
      interests: [],
      demographics: {
        gender: '',
        education: '',
        income: '',
      },
    },
    preferredEventCategories: [],
    marketingGoals: [],
    budgetRange: {
      min: 0,
      max: 0,
    },
    preferences: {
      location: {
        cities: [],
        countries: [],
      },
      eventScale: [],
      responseTime: '',
    },
    status: 'active',
  });

  const [interestInput, setInterestInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  const steps = ['Company Info', 'Target Audience', 'Event Preferences', 'Budget & Location'];

  // Check if user has brand profile if userType is not set correctly
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
    // Debug: Log user data
    console.log('BrandProfile - Auth loading:', authLoading);
    console.log('BrandProfile - User data:', user);
    console.log('BrandProfile - User type:', user?.userType);
    
    if (user && user.id) {
      // If userType is brand, allow access immediately
      if (user.userType === 'brand') {
        setHasBrandProfile(true);
        setLoading(false);
        fetchProfile();
      } else {
        // Fallback: Check if user has a brand profile (in case userType is not set correctly)
        // This handles cases where userType might be null/undefined but brand profile exists
        checkBrandProfile();
      }
    } else {
      setLoading(false);
      setHasBrandProfile(false);
    }
  }, [user, authLoading]);

  const checkBrandProfile = async () => {
    setCheckingBrand(true);
    try {
      if (!user || !user.id) {
        setLoading(false);
        setHasBrandProfile(false);
        setCheckingBrand(false);
        return;
      }
      const brand = await Brands.findByUserId(user.id);
      if (brand) {
        // User has a brand profile, allow access
        console.log('BrandProfile - Found brand profile, allowing access');
        setHasBrandProfile(true);
        setLoading(false);
        fetchProfile();
      } else {
        // No brand profile found - but still allow access if userType is brand
        // This allows users to create their brand profile
        if (user.userType === 'brand') {
          setHasBrandProfile(true);
          setLoading(false);
        } else {
          setHasBrandProfile(false);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error checking brand profile:', error);
      // On error, still allow access if userType is brand
      if (user?.userType === 'brand') {
        setHasBrandProfile(true);
        setLoading(false);
      } else {
        setHasBrandProfile(false);
        setLoading(false);
      }
    } finally {
      setCheckingBrand(false);
    }
  };

  const fetchProfile = async () => {
    try {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      const brand = await Brands.findByUserId(user.id);
      if (brand) {
        const profile = {
          companyName: brand.companyName || '',
          productServiceType: brand.productServiceType || '',
          description: brand.description || '',
          website: brand.website || '',
          targetAudience: brand.targetAudience || {
            ageRange: { min: 18, max: 65 },
            interests: [],
            demographics: { gender: '', education: '', income: '' },
          },
          preferredEventCategories: brand.preferredEventCategories || [],
          marketingGoals: brand.marketingGoals || [],
          budgetRange: brand.budgetRange || { min: 0, max: 0 },
          preferences: brand.preferences || {
            location: { cities: [], countries: [] },
            eventScale: [],
            responseTime: '',
          },
          status: brand.status || 'active',
        };
        setProfileData(profile);
        setFormData(profile);
        setIsEditMode(false); // Start in view mode if profile exists
      } else {
        // No brand profile yet, keep default form data
        console.log('No brand profile found, using default form data');
        setProfileData(null);
        setIsEditMode(true); // Start in edit mode if no profile
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load brand profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value,
            },
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((item) => item !== value)
        : [...prev[name], value],
    }));
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          interests: [...prev.targetAudience.interests, interestInput.trim()],
        },
      }));
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (index) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        interests: prev.targetAudience.interests.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddCity = () => {
    if (cityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          location: {
            ...prev.preferences.location,
            cities: [...prev.preferences.location.cities, cityInput.trim()],
          },
        },
      }));
      setCityInput('');
    }
  };

  const handleRemoveCity = (index) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        location: {
          ...prev.preferences.location,
          cities: prev.preferences.location.cities.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Validate current step before moving to next
    if (activeStep === 0) {
      if (!formData.companyName || !formData.productServiceType || !formData.description) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      // Target audience step - no required fields, can proceed
    } else if (activeStep === 2) {
      // Event preferences step - no required fields, can proceed
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate all required fields
    if (!formData.companyName || !formData.productServiceType || !formData.description) {
      setError('Please fill in all required fields in Company Information');
      setActiveStep(0);
      return;
    }
    
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      if (!user || !user.id) {
        setError('User not found. Please log in again.');
        setSaving(false);
        return;
      }

      let brand = await Brands.findByUserId(user.id);
      
      if (!brand) {
        // Create new brand profile
        brand = await Brands.create({
          userId: user.id,
          ...formData
        });
        console.log('Created new brand profile:', brand);
      } else {
        // Update existing brand profile
        brand = await Brands.update(brand.id, formData);
        console.log('Updated brand profile:', brand);
      }

      setSuccess(true);
      setHasBrandProfile(true); // Update state to allow access
      
      // Update profile data and switch to view mode
      setProfileData(formData);
      setIsEditMode(false);
      setActiveStep(0); // Reset to first step
      
      // Automatically find matches after updating profile
      try {
        // Use the brand-specific matching function
        await findMatchesForBrand(brand.id);
        console.log('Found matches for brand:', brand.id);
      } catch (matchError) {
        console.error('Error finding matches:', matchError);
        // Don't fail the save if matching fails
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving brand profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Check if user is a brand or has a brand profile
  // Also allow access if userType is brand (even if no profile exists yet)
  const isBrand = user?.userType === 'brand' || hasBrandProfile;
  
  if (authLoading || loading || checkingBrand) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={24} />
        </Box>
        <FormSkeleton />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Please log in to access this page</Alert>
      </Container>
    );
  }
  
  if (!isBrand && user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body2">
            This page is only accessible to brands. You are currently logged in as an {user.userType || 'unknown'} user.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // Render view mode if profile exists and not in edit mode
  const renderViewMode = () => {
    if (!profileData) return null;

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Brand Profile
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setIsEditMode(true)}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
              },
            }}
          >
            Edit Profile
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {/* Company Information */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon /> Company Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Company Name</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{profileData.companyName || 'Not set'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Product/Service Type</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>{profileData.productServiceType || 'Not set'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>{profileData.description || 'Not set'}</Typography>
            </Grid>
            {profileData.website && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Website</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography
                    variant="body1"
                    component="a"
                    href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {profileData.website}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>

        {/* Target Audience */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon /> Target Audience
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Age Range</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profileData.targetAudience?.ageRange?.min || 18} - {profileData.targetAudience?.ageRange?.max || 65} years
              </Typography>
            </Grid>
            {profileData.targetAudience?.interests && profileData.targetAudience.interests.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>Interests</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.targetAudience.interests.map((interest, idx) => (
                    <Chip
                      key={idx}
                      label={interest}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>

        {/* Event Preferences */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon /> Event Preferences
          </Typography>
          {profileData.preferredEventCategories && profileData.preferredEventCategories.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>Preferred Categories</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.preferredEventCategories.map((category, idx) => (
                  <Chip
                    key={idx}
                    label={category}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          {profileData.marketingGoals && profileData.marketingGoals.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>Marketing Goals</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profileData.marketingGoals.map((goal, idx) => (
                  <Chip
                    key={idx}
                    label={goal}
                    sx={{
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      color: 'white',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Card>

        {/* Budget & Location */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon /> Budget & Location
          </Typography>
          <Grid container spacing={2}>
            {(profileData.budgetRange?.min > 0 || profileData.budgetRange?.max > 0) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Budget Range</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  ${profileData.budgetRange.min.toLocaleString()} - ${profileData.budgetRange.max.toLocaleString()}
                </Typography>
              </Grid>
            )}
            {profileData.preferences?.location?.cities && profileData.preferences.location.cities.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 18 }} /> Preferred Cities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profileData.preferences.location.cities.map((city, idx) => (
                    <Chip
                      key={idx}
                      label={city}
                      sx={{
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        color: 'white',
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </Card>
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={400}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 4,
            background: 'white',
            transition: 'all 0.3s ease',
          }}
        >
        {profileData && !isEditMode ? (
          renderViewMode()
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                {profileData ? 'Edit Brand Profile' : 'Brand Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData ? 'Update your profile information' : 'Complete your profile to discover matching events'}
              </Typography>
            </Box>

        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#667eea',
            },
            '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
              color: '#667eea',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: '#667eea',
            },
            '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
              color: '#667eea',
              fontWeight: 600,
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel 
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: activeStep === steps.indexOf(label) ? 600 : 400,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully! Finding matching events...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {activeStep === 0 && (
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Company Information
              </Typography>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Product/Service Type"
                name="productServiceType"
                value={formData.productServiceType}
                onChange={handleChange}
                margin="normal"
                required
                placeholder="e.g., Software, Food & Beverage, Fashion"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
                placeholder="Describe your company and what you do..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                margin="normal"
                placeholder="https://example.com"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Card>
          )}

          {activeStep === 1 && (
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Target Audience
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Age"
                    name="targetAudience.ageRange.min"
                    type="number"
                    value={formData.targetAudience.ageRange.min}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Age"
                    name="targetAudience.ageRange.max"
                    type="number"
                    value={formData.targetAudience.ageRange.max}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Interests
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add interest (e.g., technology, music, sports)"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button 
                    onClick={handleAddInterest} 
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.targetAudience.interests.map((interest, idx) => (
                    <Chip
                      key={idx}
                      label={interest}
                      onDelete={() => handleRemoveInterest(idx)}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Card>
          )}

          {activeStep === 2 && (
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Event Preferences
              </Typography>
              <TextField
                fullWidth
                select
                SelectProps={{
                  multiple: true,
                  value: formData.preferredEventCategories,
                  onChange: (e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      preferredEventCategories: typeof value === 'string' ? value.split(',') : value,
                    }));
                  },
                }}
                label="Preferred Event Categories"
                margin="normal"
                helperText="Select all that apply"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="tech">Tech</MenuItem>
                <MenuItem value="culture">Culture</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
              <TextField
                fullWidth
                select
                SelectProps={{
                  multiple: true,
                  value: formData.marketingGoals,
                  onChange: (e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      marketingGoals: typeof value === 'string' ? value.split(',') : value,
                    }));
                  },
                }}
                label="Marketing Goals"
                margin="normal"
                helperText="Select all that apply"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="awareness">Awareness</MenuItem>
                <MenuItem value="leadGeneration">Lead Generation</MenuItem>
                <MenuItem value="socialMedia">Social Media</MenuItem>
                <MenuItem value="brandBuilding">Brand Building</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Card>
          )}

          {activeStep === 3 && (
            <Card 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)'
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Budget & Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Budget ($)"
                    name="budgetRange.min"
                    type="number"
                    value={formData.budgetRange.min}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Budget ($)"
                    name="budgetRange.max"
                    type="number"
                    value={formData.budgetRange.max}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Preferred Cities
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add preferred city"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button 
                    onClick={handleAddCity} 
                    variant="contained"
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                      },
                    }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.preferences.location.cities.map((city, idx) => (
                    <Chip
                      key={idx}
                      label={city}
                      onDelete={() => handleRemoveCity(idx)}
                      sx={{
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Card>
          )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
              {profileData && (
                <Button
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData(profileData); // Reset form to saved data
                    setActiveStep(0);
                    setError('');
                  }}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              )}
              {!profileData && <Box />}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="button"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ 
                      textTransform: 'none', 
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
                      },
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                    }}
                  >
                    {saving ? 'Saving...' : profileData ? 'Update Profile' : 'Save Profile & Find Matches'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleNext}
                    sx={{ 
                      textTransform: 'none', 
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                      },
                      borderRadius: 2,
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
          </>
        )}
      </Paper>
      </Fade>
    </Container>
  );
};

export default BrandProfile;
