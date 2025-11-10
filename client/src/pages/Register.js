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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import { Grow, Fade } from '@mui/material';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        minHeight: 'calc(100vh - 64px)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Grow in timeout={600}>
          <Paper 
            elevation={24} 
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
              <AutoAwesomeIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join SponsorLink and start finding perfect matches
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
              helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <FormControl component="fieldset" sx={{ mt: 2, mb: 2, width: '100%' }}>
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                I am a:
              </FormLabel>
              <RadioGroup
                row
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                sx={{ justifyContent: 'center', gap: 2 }}
              >
                <Paper
                  elevation={userType === 'organizer' ? 4 : 1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: userType === 'organizer' ? '2px solid #667eea' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    flex: 1,
                    textAlign: 'center',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setUserType('organizer')}
                >
                  <FormControlLabel
                    value="organizer"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon />
                        <Typography>Event Organizer</Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                </Paper>
                <Paper
                  elevation={userType === 'brand' ? 4 : 1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: userType === 'brand' ? '2px solid #667eea' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    flex: 1,
                    textAlign: 'center',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setUserType('brand')}
                >
                  <FormControlLabel
                    value="brand"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon />
                        <Typography>Brand/Sponsor</Typography>
                      </Box>
                    }
                    sx={{ m: 0 }}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <Typography variant="body2" align="center" color="text.secondary">
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
        </Grow>
      </Container>
    </Box>
  );
};

export default Register;
