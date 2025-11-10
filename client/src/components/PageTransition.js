import React from 'react';
import { Box, Fade, Grow } from '@mui/material';

const PageTransition = ({ children, fadeIn = true, grow = false }) => {
  if (grow) {
    return (
      <Grow in timeout={600}>
        <Box sx={{ 
          animation: 'fadeInUp 0.4s ease-out',
          '@keyframes fadeInUp': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}>
          {children}
        </Box>
      </Grow>
    );
  }

  if (fadeIn) {
    return (
      <Fade in timeout={400}>
        <Box sx={{ 
          animation: 'fadeIn 0.4s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}>
          {children}
        </Box>
      </Fade>
    );
  }

  return <Box>{children}</Box>;
};

export default PageTransition;

