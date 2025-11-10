import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Divider,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Posts, Events } from '../services/firestoreService';
import { format } from 'date-fns';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import EventIcon from '@mui/icons-material/Event';
import BusinessIcon from '@mui/icons-material/Business';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { Fade, Grow } from '@mui/material';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeed();
  }, [user]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
      // Fetch all posts
      const postsData = await Posts.find();
      
      // Fetch events based on user type
      let eventsData = [];
      if (user?.userType === 'organizer') {
        // Organizers see their own events
        eventsData = await Events.find({ organizerId: user.id });
      } else {
        // Sponsors see all events
        eventsData = await Events.find();
      }
      
      // Combine posts and events, sort by date
      const allItems = [
        ...postsData.map(p => ({ ...p, itemType: 'post' })),
        ...eventsData.map(e => ({ ...e, itemType: 'event' }))
      ].sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
      
      setPosts(postsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching feed:', error);
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      setError('Please enter some content');
      return;
    }

    try {
      setPosting(true);
      setError('');

      const postData = {
        userId: user.id,
        userName: user.name,
        userType: user.userType,
        content: postContent,
        type: postType,
        eventId: selectedEvent || null,
        likes: [],
        comments: []
      };

      await Posts.create(postData);
      setPostContent('');
      setSelectedEvent('');
      setPostType('general');
      setOpenPostDialog(false);
      fetchFeed();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await Posts.likePost(postId, user.id);
      fetchFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      await Posts.addComment(postId, {
        userId: user.id,
        userName: user.name,
        text: commentText
      });
      fetchFeed();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  const allItems = [
    ...posts.map(p => ({ ...p, itemType: 'post' })),
    ...events.map(e => ({ ...e, itemType: 'event' }))
  ].sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={400}>
        <Box>
          {/* Create Post Section */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#667eea' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenPostDialog(true)}
                startIcon={<PostAddIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderRadius: 3,
                  py: 1.5,
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#764ba2',
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  },
                }}
              >
                Share something about events or sponsorships...
              </Button>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Feed Items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {allItems.length === 0 ? (
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" color="text.secondary">
                  No posts or events yet. Be the first to share!
                </Typography>
              </Paper>
            ) : (
              allItems.map((item) => (
                <Grow in timeout={600} key={item.id}>
                  <Card
                    elevation={3}
                    sx={{
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: item.itemType === 'event' ? '#764ba2' : '#667eea' }}>
                          {item.itemType === 'event' ? (
                            <EventIcon />
                          ) : (
                            item.userName?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.itemType === 'event' ? item.name : item.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.createdAt && format(new Date(item.createdAt), 'MMM dd, yyyy • h:mm a')}
                          </Typography>
                          {item.itemType === 'post' && (
                            <Chip
                              label={item.userType === 'organizer' ? 'Organizer' : 'Sponsor'}
                              size="small"
                              sx={{ mt: 0.5, ml: 1 }}
                            />
                          )}
                        </Box>
                        {item.itemType === 'event' && (
                          <Chip
                            label={item.status || 'active'}
                            color={item.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        )}
                      </Box>

                      {item.itemType === 'post' ? (
                        <>
                          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                            {item.content}
                          </Typography>
                          {item.type !== 'general' && (
                            <Chip
                              label={item.type}
                              size="small"
                              sx={{ mb: 2 }}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {item.location?.city && (
                              <Chip
                                icon={<EventIcon />}
                                label={`${item.location.city}, ${item.location.country}`}
                                size="small"
                              />
                            )}
                            {item.type && (
                              <Chip label={item.type} size="small" variant="outlined" />
                            )}
                          </Box>
                        </>
                      )}
                    </CardContent>

                    {item.itemType === 'post' && (
                      <CardActions sx={{ px: 2, pb: 2 }}>
                        <IconButton
                          onClick={() => handleLike(item.id)}
                          color={item.likes?.includes(user?.id) ? 'primary' : 'default'}
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(102, 126, 234, 0.1)',
                            },
                          }}
                        >
                          <ThumbUpIcon />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {item.likes?.length || 0}
                          </Typography>
                        </IconButton>
                        <IconButton
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(102, 126, 234, 0.1)',
                            },
                          }}
                        >
                          <CommentIcon />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {item.comments?.length || 0}
                          </Typography>
                        </IconButton>
                        <IconButton
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(102, 126, 234, 0.1)',
                            },
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      </CardActions>
                    )}

                    {item.itemType === 'post' && item.comments && item.comments.length > 0 && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Comments
                        </Typography>
                        {item.comments.map((comment) => (
                          <Box key={comment.id} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {comment.userName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {comment.text}
                            </Typography>
                          </Box>
                        ))}
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Add a comment..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              handleComment(item.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    const input = e.target.closest('.MuiInputBase-root').querySelector('input');
                                    if (input?.value.trim()) {
                                      handleComment(item.id, input.value);
                                      input.value = '';
                                    }
                                  }}
                                >
                                  <CommentIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Box>
                    )}
                  </Card>
                </Grow>
              ))
            )}
          </Box>
        </Box>
      </Fade>

      {/* Create Post Dialog */}
      <Dialog
        open={openPostDialog}
        onClose={() => setOpenPostDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="Share something about events or sponsorships..."
          />
          <TextField
            fullWidth
            select
            label="Post Type"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="event">Event</MenuItem>
            <MenuItem value="sponsorship">Sponsorship</MenuItem>
            <MenuItem value="announcement">Announcement</MenuItem>
          </TextField>
          {user?.userType === 'organizer' && events.length > 0 && (
            <TextField
              fullWidth
              select
              label="Link to Event (Optional)"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              {events.map((event) => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPostDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePost}
            variant="contained"
            disabled={posting || !postContent.trim()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {posting ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Feed;

