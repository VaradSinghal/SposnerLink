import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Events } from '../services/firestoreService';
import { format } from 'date-fns';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { EventsGridSkeleton } from '../components/SkeletonLoader';
import { Fade, Grow, Skeleton } from '@mui/material';

const EventsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, location.pathname]); // Refresh when location changes

  // Refresh events when navigating back to this page
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchEvents();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch all events from the database
      const eventsData = await Events.find();
      console.log('Events - Found all events:', eventsData.length);
      setEvents(eventsData || []);
    } catch (error) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      active: 'success',
      matched: 'info',
      completed: 'secondary',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={24} />
        </Box>
        <EventsGridSkeleton count={6} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {(user?.userType || 'organizer') === 'organizer' ? 'My Events' : 'Available Events'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(user?.userType || 'organizer') === 'organizer' 
              ? 'Manage and track your events'
              : 'Discover events that match your brand'}
          </Typography>
        </Box>
        {(user?.userType || 'organizer') === 'organizer' && (
          <Button 
            variant="contained" 
            component={Link} 
            to="/events/create"
            startIcon={<AddCircleIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
              },
              transition: 'all 0.3s ease',
              borderRadius: 2,
              px: 3,
              py: 1.5,
            }}
          >
            Create Event
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        >
          <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            No events yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {(user?.userType || 'organizer') === 'organizer'
              ? 'Create your first event to start finding sponsors!'
              : 'No events available at the moment.'}
          </Typography>
          {(user?.userType || 'organizer') === 'organizer' && (
            <Button
              variant="contained"
              component={Link}
              to="/events/create"
              startIcon={<AddCircleIcon />}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                },
                borderRadius: 2,
              }}
            >
              Create Your First Event
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {events.map((event, index) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Grow in timeout={300 + index * 100}>
                <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Chip 
                      label={event.type} 
                      size="small" 
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={event.status}
                      size="small"
                      color={getStatusColor(event.status)}
                      variant="outlined"
                    />
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                      minHeight: 56,
                    }}
                  >
                    {event.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      minHeight: 60,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {event.description?.substring(0, 150) || 'No description available'}...
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.location?.city || 'TBD'}, {event.location?.country || 'TBD'}
                      </Typography>
                    </Box>
                    {event.date?.startDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(
                            typeof event.date.startDate === 'string' 
                              ? new Date(event.date.startDate) 
                              : (event.date.startDate.toDate ? event.date.startDate.toDate() : new Date(event.date.startDate)),
                            'MMM dd, yyyy'
                          )}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.expectedAttendees || 0} expected attendees
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/events/${event.id}`}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default EventsPage;
