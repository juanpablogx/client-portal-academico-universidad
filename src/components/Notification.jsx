import React from 'react'
import { Alert } from '@mui/material';

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

export default Notification;