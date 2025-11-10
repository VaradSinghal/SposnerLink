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
  AutoAwesome as AutoAwesomeIcon,
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
      elevation={2}
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 28 }} />
            SponsorLink
          </Typography>
        </Box>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/dashboard"
              startIcon={<DashboardIcon />}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Dashboard
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/feed"
              startIcon={<FeedIcon />}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Feed
            </Button>
            
            {(user?.userType || 'organizer') === 'organizer' ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/events"
                  startIcon={<EventIcon />}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Events
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/events/create"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': { 
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)' 
                    }
                  }}
                >
                  Create Event
                </Button>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/brand/profile"
                startIcon={<BusinessIcon />}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Profile
              </Button>
            )}
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/matches"
              startIcon={<MatchesIcon />}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Matches
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/proposals"
              startIcon={<ProposalsIcon />}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Proposals
            </Button>
            
            <Button 
              color="inherit" 
              component={Link} 
              to="/analytics"
              startIcon={<AnalyticsIcon />}
              sx={{ 
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                transition: 'all 0.3s ease',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Analytics
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, pl: 2, borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <Chip
                label={(user?.userType || 'organizer') === 'organizer' ? 'Organizer' : 'Brand'}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <IconButton
                onClick={handleMenuOpen}
                sx={{ color: 'white' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.3)' }}>
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
                  <Logout sx={{ mr: 1, fontSize: 20 }} />
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
