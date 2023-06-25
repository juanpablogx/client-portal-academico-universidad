import { useEffect, useRef, useState } from 'react';
import { MenuItem, TextField, Typography } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon } from '@mui/icons-material';
import { useUserContext } from '../../customHooks/UserProvider';
import List from './List';
import { useNavigate } from 'react-router-dom';
import Form from './Form';
import { NotificationEsquina } from '../Notifications';
import OptionsEsquina from '../OptionsEsquina';
import { fetchApi, getToken } from '../../tools/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Main = () => {
  const { user } = useUserContext();
  const navigate = useNavigate();

  const [ notas, setNotas ] = useState([]);
  const [ modo, setModo ] = useState('listar');

  const [semestres, setSemestres] = useState([]);

  const [grupos, setGrupos] = useState([]);

  const [actividades, setActividades] = useState([]);

  const [openAlert, setOpenAlert] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const [ openNotification, setOpenNotification ] = useState(false);

  const dataNotification = useRef({msg: '', severity: 'success'});

  const options = [
    { icon: <AddIcon />, name: 'Crear actividad', onClick: () => setModo('crear') },
    {
      icon: <SaveIcon />, 
      name: 'Guardar', 
      onClick: () => {
        const promises = [];
        notas.forEach((value, index) => {
          promises.push(fetchApi(getToken()).put(`/notas_actividades/${value.id_actividad}/${value.codigo_estudiante.trim()}/${value.id_asig}/${value.id_semestre}`, {
            data: {
              nota: value.nota
            }
          }));
        });

        Promise.all(promises)
          .then(responses => {
            dataNotification.current = {msg: 'Se guardó con éxito los cambios', severity: 'success'}
            setOpenNotification(true);
          })
          .catch(err => {
            console.log(err);
            if (err.code === 'ERR_NETWORK') {
              dataNotification.current = {msg: 'El servidor no responde', severity: 'error'};
            } else {
              dataNotification.current = {msg: (err.response.status === 401 ? 'La sesión expiró, los cambios no podrán ser almacenados' : err.response.data.message), severity: 'error'};
            }
            setOpenNotification(true);
          });
      }
    },
  ];

  const {
    getFieldProps: getFormikProps, 
    values: formikValues,
    setFieldValue: setFormikFieldValue
  } = useFormik({
    initialValues: {
      id_semestre: '',
      id_grupo: '',
      id_actividad: '',
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      return;
    },
    validationSchema: Yup.object({
      id_semestre: Yup.number(),
      id_grupo: Yup.string(),
      id_actividad: Yup.number(),
    })
  });

  useEffect(() => {
    if (user?.tipo !== 'docente') {
      navigate('/main', { replace: true });
    }
  }, []);

  useEffect(() => {
    console.log('Notas:');
    console.log(notas);
  }, [notas]);

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
        if (err.code === 'ERR_NETWORK') {
          dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
        } else {
          dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        }
        setOpenAlert(true);
      }
    }

    getSemestres();
  }, []);

  useEffect(() => {
    const getGrupos = async () => {
      try {
        if (formikValues.id_semestre) {
          const responseGrupos = await fetchApi(getToken()).get(`/grupos_asignaturas_horarios/semestre/${formikValues.id_semestre}/docente/${user?.codigo_dni}`);
          let listGrupos = responseGrupos.data.gruposAsignaturasHorarios;
          console.log(listGrupos);
          setGrupos(listGrupos);
          setFormikFieldValue('id_grupo', listGrupos.length > 0 ? `${listGrupos[0].id_asig}/${listGrupos[0].id_semestre}/${listGrupos[0].numero_grupo}` : '');
          if (!listGrupos || listGrupos.length === 0) {
            dataAlert.current = {msg: 'No hay grupos en este semestre', severity: 'warning'};
            setOpenAlert(true);
          }
        } else {
          setGrupos([]);
          setFormikFieldValue('id_grupo', '');
        }
      } catch (err) {
        console.log(err);
        if (err.code === 'ERR_NETWORK') {
          dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
        } else {
          dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        }
        setOpenAlert(true);
      }
    }

    getGrupos();
  }, [formikValues.id_semestre]);

  useEffect(() => {
    const getActividades = async () => {
      try {
        if (formikValues.id_grupo) {
          const responseGrupos = await fetchApi(getToken()).get(`/actividades/grupo_asignatura/${formikValues.id_grupo}`);
          let listActividades = responseGrupos.data.actividades;
          setActividades(listActividades);
          setFormikFieldValue('id_actividad', listActividades.length > 0 ? listActividades[0].id_actividad : '');
          if (!listActividades || listActividades.length === 0) {
            dataAlert.current = {msg: 'No hay actividades en este grupo', severity: 'warning'};
            setOpenAlert(true);
          }
        } else {
          setActividades([]);
          setFormikFieldValue('id_actividad', '');
        }
      } catch (err) {
        console.log(err);
        if (err.code === 'ERR_NETWORK') {
          dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
        } else {
          dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        }
        setOpenAlert(true);
      }
    }

    getActividades();
  }, [formikValues.id_grupo]);

  const main = (
    <>
      <Typography variant='h4' component='h2' sx={{ mb: 2 }}>Notas Estudiantes</Typography>
      {modo === 'crear' ? <Form onReturn={() => setModo('listar')} id_asig={formikValues.id_grupo.split('/')[0]} id_semestre={formikValues.id_semestre} numero_grupo={formikValues.id_grupo.split('/')[2]} /> : null}
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
            name='id_grupo'
            label='Grupo'
            id='id_grupo'
            select
            {...getFormikProps('id_grupo')}
            size='small'
            sx={{ ml: 2, minWidth: '150px' }}
          >
            {grupos.map(grupo => (
              <MenuItem key={`${grupo.id_asig}/${grupo.id_semestre}/${grupo.numero_grupo}`} value={`${grupo.id_asig}/${grupo.id_semestre}/${grupo.numero_grupo}`}>
                {`${grupo.nombre_asignatura} Gr. ${grupo.numero_grupo}`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin='normal'
            name='id_actividad'
            label='Actividad'
            id='id_actividad'
            select
            {...getFormikProps('id_actividad')}
            size='small'
            sx={{ ml: 2, minWidth: '150px' }}
          >
            {actividades.map(actividad => (
              <MenuItem key={actividad.id_actividad} value={actividad.id_actividad}>
                {`${actividad.descripcion} - ${actividad.porcentaje}%`}
              </MenuItem>
            ))}
          </TextField>
          <List 
            notas={notas}
            setNotas={setNotas} 
            formikValues={formikValues}
            openAlert={openAlert}
            setOpenAlert={setOpenAlert}
            dataAlertRef={dataAlert}
          />
          <OptionsEsquina opciones={options} />
        </> 
        : null
      }
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
      {user?.tipo === 'docente' ? main : null}
    </>
  );
};

export default Main;