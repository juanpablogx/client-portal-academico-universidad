import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { fetchApi, getToken } from '../../tools/api';
import { useEffect } from 'react';

const DialogDelete = ({ programa, open, onClose, onSuccess, onError }) => {
  useEffect(() => console.log(programa), [programa]);

  const deleteProgram = async (id_prog) => {
    try {
      const response = await fetchApi(getToken()).delete(`/programas_academicos/${id_prog}`);
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
        Eliminar Programa académico
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Seguro de eliminar el siquiente programa académico: {programa?.nombre_programa}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color='error' onClick={() => deleteProgram(programa?.id_prog)} autoFocus>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;