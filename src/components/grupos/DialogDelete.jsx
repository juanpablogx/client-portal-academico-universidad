import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { fetchApi, getToken } from '../../tools/api';
import { useEffect } from 'react';

const DialogDelete = ({ grupo, open, onClose, onSuccess, onError }) => {
  useEffect(() => console.log(grupo), [grupo]);

  const deleteGrupo = async (id_asig, id_semestre, numero) => {
    try {
      const response = await fetchApi(getToken()).delete(`/grupos_asignaturas/${id_asig}/${id_semestre}/${numero}`);
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
        Eliminar Grupo académico
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Seguro de eliminar el grupo.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button color='error' onClick={() => deleteGrupo(grupo?.id_asig, grupo?.id_semestre, grupo?.numero_grupo)} autoFocus>Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;