import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Events, Matches, Brands } from '../services/firestoreService';
import { findMatchesForEvent } from '../services/apiService';
import { format } from 'date-fns';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Grow, Fade, Skeleton } from '@mui/material';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [findingMatches, setFindingMatches] = useState(false);
  const [existingMatch, setExistingMatch] = useState(null);
  const [checkingMatch, setCheckingMatch] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      if (user?.userType === 'brand') {
        checkExistingMatch();
      }
    }
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const eventData = await Events.findById(id);
      if (eventData) {
        const populated = await Events.populateOrganizer(eventData);
        setEvent(populated);
      } else {
        setError('Event not found');
      }
    } catch (error) {
      setError('Failed to fetch event details');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingMatch = async () => {
    if (!user?.id || !id) return;
    try {
      setCheckingMatch(true);
      const brand = await Brands.findByUserId(user.id);
      if (brand) {
        const match = await Matches.findByEventAndBrand(id, brand.id);
        setExistingMatch(match);
      }
    } catch (error) {
      console.error('Error checking match:', error);
    } finally {
      setCheckingMatch(false);
    }
  };

  const handleFindMatches = async () => {
    setFindingMatches(true);
    setError('');
    try {
      await findMatchesForEvent(id);
      
      // Update event status
      await Events.update(id, { status: 'active' });
      fetchEvent();
      
      navigate('/matches');
    } catch (error) {
      setError('Failed to find matches: ' + (error.message || 'Unknown error'));
      console.error('Error finding matches:', error);
    } finally {
      setFindingMatches(false);
    }
  };

  const handleViewMatches = () => {
    navigate('/matches');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Event not found'}</Alert>
      </Container>
    );
  }

  const isOwner = user?.userType === 'organizer' && event.organizerId?.id === user?.id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={event.type} 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }} 
            />
            <Chip 
              label={event.status || 'draft'} 
              size="small"
              color={event.status === 'active' ? 'success' : 'default'}
            />
            <Chip 
              label={event.scale} 
              size="small" 
              variant="outlined"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            {event.name}
          </Typography>
          {event.theme && (
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 400 }}>
              {event.theme}
            </Typography>
          )}
        </Box>
        {isOwner && (
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleFindMatches}
            disabled={findingMatches}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {findingMatches ? 'Finding Matches...' : 'Find Sponsors'}
          </Button>
        )}
        {user?.userType === 'brand' && existingMatch && (
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleViewMatches}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                background: 'rgba(102, 126, 234, 0.05)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            View Match Details
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                {event.description}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Event Details
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {event.location?.city || 'TBD'}, {event.location?.country || 'TBD'}
                  </Typography>
                </Grid>
                {event.date?.startDate && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {format(new Date(event.date.startDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Expected Attendees
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {event.expectedAttendees || 0}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Scale
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {event.scale}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {event.targetAudience && (
            <Card sx={{ mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Target Audience
                </Typography>
                {event.targetAudience.ageRange && (
                  <Typography variant="body2" paragraph>
                    <strong>Age Range:</strong> {event.targetAudience.ageRange.min || 'N/A'} - {event.targetAudience.ageRange.max || 'N/A'} years
                  </Typography>
                )}
                {event.targetAudience.interests?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Interests:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {event.targetAudience.interests.map((interest, idx) => (
                        <Chip key={idx} label={interest} size="small" color="primary" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {event.sponsorshipNeeds && (
            <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Sponsorship Needs
                </Typography>
                {event.sponsorshipNeeds.budgetRange && (
                  <Typography variant="body2" paragraph>
                    <strong>Budget Range:</strong> ${event.sponsorshipNeeds.budgetRange.min || 0} - ${event.sponsorshipNeeds.budgetRange.max || 'N/A'}
                  </Typography>
                )}
                {event.sponsorshipNeeds.categories?.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Categories:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {event.sponsorshipNeeds.categories.map((cat, idx) => (
                        <Chip key={idx} label={cat} size="small" color="primary" />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              border: '1px solid rgba(0,0,0,0.05)',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Organizer
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                {event.organizerId?.name || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.organizerId?.email || ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetail;
