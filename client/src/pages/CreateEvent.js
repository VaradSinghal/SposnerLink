import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Events } from '../services/firestoreService';
import EventIcon from '@mui/icons-material/Event';
import { Grow, Fade, Skeleton } from '@mui/material';
import { FormSkeleton } from '../components/SkeletonLoader';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tech',
    theme: '',
    description: '',
    location: {
      city: '',
      state: '',
      country: '',
      address: '',
    },
    date: {
      startDate: '',
      endDate: '',
    },
    scale: 'medium',
    expectedAttendees: 0,
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
    sponsorshipNeeds: {
      budgetRange: {
        min: 0,
        max: 0,
      },
      categories: [],
      brandingRequirements: [],
      deliverables: [],
    },
    status: 'draft',
  });

  const [interestInput, setInterestInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  const steps = ['Basic Info', 'Location & Date', 'Target Audience', 'Sponsorship Needs'];

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

  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        sponsorshipNeeds: {
          ...prev.sponsorshipNeeds,
          categories: [...prev.sponsorshipNeeds.categories, categoryInput.trim()],
        },
      }));
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      sponsorshipNeeds: {
        ...prev.sponsorshipNeeds,
        categories: prev.sponsorshipNeeds.categories.filter((_, i) => i !== index),
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
      if (!formData.name || !formData.description || !formData.expectedAttendees) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.location.city || !formData.location.country || !formData.date.startDate) {
        setError('Please fill in all required fields');
        return;
      }
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
    if (!formData.name || !formData.description || !formData.expectedAttendees) {
      setError('Please fill in all required fields in Basic Info');
      setActiveStep(0);
      return;
    }
    if (!formData.location.city || !formData.location.country || !formData.date.startDate) {
      setError('Please fill in all required fields in Location & Date');
      setActiveStep(1);
      return;
    }
    
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      if (!user || !user.id) {
        setError('User not found. Please log in again.');
        setLoading(false);
        return;
      }

      const eventData = {
        ...formData,
        organizerId: user.id,
        date: {
          startDate: formData.date.startDate ? new Date(formData.date.startDate).toISOString() : null,
          endDate: formData.date.endDate ? new Date(formData.date.endDate).toISOString() : null,
        },
        status: 'active', // Set to active so it can be matched
      };

      console.log('Creating event with data:', eventData);
      const event = await Events.create(eventData);
      console.log('Created event:', event);
      
      if (!event || !event.id) {
        throw new Error('Event creation failed - no event ID returned');
      }
      
      setSuccess(true);
      
      // Navigate to events page to see the created event
      setTimeout(() => {
        navigate('/events');
      }, 1500);
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.message || 'Failed to create event. Please try again.');
      setLoading(false);
    }
  };

  if (user?.userType !== 'organizer') {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Only organizers can create events</Alert>
      </Container>
    );
  }

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
            <EventIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Create New Event
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the details below to create your event and find matching sponsors
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
            Event created successfully! Finding matching sponsors...
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
                Basic Information
              </Typography>
              <TextField
                fullWidth
                label="Event Name"
                name="name"
                value={formData.name}
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
                select
                label="Event Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                margin="normal"
                required
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
                label="Theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                margin="normal"
                placeholder="e.g., Innovation Summit, Music Festival"
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
                placeholder="Describe your event in detail..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Scale"
                    name="scale"
                    value={formData.scale}
                    onChange={handleChange}
                    margin="normal"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  >
                    <MenuItem value="small">Small (0-100 attendees)</MenuItem>
                    <MenuItem value="medium">Medium (100-1000 attendees)</MenuItem>
                    <MenuItem value="large">Large (1000-10000 attendees)</MenuItem>
                    <MenuItem value="enterprise">Enterprise (10000+ attendees)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expected Attendees"
                    name="expectedAttendees"
                    type="number"
                    value={formData.expectedAttendees}
                    onChange={handleChange}
                    margin="normal"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
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
                Location & Date
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address (Optional)"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    name="date.startDate"
                    type="date"
                    value={formData.date.startDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    name="date.endDate"
                    type="date"
                    value={formData.date.endDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Grid>
              </Grid>
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
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
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
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                Sponsorship Needs
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Budget ($)"
                    name="sponsorshipNeeds.budgetRange.min"
                    type="number"
                    value={formData.sponsorshipNeeds.budgetRange.min}
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
                    name="sponsorshipNeeds.budgetRange.max"
                    type="number"
                    value={formData.sponsorshipNeeds.budgetRange.max}
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
                  Sponsorship Categories
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add category (e.g., title sponsor, food & beverage)"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Button 
                    onClick={handleAddCategory} 
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
                  {formData.sponsorshipNeeds.categories.map((cat, idx) => (
                    <Chip
                      key={idx}
                      label={cat}
                      onDelete={() => handleRemoveCategory(idx)}
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
                disabled={loading}
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
                {loading ? 'Creating...' : 'Create Event'}
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
      </Paper>
      </Fade>
    </Container>
  );
};

export default CreateEvent;
