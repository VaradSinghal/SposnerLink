import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Fade,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CampaignIcon from '@mui/icons-material/Campaign';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze compatibility using semantic similarity, audience overlap, and historical data to find perfect matches.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: 'Lightning Fast',
      description: 'Get matched with relevant sponsors or events in minutes, not weeks. Save hours of manual research and outreach.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
      title: 'Auto Proposals',
      description: 'Generate professional sponsorship proposals automatically with AI-powered content generation tailored to each match.',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
      title: 'Smart Analytics',
      description: 'Track your performance with detailed analytics, match quality scores, and conversion rates to optimize your strategy.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  const benefits = [
    {
      title: 'For Event Organizers',
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      points: [
        'Find sponsors that match your audience',
        'Generate professional proposals instantly',
        'Track match quality and success rates',
        'Save time on manual outreach',
      ],
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'For Brands & Sponsors',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      points: [
        'Discover events aligned with your goals',
        'Get matched with relevant opportunities',
        'Access detailed event analytics',
        'One-click connect with organizers',
      ],
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Events', icon: <EventIcon /> },
    { number: '5K+', label: 'Brand Partners', icon: <BusinessIcon /> },
    { number: '95%', label: 'Match Accuracy', icon: <AutoAwesomeIcon /> },
    { number: '50K+', label: 'Successful Matches', icon: <TrendingUpIcon /> },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 15 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                  px: 3,
                  py: 1,
                  borderRadius: 25,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 24 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  AI-Powered Matchmaking Platform
                </Typography>
              </Box>
              
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                  lineHeight: 1.1,
                }}
              >
                Find Perfect Sponsorships
                <Box component="span" sx={{ display: 'block', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  in Minutes, Not Months
                </Box>
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95,
                  fontWeight: 400,
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  maxWidth: '700px',
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Connect event organizers with perfect sponsors using intelligent AI matching. 
                Save time, increase success rates, and unlock new opportunities.
              </Typography>
              
              {!isAuthenticated && (
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center"
                  sx={{ mb: 6 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/register"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      px: 5,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      '&:hover': { 
                        bgcolor: '#f0f0f0',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/login"
                    sx={{ 
                      borderColor: 'white', 
                      borderWidth: 2,
                      color: 'white',
                      px: 5,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      '&:hover': { 
                        borderColor: 'white', 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              )}

              {/* Trust Badges */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mt: 6 }}>
                {[
                  { icon: <VerifiedUserIcon />, text: 'Secure Platform' },
                  { icon: <GroupsIcon />, text: 'Trusted by 10K+ Users' },
                  { icon: <StarIcon />, text: '4.9/5 Rating' },
                ].map((badge, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                    {badge.icon}
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {badge.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
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
                      color: 'white',
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Built for{' '}
              <Box component="span" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Everyone
              </Box>
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontSize: '1.2rem',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Whether you're organizing events or looking to sponsor them, we've got you covered
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: 4,
                    borderRadius: 4,
                    background: 'white',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: benefit.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      color: 'white',
                    }}
                  >
                    {benefit.icon}
                  </Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                    {benefit.title}
                  </Typography>
                  <Stack spacing={2}>
                    {benefit.points.map((point, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                        <CheckCircleIcon sx={{ color: '#43e97b', mt: 0.5, flexShrink: 0 }} />
                        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                          {point}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Powerful Features
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              fontSize: '1.2rem',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Everything you need to find perfect sponsorship matches
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    color: 'white',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              How It Works
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontSize: '1.2rem',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Get started in three simple steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Sign up as an organizer or brand and complete your profile with details about your events or marketing goals.',
                icon: <GroupsIcon sx={{ fontSize: 40 }} />,
              },
              {
                step: '2',
                title: 'AI Finds Matches',
                description: 'Our AI analyzes compatibility and finds perfect matches based on audience, goals, and preferences.',
                icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
              },
              {
                step: '3',
                title: 'Connect & Succeed',
                description: 'Review matches, generate proposals automatically, and connect with partners to close deals faster.',
                icon: <CampaignIcon sx={{ fontSize: 40 }} />,
              },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center', position: 'relative' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: 'white',
                      position: 'relative',
                      '&::before': {
                        content: `"${item.step}"`,
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#f5576c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      },
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {item.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: { xs: 10, md: 15 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
            },
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" gutterBottom sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
              Ready to Transform Your Sponsorship Process?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 5, 
                fontSize: '1.2rem',
                opacity: 0.95,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Join thousands of organizers and brands already using SponsorLink to find perfect matches and grow their business
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  '&:hover': {
                    bgcolor: '#f0f0f0',
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Start Free Today
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/login"
                sx={{
                  borderColor: 'white',
                  borderWidth: 2,
                  color: 'white',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Home;
