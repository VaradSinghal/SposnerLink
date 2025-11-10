import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Proposals, Brands, Matches } from '../services/firestoreService';
import { format } from 'date-fns';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Grow, Fade, Skeleton } from '@mui/material';

const ProposalsPage = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    try {
      let proposalsData = [];
      
      if (user?.userType === 'organizer') {
        proposalsData = await Proposals.find({ organizerId: user.id });
      } else {
        const brand = await Brands.findByUserId(user.id);
        if (brand) {
          proposalsData = await Proposals.find({ brandId: brand.id });
        }
      }

      // Populate related data
      const populatedProposals = await Promise.all(
        proposalsData.map(async (proposal) => {
          let populated = await Proposals.populateEvent(proposal);
          populated = await Proposals.populateBrand(populated);
          populated = await Proposals.populateOrganizer(populated);
          return populated;
        })
      );

      setProposals(populatedProposals);
    } catch (error) {
      setError('Failed to fetch proposals');
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setDialogOpen(true);
  };

  const handleUpdateStatus = async (proposalId, status) => {
    try {
      const updateData = { status };
      if (status === 'viewed' && !selectedProposal?.viewedAt) {
        updateData.viewedAt = new Date();
      }
      if (status === 'accepted' || status === 'declined') {
        updateData.respondedAt = new Date();
      }

      await Proposals.update(proposalId, updateData);

      // Update match status
      const proposal = await Proposals.findById(proposalId);
      if (proposal?.matchId) {
        const matchUpdate = {};
        if (status === 'viewed') {
          matchUpdate.brandResponse = 'viewed';
          matchUpdate.status = 'viewed';
        } else if (status === 'accepted') {
          matchUpdate.brandResponse = 'accepted';
          matchUpdate.status = 'accepted';
        } else if (status === 'declined') {
          matchUpdate.brandResponse = 'declined';
          matchUpdate.status = 'declined';
        }
        if (Object.keys(matchUpdate).length > 0) {
          await Matches.update(proposal.matchId, matchUpdate);
        }
      }

      fetchProposals();
      setDialogOpen(false);
    } catch (error) {
      setError('Failed to update proposal status');
      console.error('Error updating proposal:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'info',
      viewed: 'primary',
      responded: 'success',
      accepted: 'success',
      declined: 'error',
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
        <Box>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={150} sx={{ mb: 2, borderRadius: 3 }} />
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Proposals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.userType === 'organizer' 
            ? 'Manage your sponsorship proposals'
            : 'View and respond to sponsorship proposals'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {proposals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No proposals yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.userType === 'organizer'
              ? 'Generate proposals from your matches to get started!'
              : 'Proposals will appear here when organizers send them to you.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {proposals.map((proposal, index) => (
            <Grid item xs={12} md={6} key={proposal.id}>
              <Grow in timeout={300 + index * 100}>
                <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip
                      label={proposal.status || 'draft'}
                      color={getStatusColor(proposal.status || 'draft')}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    {proposal.generatedBy === 'ai' && (
                      <Chip 
                        label="AI Generated" 
                        size="small" 
                        variant="outlined"
                        icon={<AutoAwesomeIcon />}
                        color="primary"
                      />
                    )}
                  </Box>

                  {user?.userType === 'organizer' ? (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        To: {proposal.brandId?.companyName || 'Unknown Brand'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Event: {proposal.eventId?.name || 'Unknown Event'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        From: {proposal.organizerId?.name || 'Unknown Organizer'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Event: {proposal.eventId?.name || 'Unknown Event'}
                      </Typography>
                    </>
                  )}

                  {proposal.content?.subject && (
                    <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'medium' }}>
                      Subject: {proposal.content.subject}
                    </Typography>
                  )}

                  {proposal.sentAt && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Sent: {format(new Date(proposal.sentAt), 'MMM dd, yyyy')}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    onClick={() => handleViewProposal(proposal)}
                    variant="outlined"
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    View Details
                  </Button>
                  {user?.userType === 'brand' && proposal.status === 'sent' && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        onClick={() => handleUpdateStatus(proposal.id, 'accepted')}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleUpdateStatus(proposal.id, 'declined')}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6">
              {selectedProposal?.content?.subject || 'Proposal Details'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProposal && (
            <Box>
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                {selectedProposal.content?.body}
              </Typography>
              {selectedProposal.content?.pitchDeck?.sections?.map((section, idx) => (
                <Box key={idx} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {section.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
          {user?.userType === 'brand' && selectedProposal?.status === 'sent' && (
            <>
              <Button
                color="success"
                variant="contained"
                onClick={() => handleUpdateStatus(selectedProposal.id, 'accepted')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Accept
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => handleUpdateStatus(selectedProposal.id, 'declined')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Decline
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProposalsPage;
