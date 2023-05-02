import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { fetchApi, getToken } from '../../tools/api';
import { useEffect } from 'react';

const DialogDelete = ({ asignatura, open, onClose, onSuccess, onError }) => {
  useEffect(() => console.log(asignatura), [asignatura]);

  const deleteAsignatura = async (id_asig) => {
    try {
      const response = await fetchApi(getToken()).delete(`/asignaturas/${id_asig}`);
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
        Eliminar Asignatura
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Seguro de eliminar la siguiente asignatura: {asignatura?.nombre_asignatura}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color='error' onClick={() => deleteAsignatura(asignatura?.id_asig)} autoFocus>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;