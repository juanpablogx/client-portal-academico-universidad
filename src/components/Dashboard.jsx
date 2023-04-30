import { Box, Toolbar, Typography } from '@mui/material';
import React from 'react';

const Dashboard = () => {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Typography variant='h3'>Bienvenido al portal académico</Typography>
    </Box>
  );
};

export default Dashboard;