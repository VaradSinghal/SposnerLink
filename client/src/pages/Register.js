import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('organizer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(name, email, password, userType);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center' }}>
          {/* Left Side - Branding */}
          <Grow in timeout={800}>
            <Box
              sx={{
                flex: 1,
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                px: 4,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                  },
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 60, color: 'white' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textShadow: '0 2px 20px rgba(0,0,0,0.2)',
                }}
              >
                Join SponsorLink
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  opacity: 0.95,
                  mb: 4,
                  fontWeight: 400,
                  maxWidth: 400,
                }}
              >
                Start your journey with AI-powered sponsorship matching today
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 350 }}>
                {[
                  { icon: <CheckCircleIcon />, text: 'AI-Powered Matching' },
                  { icon: <CheckCircleIcon />, text: 'Smart Proposals' },
                  { icon: <CheckCircleIcon />, text: 'Real-time Analytics' },
                ].map((feature, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.25)',
                        transform: 'translateX(10px)',
                      },
                    }}
                  >
                    {feature.icon}
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {feature.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grow>

          {/* Right Side - Registration Form */}
          <Fade in timeout={600}>
            <Paper
              elevation={24}
              sx={{
                flex: { xs: 1, lg: 0.8 },
                maxWidth: { xs: '100%', lg: 640 },
                p: { xs: 4, md: 5 },
                borderRadius: 4,
                background: 'rgba(255,255,255,0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                },
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                    mb: 2,
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: '#667eea' }}>
                  Create Account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join thousands of organizers and brands finding perfect matches
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    animation: 'shake 0.5s ease-in-out',
                    '@keyframes shake': {
                      '0%, 100%': { transform: 'translateX(0)' },
                      '25%': { transform: 'translateX(-10px)' },
                      '75%': { transform: 'translateX(10px)' },
                    },
                  }}
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  helperText="Password must be at least 6 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#667eea' }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      },
                    },
                  }}
                />

                <FormControl component="fieldset" sx={{ mt: 3, mb: 2, width: '100%' }}>
                  <FormLabel component="legend" sx={{ mb: 2, fontWeight: 700, color: '#667eea' }}>
                    I am a:
                  </FormLabel>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Card
                      elevation={userType === 'organizer' ? 8 : 2}
                      onClick={() => setUserType('organizer')}
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 3,
                        cursor: 'pointer',
                        border: userType === 'organizer' ? '3px solid #667eea' : '3px solid transparent',
                        background: userType === 'organizer' 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                          : 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                          borderColor: '#667eea',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: '16px !important' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: userType === 'organizer'
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <EventIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <FormControlLabel
                          value="organizer"
                          control={<Radio checked={userType === 'organizer'} />}
                          label={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Event Organizer
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Find sponsors for your events
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card
                      elevation={userType === 'brand' ? 8 : 2}
                      onClick={() => setUserType('brand')}
                      sx={{
                        flex: 1,
                        p: 2.5,
                        borderRadius: 3,
                        cursor: 'pointer',
                        border: userType === 'brand' ? '3px solid #667eea' : '3px solid transparent',
                        background: userType === 'brand' 
                          ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                          : 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                          borderColor: '#667eea',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: '16px !important' }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: userType === 'brand'
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <FormControlLabel
                          value="brand"
                          control={<Radio checked={userType === 'brand'} />}
                          label={
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              Brand/Sponsor
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Discover events to sponsor
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <PersonAddIcon />}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.8,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.7,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Already have an account?
                  </Typography>
                  <Button
                    component={Link}
                    to="/login"
                    variant="outlined"
                    size="large"
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#5a6fd8',
                        background: 'rgba(102, 126, 234, 0.05)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Sign In Instead
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
