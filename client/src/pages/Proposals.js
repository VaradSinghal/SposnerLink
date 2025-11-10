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
import { Proposals, Brands, Matches, Events } from '../services/firestoreService';
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
        // Organizers see proposals sent to their events (by eventId) OR sent by them (by organizerId)
        const proposalsToEvents = await Proposals.find({ organizerId: user.id });
        
        // Also get proposals sent to events they own
        const userEvents = await Events.find({ organizerId: user.id });
        const eventIds = userEvents.map(e => e.id);
        
        let proposalsToMyEvents = [];
        if (eventIds.length > 0) {
          for (const eventId of eventIds) {
            const eventProposals = await Proposals.find({ eventId });
            proposalsToMyEvents = [...proposalsToMyEvents, ...eventProposals];
          }
        }
        
        // Combine and deduplicate
        const allProposals = [...proposalsToEvents, ...proposalsToMyEvents];
        const uniqueProposals = allProposals.filter((proposal, index, self) =>
          index === self.findIndex(p => p.id === proposal.id)
        );
        proposalsData = uniqueProposals;
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
                      {proposal.proposalType === 'brand_to_event' ? (
                        <>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            From: {proposal.brandId?.companyName || 'Unknown Brand'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Event: {proposal.eventId?.name || 'Unknown Event'}
                          </Typography>
                          <Chip 
                            label="Sponsor Proposal" 
                            color="info" 
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </>
                      ) : (
                        <>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            To: {proposal.brandId?.companyName || 'Unknown Brand'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Event: {proposal.eventId?.name || 'Unknown Event'}
                          </Typography>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {proposal.proposalType === 'brand_to_event' 
                          ? `To: ${proposal.eventId?.name || 'Unknown Event'}`
                          : `From: ${proposal.organizerId?.name || 'Unknown Organizer'}`}
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
                  {user?.userType === 'organizer' && proposal.status === 'draft' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleViewProposal(proposal)}
                      sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                        },
                      }}
                    >
                      Review & Send
                    </Button>
                  )}
                  {user?.userType === 'brand' && proposal.status === 'sent' && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        variant="contained"
                        onClick={() => handleUpdateStatus(proposal.id, 'accepted')}
                        sx={{ 
                          textTransform: 'none', 
                          borderRadius: 2,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleUpdateStatus(proposal.id, 'declined')}
                        sx={{ 
                          textTransform: 'none', 
                          borderRadius: 2,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  {proposal.status === 'accepted' && (
                    <Chip 
                      label="Accepted" 
                      color="success" 
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                  {proposal.status === 'declined' && (
                    <Chip 
                      label="Declined" 
                      color="error" 
                      size="small"
                      sx={{ ml: 1 }}
                    />
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
              {selectedProposal.content?.subject && (
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {selectedProposal.content.subject}
                </Typography>
              )}
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                {typeof selectedProposal.content === 'string' 
                  ? selectedProposal.content 
                  : selectedProposal.content?.body || selectedProposal.content || 'No content available'}
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
              {user?.userType === 'organizer' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {selectedProposal.status || 'draft'}
                  </Typography>
                  {selectedProposal.sentAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Sent:</strong> {format(new Date(selectedProposal.sentAt), 'MMM dd, yyyy • h:mm a')}
                    </Typography>
                  )}
                  {selectedProposal.viewedAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Viewed:</strong> {format(new Date(selectedProposal.viewedAt), 'MMM dd, yyyy • h:mm a')}
                    </Typography>
                  )}
                  {selectedProposal.respondedAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Responded:</strong> {format(new Date(selectedProposal.respondedAt), 'MMM dd, yyyy • h:mm a')}
                    </Typography>
                  )}
                </Box>
              )}
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
          {user?.userType === 'organizer' && selectedProposal?.status === 'draft' && (
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await Proposals.update(selectedProposal.id, {
                    status: 'sent',
                    sentAt: new Date()
                  });
                  if (selectedProposal?.matchId) {
                    await Matches.update(selectedProposal.matchId, { status: 'proposal_sent' });
                  }
                  setDialogOpen(false);
                  fetchProposals();
                } catch (error) {
                  console.error('Error sending proposal:', error);
                }
              }}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Send Proposal
            </Button>
          )}
          {user?.userType === 'organizer' && selectedProposal?.proposalType === 'brand_to_event' && selectedProposal?.status === 'sent' && (
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
