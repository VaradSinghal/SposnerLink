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
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Divider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
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
        overflow: 'hidden',
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
                Welcome Back!
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
                Sign in to continue your journey with AI-powered sponsorship matching
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { icon: <AutoAwesomeIcon />, text: 'AI Matching' },
                  { icon: <AutoAwesomeIcon />, text: 'Smart Proposals' },
                  { icon: <AutoAwesomeIcon />, text: 'Fast Results' },
                ].map((feature, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {feature.icon}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {feature.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grow>

          {/* Right Side - Login Form */}
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
                  <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800, color: '#667eea' }}>
                  Sign In
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enter your credentials to access your account
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? null : <LoginIcon />}
                  sx={{
                    mt: 4,
                    mb: 3,
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
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Don't have an account?
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
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
                    Create New Account
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

export default Login;
