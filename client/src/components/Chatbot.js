import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Fade,
  Slide,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAuth } from '../context/AuthContext';
import { chatWithAI } from '../services/apiService';

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      // Add welcome message
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI assistant. I can help you:
          
• Find matching events or brands
• Understand how the matching system works
• Get help with creating profiles
• Answer questions about sponsorship opportunities

What would you like to know?`,
        },
      ]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAI(input.trim(), user);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or contact support.',
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'How does matching work?',
    'How do I create an event?',
    'How do I find sponsors?',
    'What makes a good profile?',
  ];

  return (
    <>
      {/* Chat Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Fade in={!open}>
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ChatIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Fade>
      </Box>

      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            maxWidth: 400,
            height: 600,
            maxHeight: { xs: 'calc(100vh - 96px)', sm: 600 },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 1001,
            background: 'white',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  width: 32,
                  height: 32,
                }}
              >
                <SmartToyIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI Assistant
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: '#f5f5f5',
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: 2,
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <Box sx={{ p: 1.5, background: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Quick questions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {quickQuestions.map((q, idx) => (
                  <Box
                    key={idx}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => handleSend(), 100);
                    }}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      background: 'white',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      '&:hover': {
                        background: '#f0f0f0',
                        borderColor: '#667eea',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      {q}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: 1,
              background: 'white',
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f92 100%)',
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default Chatbot;

