import { useEffect, useRef, useState } from 'react';
import { Fab, MenuItem, TextField, Typography } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { useUserContext } from '../../customHooks/UserProvider';
import List from './List';
import { useNavigate } from 'react-router-dom';
import Form from './Form';
import DialogDelete from './DialogDelete';
import { NotificationEsquina } from '../Notifications';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchApi, getToken } from '../../tools/api';

const Main = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [ estudiantes, setEstudiantes ] = useState([]);
  const [ modo, setModo ] = useState('listar');
  const eliminarEstudiante = useRef(null);

  const [semestres, setSemestres] = useState([]);

  const [asignaturas, setAsignaturas] = useState([]);

  const [grupos, setGrupos] = useState([]);

  const [ openDialog, setOpenDialog ] = useState(false);
  const [ openNotification, setOpenNotification ] = useState(false);

  const dataNotification = useRef({msg: '', severity: 'success'});

  const [openAlert, setOpenAlert] = useState(false);
  const dataAlert = useRef({msg: '', severity: 'warning'});

  const {
    getFieldProps: getFormikProps, 
    values: formikValues,
    setFieldValue: setFormikFieldValue
  } = useFormik({
    initialValues: {
      id_semestre: '',
      id_asig: '',
      id_grupo: '',
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      return;
    },
    validationSchema: Yup.object({
      id_semestre: Yup.number(),
      id_asig: Yup.number(),
      id_grupo: Yup.string(),
    })
  });

  useEffect(() => {
    if (user?.tipo !== 'administrador') {
      navigate('/main', { replace: true });
    }
  }, []);

  useEffect(() => {
    const getSemestres = async () => {
      try {
        const responseSemestres = await fetchApi(getToken()).get('/semestres');
        let listSemestres = responseSemestres.data.semestres;
        setSemestres(listSemestres);
        setFormikFieldValue('id_semestre', listSemestres.length > 0 ? listSemestres[0].id_semestre : '');
        if (!listSemestres || listSemestres.length === 0) {
          dataAlert.current = {msg: 'No hay semestres', severity: 'warning'};
          setOpenAlert(true);
        }
      } catch (err) {
        console.log(err);
        dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        setOpenAlert(true);
      }
    }

    getSemestres();
  }, []);

  useEffect(() => {
    const getAsignaturas = async () => {
      try {
        const responseGrupos = await fetchApi(getToken()).get(`/asignaturas`);
        let listAsignaturas = responseGrupos.data.asignaturas;
        console.log(listAsignaturas);
        setAsignaturas(listAsignaturas);
        setFormikFieldValue('id_asig', listAsignaturas.length > 0 ? listAsignaturas[0].id_asig : '');
        if (!listAsignaturas || listAsignaturas.length === 0) {
          dataAlert.current = {msg: 'No hay asignaturas', severity: 'warning'};
          setOpenAlert(true);
        }
      } catch (err) {
        console.log(err);
        dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        setOpenAlert(true);
      }
    }

    getAsignaturas();
  }, []);

  useEffect(() => {
    const getGrupos = async () => {
      try {
        if (formikValues.id_semestre && formikValues.id_asig) {
          const responseGrupos = await fetchApi(getToken()).get(`/grupos_asignaturas/${formikValues.id_asig}/${formikValues.id_semestre}`);
          let listGrupos = responseGrupos.data.gruposAsignaturas;
          setGrupos(listGrupos);
          setFormikFieldValue('id_grupo', listGrupos.length > 0 ? `${listGrupos[0].id_asig}/${listGrupos[0].id_semestre}/${listGrupos[0].numero}` : '');
          if (!listGrupos || listGrupos.length === 0) {
            dataAlert.current = {msg: 'No hay grupos en esta asignatura y semestre', severity: 'warning'};
            setOpenAlert(true);
          }
        } else {
          setGrupos([]);
          setFormikFieldValue('id_grupo', '');
        }
      } catch (err) {
        console.log(err);
        dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        setOpenAlert(true);
      }
    }

    getGrupos();
  }, [formikValues.id_semestre, formikValues.id_asig]);

  const main = (
    <>
      <Typography variant='h4' component='h2' sx={{ mb: 2 }}>Asignación Estudiantes Grupos</Typography>
      {modo === 'crear' ? <Form id_asig={formikValues.id_asig} id_semestre={formikValues.id_semestre} numero_grupo={formikValues.id_grupo.split('/')[2]} onReturn={() => setModo('listar')} /> : null}
      {modo === 'listar' ? 
        <>
          <TextField
          margin='normal'
          name='id_semestre'
          label='Semestre'
          id='id_semestre'
          select
          {...getFormikProps('id_semestre')}
          size='small'
          sx={{ minWidth: '150px' }}
        >
          {semestres.map(semestre => (
            <MenuItem key={semestre.id_semestre} value={semestre.id_semestre}>
              {`${semestre.year}-${semestre.numero}`}
            </MenuItem>
          ))}
          </TextField>
          <TextField
            margin='normal'
            name='id_asig'
            label='Asignatura'
            id='id_asig'
            select
            {...getFormikProps('id_asig')}
            size='small'
            sx={{ ml: 2, minWidth: '150px' }}
          >
            {asignaturas.map(asig => (
              <MenuItem key={asig.id_asig} value={asig.id_asig}>
                {`${asig.codigo_asig}${asig.codigo_programa} - ${asig.nombre_asignatura}`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin='normal'
            name='id_grupo'
            label='Grupo'
            id='id_grupo'
            select
            {...getFormikProps('id_grupo')}
            size='small'
            sx={{ ml: 2, minWidth: '150px' }}
          >
            {grupos.map(grupo => (
              <MenuItem key={`${grupo.id_asig}/${grupo.id_semestre}/${grupo.numero}`} value={`${grupo.id_asig}/${grupo.id_semestre}/${grupo.numero}`}>
                {`Gr. ${grupo.numero}`}
              </MenuItem>
            ))}
          </TextField>
          <List 
            setModo={setModo}
            estudiantes={estudiantes}
            setEstudiantes={setEstudiantes}
            formikValues={formikValues}
            openAlert={openAlert}
            setOpenAlert={setOpenAlert}
            dataAlertRef={dataAlert} 
            eliminarEstudianteRef={eliminarEstudiante}
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
        estudiante={eliminarEstudiante.current} 
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