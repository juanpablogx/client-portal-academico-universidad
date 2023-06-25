import { useEffect, useRef, useState } from 'react';
import { MenuItem, TextField, Typography } from '@mui/material';
import { useUserContext } from '../../customHooks/UserProvider';
import List from './List';
import { useNavigate } from 'react-router-dom';
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

  const [openAlert, setOpenAlert] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const {
    getFieldProps: getFormikProps, 
    values: formikValues,
    setFieldValue: setFormikFieldValue
  } = useFormik({
    initialValues: {
      id_semestre: '',
      id_grupo: '',
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      return;
    },
    validationSchema: Yup.object({
      id_semestre: Yup.number(),
      id_grupo: Yup.string(),
    })
  });

  useEffect(() => {
    if (user?.tipo !== 'estudiante') {
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
          const responseGrupos = await fetchApi(getToken()).get(`/estudiantes_grupos/${user?.codigo_dni.trim()}/semestre/${formikValues.id_semestre}`);
          let listGrupos = responseGrupos.data.estudiantesGrupos;
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

  const main = (
    <>
      <Typography variant='h4' component='h2' sx={{ mb: 2 }}>Notas Parciales</Typography>
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
          <List 
            notas={notas}
            setNotas={setNotas} 
            formikValues={formikValues}
            openAlert={openAlert}
            setOpenAlert={setOpenAlert}
            dataAlertRef={dataAlert}
          />
        </> 
        : null
      }
    </>
  );

  return (
    <>
      {user?.tipo === 'estudiante' ? main : null}
    </>
  );
};

export default Main;