import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AddCircle as AddIcon,
  Business as BusinessIcon,
  Favorite as MatchesIcon,
  Description as ProposalsIcon,
  Analytics as AnalyticsIcon,
  AccountCircle,
  Logout,
  Settings,
  Link as LinkIcon,
  Feed as FeedIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-0.5px',
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 0.9,
                transform: 'translateY(-1px)',
              }
            }}
          >
            SponsorLink
          </Typography>
        </Box>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/dashboard"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/feed"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Feed
            </Button>
            
            {/* Events button - shown for both organizers and brands */}
            <Button 
              color="inherit" 
              component={Link} 
              to="/events"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Events
            </Button>

            {(user?.userType || 'organizer') === 'organizer' ? (
              <Button 
                color="inherit" 
                component={Link} 
                to="/events/create"
                variant="outlined"
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderColor: 'rgba(255,255,255,0.6)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Create Event
              </Button>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/brand/profile"
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Profile
              </Button>
            )}
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/matches"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Matches
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/proposals"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Proposals
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/analytics"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Analytics
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.25)' }}>
              <Chip
                label={(user?.userType || 'organizer') === 'organizer' ? 'Organizer' : 'Brand'}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <Avatar sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/login"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              component={Link} 
              to="/register"
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': { 
                  bgcolor: '#f0f0f0',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.3s'
              }}
            >
              Get Started
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
