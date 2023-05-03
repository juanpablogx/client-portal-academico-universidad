import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { fetchApi, getToken } from '../../tools/api';
import { useEffect } from 'react';

const DialogDelete = ({ estudiante, open, onClose, onSuccess, onError }) => {
  useEffect(() => console.log(estudiante), [estudiante]);

  const deleteProgram = async (codigo_estudiante, id_asig, id_semestre) => {
    try {
      const response = await fetchApi(getToken()).delete(`/estudiantes_grupos/${codigo_estudiante}/${id_asig}/${id_semestre}`);
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
        Eliminar Estudiante de un Grupo
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Seguro de eliminar el estudiante {estudiante?.nombre_completo_estudiante} del grupo actual.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color='error' onClick={() => deleteProgram(estudiante?.codigo_estudiante, estudiante?.id_asig, estudiante?.id_semestre)} autoFocus>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;