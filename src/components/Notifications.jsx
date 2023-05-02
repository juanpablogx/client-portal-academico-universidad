import React from 'react'
import { Alert, Snackbar } from '@mui/material';

const Notification = ({ severity, onClose, mensaje }) => {
  return (
    <Alert
      onClose={onClose}
      severity={severity}
      sx={{ mb: 2 }}
    >
      {mensaje}
    </Alert>
  );
};

export const NotificationEsquina = ({ severity, open, onClose, mensaje }) => {
  return (
    <Snackbar
      open={open} 
      autoHideDuration={6000}
      onClose={onClose}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {mensaje}
      </Alert>
    </Snackbar>
  );
};

export default Notification;