import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import BrandProfile from './pages/BrandProfile';
import Matches from './pages/Matches';
import Proposals from './pages/Proposals';
import Analytics from './pages/Analytics';
import PrivateRoute from './components/PrivateRoute';
import Chatbot from './components/Chatbot';
import PageTransition from './components/PageTransition';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8fa3f0',
      dark: '#4a5bc4',
    },
    secondary: {
      main: '#764ba2',
      light: '#9575b8',
      dark: '#5a3578',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            transition: 'background 0.3s ease',
          }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <PageTransition grow>
                    <Dashboard />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <Events />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <EventDetail />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/events/create"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <CreateEvent />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/brand/profile"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <BrandProfile />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/matches"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <Matches />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/proposals"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <Proposals />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <PageTransition>
                    <Analytics />
                  </PageTransition>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Chatbot />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
