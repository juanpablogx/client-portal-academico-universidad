import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { fetchApi, getToken } from '../../tools/api';
import { useEffect } from 'react';

const DialogDelete = ({ docente, open, onClose, onSuccess, onError }) => {
  useEffect(() => console.log(docente), [docente]);

  const deleteDocente = async (codigo_dni) => {
    try {
      const response = await fetchApi(getToken()).delete(`/docentes/${codigo_dni}`);
      let rowCount = response.data?.rowCount;
      if (rowCount && rowCount === 1) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.log(err);
      onError(err.response.status === 401 ? 'No tiene acceso a esta función' : err.response.data.message);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        Eliminar Docente
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Seguro de eliminar el siguiente docente: {docente?.nombre_completo}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color='error' onClick={() => deleteDocente(docente?.codigo_dni)} autoFocus>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;