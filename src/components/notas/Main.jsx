import { useEffect, useRef, useState } from 'react';
import { Fab, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useUserContext } from '../../customHooks/UserProvider';
import List from './List';
import { useNavigate } from 'react-router-dom';
import Form from './Form';
import DialogDelete from './DialogDelete';
import { NotificationEsquina } from '../Notifications';

const Main = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [ notas, setNotas ] = useState([]);
  const [ modo, setModo ] = useState('listar');
  const editarNota = useRef(null);
  const eliminarNota = useRef(null);

  const [ openDialog, setOpenDialog ] = useState(false);
  const [ openNotification, setOpenNotification ] = useState(false);

  const dataNotification = useRef({msg: '', severity: 'success'});

  useEffect(() => {
    if (user?.tipo !== 'docente' && user?.tipo !== 'estudiante') {
      navigate('/main', { replace: true });
    }
  }, []);

  const mainDocente = (
    <>
      <Typography variant='h4' component='h2' sx={{ mb: 2 }}>Notas Estudiantes</Typography>
      {modo === 'crear' ? <Form onReturn={() => setModo('listar')} /> : null}
      {modo === 'editar' ? <Form onReturn={() => setModo('listar')} nota={editarNota.current} /> : null}
      {modo === 'listar' ? 
        <>
          <List 
            setModo={setModo}
            notas={notas}
            setNotas={setNotas} 
            editarNotaRef={editarNota}
            eliminarNotaRef={eliminarNota}
            setOpenDialogDelete={setOpenDialog}
          />
          <Fab 
            color='primary' 
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => {
              setModo('crear');
            }}
          >
            <AddIcon />
          </Fab>
        </> 
        : null
      }
      <DialogDelete 
        open={openDialog} 
        nota={eliminarNota.current} 
        onClose={() => {
          setModo('listar')
          setOpenDialog(false);
        }} 
        onSuccess={() => {
          setOpenNotification(true);
          dataNotification.current = {msg: 'Se eliminó con éxito', severity: 'success'};
        }}
        onError={(message) => {
          setOpenNotification(true);
          dataNotification.current = {msg: 'Error: '+message, severity: 'error'};
        }}
      />
      <NotificationEsquina
        mensaje={dataNotification.current.msg}
        severity={dataNotification.current.severity}
        open={openNotification}
        onClose={() => setOpenNotification(false)}
      />
    </>
  );

  const mainEstudiante = (
    <div>Notas estudiante</div>
  );

  return (
    <>
      {user?.tipo === 'docente' ? mainDocente : null}
      {user?.tipo === 'estudiante' ? mainEstudiante : null}
    </>
  );
};

export default Main;