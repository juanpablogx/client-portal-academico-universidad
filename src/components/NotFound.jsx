import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  return (
    <Container>
      <Box 
        sx={{
          mt: 8,
          p: 3,
          pt: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant='h1'>404 Not Found</Typography>
        <Typography variant='h6'>La ruta <span style={{ fontStyle: 'italic' }}>{location.pathname}</span> no existe</Typography>
      </Box>
    </Container>
  );
};

export default NotFound;