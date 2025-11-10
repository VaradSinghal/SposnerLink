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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Matches, Events, Brands, Proposals } from '../services/firestoreService';
import { findMatchesForEvent, findMatchesForBrand, generateProposal as generateProposalAPI } from '../services/apiService';
import { Link } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Grow, Fade, Skeleton } from '@mui/material';
import { MatchCardSkeleton } from '../components/SkeletonLoader';

const MatchesPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(null);
  const [proposalDialog, setProposalDialog] = useState({ open: false, proposal: null });
  const [findingMatches, setFindingMatches] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      if (user?.userType === 'organizer') {
        const events = await Events.find({ organizerId: user.id });
        setHasEvents(events.length > 0);
        const eventIds = events.map(e => e.id);
        
        let allMatches = [];
        if (eventIds.length > 0) {
          const matchPromises = eventIds.map(eventId => Matches.find({ eventId }));
          const matchResults = await Promise.all(matchPromises);
          allMatches = matchResults.flat();
        }
        
        // Populate brands - but keep the brandId as ID for queries
        const populatedMatches = await Promise.all(
          allMatches.map(async (match) => {
            const populated = await Matches.populateBrand(match);
            // Keep both the populated brand object and the original ID
            return {
              ...populated,
              brandIdData: populated.brandId, // Full brand data
              brandId: typeof populated.brandId === 'object' ? populated.brandId.id : populated.brandId // Keep ID for queries
            };
          })
        );
        
        setMatches(populatedMatches);
      } else {
        const brand = await Brands.findByUserId(user.id);
        if (brand) {
          const matchesData = await Matches.find({ brandId: brand.id });
          
          // Populate events - but keep the eventId as ID for queries
          const populatedMatches = await Promise.all(
            matchesData.map(async (match) => {
              let populated = await Matches.populateEvent(match);
              // Keep both the populated event object and the original ID
              return {
                ...populated,
                eventIdData: populated.eventId, // Full event data
                eventId: typeof populated.eventId === 'object' ? populated.eventId.id : populated.eventId // Keep ID for queries
              };
            })
          );
          
          setMatches(populatedMatches);
        } else {
          setMatches([]);
        }
      }
    } catch (error) {
      setError('Failed to fetch matches');
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async () => {
    setFindingMatches(true);
    setError('');
    try {
      if (user?.userType === 'organizer') {
        // For organizers, find matches for all their events
        const events = await Events.find({ organizerId: user.id, status: 'active' });
        
        for (const event of events) {
          try {
            await findMatchesForEvent(event.id);
          } catch (err) {
            console.error('Error finding matches for event:', err);
          }
        }
      } else {
        // For brands, find matches for their brand profile
        const brand = await Brands.findByUserId(user.id);
        if (!brand) {
          setError('Please complete your brand profile first');
          setFindingMatches(false);
          return;
        }

        // Use the brand-specific matching function
        await findMatchesForBrand(brand.id);
      }
      
      fetchMatches();
    } catch (error) {
      setError('Failed to find matches: ' + (error.message || 'Unknown error'));
      console.error('Error finding matches:', error);
    } finally {
      setFindingMatches(false);
    }
  };

  const handleGenerateProposal = async (matchId) => {
    setGeneratingProposal(matchId);
    setError('');
    try {
      const match = await Matches.findById(matchId);
      if (!match) {
        setError('Match not found');
        return;
      }

      // Extract IDs - use the stored ID values
      const eventIdValue = match.eventId || (match.eventIdData?.id);
      const brandIdValue = match.brandId || (match.brandIdData?.id);
      
      if (!eventIdValue || !brandIdValue) {
        setError('Invalid match data. Missing event or brand ID.');
        console.error('Match data:', match);
        return;
      }
      
      const result = await generateProposalAPI(eventIdValue, brandIdValue);
      const proposalContent = result.proposalContent;

      // Create proposal in Firestore
      const proposal = await Proposals.create({
        matchId: match.id,
        eventId: eventIdValue,
        brandId: brandIdValue,
        organizerId: user.id,
        content: proposalContent,
        generatedBy: 'ai',
        status: 'draft'
      });

      // Update match
      await Matches.update(matchId, { proposalId: proposal.id });

      setProposalDialog({ open: true, proposal });
      fetchMatches();
    } catch (error) {
      setError('Failed to generate proposal: ' + (error.message || 'Unknown error'));
      console.error('Error generating proposal:', error);
    } finally {
      setGeneratingProposal(null);
    }
  };

  const handleSendProposal = async (proposalId) => {
    try {
      await Proposals.update(proposalId, {
        status: 'sent',
        sentAt: new Date()
      });

      // Update match status
      const proposal = await Proposals.findById(proposalId);
      if (proposal?.matchId) {
        await Matches.update(proposal.matchId, { status: 'proposal_sent' });
      }

      setProposalDialog({ open: false, proposal: null });
      fetchMatches();
    } catch (error) {
      setError('Failed to send proposal');
      console.error('Error sending proposal:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'error';
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
            <MatchCardSkeleton key={i} />
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            AI-Powered Matches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.userType === 'organizer' 
              ? 'Discover brands that match your events'
              : 'Find events that align with your marketing goals'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleFindMatches}
          disabled={findingMatches}
          startIcon={<AutoAwesomeIcon />}
          sx={{ 
            textTransform: 'none', 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
            },
          }}
        >
          {findingMatches ? 'Finding Matches...' : 'Find New Matches'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {matches.length === 0 ? (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No matches yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {user?.userType === 'organizer' ? (
              hasEvents 
                ? 'Click "Find New Matches" above to discover brands that match your events!'
                : 'Create an event first, then find matching sponsors!'
            ) : (
              'Complete your profile and find matching events!'
            )}
          </Typography>
          {user?.userType === 'organizer' && !hasEvents && (
            <Button
              variant="contained"
              component={Link}
              to="/events/create"
              sx={{ 
                mt: 2, 
                textTransform: 'none', 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                },
              }}
            >
              Create Your First Event
            </Button>
          )}
          {user?.userType === 'organizer' && hasEvents && (
            <Button
              variant="contained"
              onClick={handleFindMatches}
              disabled={findingMatches}
              startIcon={<AutoAwesomeIcon />}
              sx={{ 
                mt: 2, 
                textTransform: 'none', 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                },
              }}
            >
              {findingMatches ? 'Finding Matches...' : 'Find New Matches'}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match, index) => (
            <Grid item xs={12} md={6} key={match.id}>
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
                      label={`${match.relevanceScore || 0}% Match`}
                      color={getScoreColor(match.relevanceScore || 0)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip 
                      label={match.status || 'pending'} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>

                  {user?.userType === 'organizer' ? (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {(match.brandIdData || match.brandId)?.companyName || 'Unknown Brand'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {(match.brandIdData || match.brandId)?.description
                          ? (match.brandIdData || match.brandId).description.substring(0, 150) + '...'
                          : 'No description available'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Product/Service:</strong> {(match.brandIdData || match.brandId)?.productServiceType || 'N/A'}
                      </Typography>
                      {match.matchFactors && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            Match Breakdown:
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" display="block">
                              Audience: {match.matchFactors.audienceOverlap?.toFixed(1) || 0}%
                            </Typography>
                            <Typography variant="caption" display="block">
                              Category: {match.matchFactors.categoryFit?.toFixed(1) || 0}%
                            </Typography>
                            <Typography variant="caption" display="block">
                              Location: {match.matchFactors.locationFit?.toFixed(1) || 0}%
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {(match.eventIdData || match.eventId)?.name || 'Unknown Event'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {(match.eventIdData || match.eventId)?.description 
                          ? (match.eventIdData || match.eventId).description.substring(0, 150) + '...'
                          : 'No description available'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Type:</strong> {(match.eventIdData || match.eventId)?.type || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Location:</strong> {(match.eventIdData || match.eventId)?.location
                          ? `${(match.eventIdData || match.eventId).location.city || 'TBD'}, ${(match.eventIdData || match.eventId).location.country || 'TBD'}`
                          : 'TBD'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Attendees:</strong> {(match.eventIdData || match.eventId)?.expectedAttendees || 0}
                      </Typography>
                    </>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Relevance Score
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={match.relevanceScore || 0}
                      color={getScoreColor(match.relevanceScore || 0)}
                      sx={{ 
                        mt: 0.5,
                        height: 8,
                        borderRadius: 4
                      }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {user?.userType === 'organizer' && (
                    <>
                      {match.status === 'pending' && !match.proposalId && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AutoAwesomeIcon />}
                          onClick={() => handleGenerateProposal(match.id)}
                          disabled={generatingProposal === match.id}
                          sx={{ 
                            textTransform: 'none', 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                            },
                          }}
                        >
                          {generatingProposal === match.id ? 'Generating...' : 'Generate Proposal'}
                        </Button>
                      )}
                      {match.proposalId && (
                        <Button 
                          size="small" 
                          component={Link} 
                          to={`/proposals`}
                          variant="outlined"
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          View Proposal
                        </Button>
                      )}
                      {match.status === 'proposal_sent' && (
                        <Chip 
                          label="Proposal Sent" 
                          color="info" 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </>
                  )}
                  {user?.userType === 'brand' && (
                    <>
                      <Button
                        size="small"
                        component={Link}
                        to={`/events/${match.eventId}`}
                        variant="contained"
                        sx={{ 
                          textTransform: 'none', 
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                          },
                        }}
                      >
                        View Event Details
                      </Button>
                      {match.status === 'pending' && (
                        <Chip 
                          label="Pending Response" 
                          color="warning" 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                      {match.status === 'proposal_sent' && (
                        <Chip 
                          label="Proposal Received" 
                          color="info" 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
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
        open={proposalDialog.open}
        onClose={() => setProposalDialog({ open: false, proposal: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6">AI-Generated Proposal</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {proposalDialog.proposal && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {proposalDialog.proposal.content?.subject}
              </Typography>
              <Typography variant="body2" paragraph sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
                {proposalDialog.proposal.content?.body}
              </Typography>
              {proposalDialog.proposal.content?.pitchDeck?.sections?.map((section, idx) => (
                <Box key={idx} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {section.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setProposalDialog({ open: false, proposal: null })}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Close
          </Button>
          {proposalDialog.proposal && (
            <Button
              variant="contained"
              onClick={() => handleSendProposal(proposalDialog.proposal.id)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Send Proposal
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MatchesPage;
