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

  const [ docentes, setDocentes ] = useState([]);
  const [ modo, setModo ] = useState('listar');
  const editarDocente = useRef(null);
  const eliminarDocente = useRef(null);

  const [ openDialog, setOpenDialog ] = useState(false);
  const [ openNotification, setOpenNotification ] = useState(false);

  const dataNotification = useRef({msg: '', severity: 'success'});

  useEffect(() => {
    if (user?.tipo !== 'administrador') {
      navigate('/main', { replace: true });
    }
  }, []);

  const main = (
    <>
      <Typography variant='h4' component='h2' sx={{ mb: 2 }}>Docentes</Typography>
      {modo === 'crear' ? <Form onReturn={() => setModo('listar')} /> : null}
      {modo === 'editar' ? <Form onReturn={() => setModo('listar')} docente={editarDocente.current} /> : null}
      {modo === 'listar' ? 
        <>
          <List 
            setModo={setModo}
            docentes={docentes}
            setDocentes={setDocentes} 
            editarDocenteRef={editarDocente}
            eliminarDocenteRef={eliminarDocente}
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
        docente={eliminarDocente.current} 
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

  return (
    <>
      {user?.tipo === 'administrador' ? main : null}
    </>
  );
};

export default Main;