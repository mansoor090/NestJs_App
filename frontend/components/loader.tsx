'use client'

import React, { useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';

const jumpAnimation = keyframes`
  15% {
    border-bottom-right-radius: 3px;
  }
  25% {
    transform: translateY(9px) rotate(22.5deg);
  }
  50% {
    transform: translateY(18px) scale(1, .9) rotate(45deg);
    border-bottom-right-radius: 40px;
  }
  75% {
    transform: translateY(9px) rotate(67.5deg);
  }
  100% {
    transform: translateY(0) rotate(90deg);
  }
`;

const shadowAnimation = keyframes`
  0%, 100% {
    transform: scale(1, 1);
  }
  50% {
    transform: scale(1.2, 1);
  }
`;

const Loader = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            background: 'lightblue',
            borderRadius: 1,
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          margin: 'auto',
          position: 'relative',
          '&::before': {
            content: '""',
            width: 48,
            height: 5,
            background: '#f0808050',
            position: 'absolute',
            top: 60,
            left: 0,
            borderRadius: '50%',
            animation: `${shadowAnimation} 0.5s linear infinite`,
          },
          '&::after': {
            content: '""',
            width: '100%',
            height: '100%',
            background: 'lightblue',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 1,
            animation: `${jumpAnimation} 0.5s linear infinite`,
          },
        }}
      />
    </Box>
  );
};

export default Loader;