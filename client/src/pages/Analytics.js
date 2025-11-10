import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { Events, Brands, Matches, Proposals } from '../services/firestoreService';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [matchStats, setMatchStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      if (user?.userType === 'organizer') {
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

        // Match stats
        const scoreDistribution = {
          '90-100': allMatches.filter(m => m.relevanceScore >= 90).length,
          '80-89': allMatches.filter(m => m.relevanceScore >= 80 && m.relevanceScore < 90).length,
          '70-79': allMatches.filter(m => m.relevanceScore >= 70 && m.relevanceScore < 80).length,
          '60-69': allMatches.filter(m => m.relevanceScore >= 60 && m.relevanceScore < 70).length,
          '30-59': allMatches.filter(m => m.relevanceScore >= 30 && m.relevanceScore < 60).length
        };

        const statusDistribution = {};
        allMatches.forEach(m => {
          statusDistribution[m.status] = (statusDistribution[m.status] || 0) + 1;
        });

        setMatchStats({ scoreDistribution, statusDistribution, totalMatches: allMatches.length });
      } else {
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

          // Match stats
          const scoreDistribution = {
            '90-100': matches.filter(m => m.relevanceScore >= 90).length,
            '80-89': matches.filter(m => m.relevanceScore >= 80 && m.relevanceScore < 90).length,
            '70-79': matches.filter(m => m.relevanceScore >= 70 && m.relevanceScore < 80).length,
            '60-69': matches.filter(m => m.relevanceScore >= 60 && m.relevanceScore < 70).length,
            '30-59': matches.filter(m => m.relevanceScore >= 30 && m.relevanceScore < 60).length
          };

          const statusDistribution = {};
          matches.forEach(m => {
            statusDistribution[m.status] = (statusDistribution[m.status] || 0) + 1;
          });

          setMatchStats({ scoreDistribution, statusDistribution, totalMatches: matches.length });
        } else {
          setStats({
            totalMatches: 0,
            viewedMatches: 0,
            interestedMatches: 0,
            totalProposals: 0,
            acceptedProposals: 0,
            averageRelevanceScore: 0
          });
          setMatchStats({ scoreDistribution: {}, statusDistribution: {}, totalMatches: 0 });
        }
      }
    } catch (error) {
      setError('Failed to fetch analytics');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={24} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const scoreDistributionData = matchStats?.scoreDistribution
    ? Object.entries(matchStats.scoreDistribution).map(([range, value]) => ({
        range,
        value,
      }))
    : [];

  const statusDistributionData = matchStats?.statusDistribution
    ? Object.entries(matchStats.statusDistribution).map(([status, value]) => ({
        status,
        value,
      }))
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Analytics Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Track your performance and match quality
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {user?.userType === 'organizer' ? (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Grow in timeout={300}>
                <Card sx={{ 
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
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
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
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
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
              <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Conversion Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.conversionRate?.toFixed(1) || 0}%
                  </Typography>
                </CardContent>
              </Card>
              </Grow>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
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
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
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
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Typography color="inherit" gutterBottom variant="body2">
                    Accepted Proposals
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    {stats?.acceptedProposals || 0}
                  </Typography>
                </CardContent>
              </Card>
              </Grow>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
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
          </>
        )}

        {scoreDistributionData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Relevance Score Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {statusDistributionData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Match Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Performance Metrics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Average Relevance Score
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {stats?.averageRelevanceScore?.toFixed(1) || 0}
                  </Typography>
                </Grid>
                {user?.userType === 'organizer' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Pending Matches
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {stats?.pendingMatches || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Interested Matches
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {stats?.interestedMatches || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Accepted Matches
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {stats?.acceptedMatches || 0}
                      </Typography>
                    </Grid>
                  </>
                )}
                {user?.userType === 'brand' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Interested Matches
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {stats?.interestedMatches || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Accepted Matches
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {stats?.acceptedMatches || 0}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
