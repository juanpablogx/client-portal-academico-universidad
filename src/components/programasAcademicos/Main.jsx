import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';

const Main = () => {
  useEffect(() => console.log('Main Programas'), []);

  return (
    <Typography>Main Programas Académicos</Typography>
  );
};

export default Main;