import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Events, Brands, Matches, Proposals } from '../services/firestoreService';
import { createMockEvents } from '../utils/mockData';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from 'react-router-dom';
import { Alert, Snackbar, Skeleton, Grow } from '@mui/material';
import { StatsGridSkeleton } from '../components/SkeletonLoader';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingMockEvents, setCreatingMockEvents] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleCreateMockEvents = async () => {
    if (!user || user.userType !== 'organizer') {
      setSnackbar({ open: true, message: 'Only organizers can create events', severity: 'error' });
      return;
    }

    setCreatingMockEvents(true);
    try {
      const results = await createMockEvents(user.id);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        setSnackbar({ 
          open: true, 
          message: `Successfully created ${successCount} mock events!`, 
          severity: 'success' 
        });
        fetchStats(); // Refresh stats
      }

      if (failCount > 0) {
        setSnackbar({ 
          open: true, 
          message: `Created ${successCount} events, but ${failCount} failed. Check console for details.`, 
          severity: 'warning' 
        });
      }
    } catch (error) {
      console.error('Error creating mock events:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to create mock events: ' + error.message, 
        severity: 'error' 
      });
    } finally {
      setCreatingMockEvents(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Ensure we have user and userType
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      const userType = user.userType || 'organizer'; // Default to organizer
      console.log('Dashboard - User:', user);
      console.log('Dashboard - UserType:', userType);

      if (userType === 'organizer') {
        const events = await Events.find({ organizerId: user.id });
        const eventIds = events.map(e => e.id);
        
        let allMatches = [];
        if (eventIds.length > 0) {
          const matchPromises = eventIds.map(eventId => Matches.find({ eventId }));
          const matchResults = await Promise.all(matchPromises);
          allMatches = matchResults.flat();
        }
        
        const proposals = await Proposals.find({ organizerId: user.id });

        setStats({
          totalEvents: events.length,
          activeEvents: events.filter(e => e.status === 'active').length,
          totalMatches: allMatches.length,
          pendingMatches: allMatches.filter(m => m.status === 'pending').length,
          interestedMatches: allMatches.filter(m => m.status === 'interested').length,
          acceptedMatches: allMatches.filter(m => m.status === 'accepted').length,
          totalProposals: proposals.length,
          sentProposals: proposals.filter(p => p.status === 'sent').length,
          acceptedProposals: proposals.filter(p => p.status === 'accepted').length,
          averageRelevanceScore: allMatches.length > 0 
            ? allMatches.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / allMatches.length 
            : 0,
          conversionRate: proposals.length > 0
            ? (proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100
            : 0
        });
      } else if (userType === 'brand') {
        // User is a brand
        const brand = await Brands.findByUserId(user.id);
        if (brand) {
          const matches = await Matches.find({ brandId: brand.id });
          const proposals = await Proposals.find({ brandId: brand.id });

          setStats({
            totalMatches: matches.length,
            viewedMatches: matches.filter(m => m.brandResponse === 'viewed').length,
            interestedMatches: matches.filter(m => m.brandResponse === 'interested').length,
            acceptedMatches: matches.filter(m => m.brandResponse === 'accepted').length,
            totalProposals: proposals.length,
            viewedProposals: proposals.filter(p => p.status === 'viewed').length,
            acceptedProposals: proposals.filter(p => p.status === 'accepted').length,
            averageRelevanceScore: matches.length > 0
              ? matches.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / matches.length
              : 0,
            responseRate: proposals.length > 0
              ? (proposals.filter(p => p.status !== 'draft').length / proposals.length) * 100
              : 0
          });
        } else {
          // Brand user but no profile yet
          setStats({
            totalMatches: 0,
            viewedMatches: 0,
            interestedMatches: 0,
            totalProposals: 0,
            acceptedProposals: 0,
            averageRelevanceScore: 0,
            responseRate: 0
          });
        }
      } else {
        // Unknown userType, default to organizer stats
        console.warn('Dashboard - Unknown userType, defaulting to organizer:', userType);
        const events = await Events.find({ organizerId: user.id });
        setStats({
          totalEvents: events.length,
          activeEvents: events.filter(e => e.status === 'active').length,
          totalMatches: 0,
          pendingMatches: 0,
          interestedMatches: 0,
          acceptedMatches: 0,
          totalProposals: 0,
          sentProposals: 0,
          acceptedProposals: 0,
          averageRelevanceScore: 0,
          conversionRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
        <StatsGridSkeleton />
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {(user?.userType || 'organizer') === 'organizer' 
            ? 'Manage your events and find sponsors'
            : 'Discover events and sponsorship opportunities'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {(user?.userType || 'organizer') === 'organizer' ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={300}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
                  },
                }}>
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Total Events
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalEvents || 0}
                  </Typography>
                </CardContent>
              </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={400}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)',
                  },
                }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom variant="body2">
                      Active Events
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats?.activeEvents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={500}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)',
                  },
                }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom variant="body2">
                      Total Matches
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats?.totalMatches || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={600}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(67, 233, 123, 0.4)',
                  },
                }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom variant="body2">
                      Avg. Match Score
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats?.averageRelevanceScore?.toFixed(1) || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a new event or view your matches
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/events/create"
                      startIcon={<EventIcon />}
                      size="large"
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                        },
                      }}
                    >
                      Create Event
                    </Button>
                    {stats?.totalEvents === 0 && (
                      <Button
                        variant="outlined"
                        onClick={handleCreateMockEvents}
                        disabled={creatingMockEvents}
                        startIcon={<AddCircleIcon />}
                        size="large"
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        {creatingMockEvents ? 'Creating...' : 'Add Sample Events'}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/matches"
                      startIcon={<AutoAwesomeIcon />}
                      size="large"
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      View Matches
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={300}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
                  },
                }}>
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Total Matches
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.totalMatches || 0}
                  </Typography>
                </CardContent>
              </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={400}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)',
                  },
                }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom variant="body2">
                      Viewed Proposals
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats?.viewedProposals || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={500}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)',
                  },
                }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom variant="body2">
                      Avg. Match Score
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats?.averageRelevanceScore?.toFixed(1) || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={600}>
                <Card sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(67, 233, 123, 0.4)',
                  },
                }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom variant="body2">
                      Response Rate
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {stats?.responseRate?.toFixed(1) || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete your profile or discover events
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      component={Link}
                      to="/brand/profile"
                      startIcon={<BusinessIcon />}
                      size="large"
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Update Profile
                    </Button>
                    <Button
                      variant="outlined"
                      component={Link}
                      to="/matches"
                      startIcon={<TrendingUpIcon />}
                      size="large"
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Discover Events
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
