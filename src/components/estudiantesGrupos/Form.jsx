import { Box, Button, Grid, LinearProgress, MenuItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Notification from '../Notifications';
import { useFormik } from 'formik';
import { fetchApi, getToken } from '../../tools/api';
import * as Yup from 'yup';

const Form = ({ onReturn, id_asig, id_semestre, numero_grupo }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [estudiantes, setEstudiantes] = useState([]);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  useEffect(() => {
    const estudiantesPromise = fetchApi(getToken()).get(`/estudiantes/not_in_grupo/${id_asig}/${id_semestre}`);
    Promise.all([estudiantesPromise]).then(([ responseEstudiantes ]) => {
      console.log(responseEstudiantes.data.estudiantes);
      if (responseEstudiantes.data?.estudiantes && responseEstudiantes.data.estudiantes.length > 0) {
        setEstudiantes(responseEstudiantes.data.estudiantes);
      }
    });
  }, []);

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm,
  } = useFormik({
    initialValues: {
      codigo_estudiante: estudiantes.length > 0 ? estudiantes[0].codigo_dni : '',
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      setCargando(true);
      const fetch = async () => {
        try {
          let response = {};
          const config = {
            data: {
              codigo_estudiante: inputs.codigo_estudiante,
              id_asig: id_asig,
              id_semestre: id_semestre,
              numero_grupo: numero_grupo,
            }
          };
            
          response = await fetchApi(getToken()).post(`/estudiantes_grupos`, config);
          let id = response.data.newEstudianteGrupo.codigo_estudiante;

          const responseGrupos = await fetchApi(getToken()).get(`/actividades/grupo_asignatura/${id_asig}/${id_semestre}/${numero_grupo}`);
          let listActividades = responseGrupos.data.actividades;
          console.log(listActividades);

          const promises = [];
          listActividades.forEach((value, index) => {
            promises.push(fetchApi(getToken()).post(`/notas_actividades`, {
              data: {
                codigo_estudiante: inputs.codigo_estudiante,
                id_asig: id_asig,
                id_semestre: id_semestre,
                id_actividad: value.id_actividad,
              }
            }));
          });
  
          const rr = await Promise.all(promises);

          dataAlert.current = {msg: `Se añadió exitosamente el estudiante: ${id}`, severity: 'success'};
          setOpenAlert(true);
          setCargando(false);
          resetFormikForm();
        } catch (err) {
          console.log(err);
          dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
          setOpenAlert(true);
          setCargando(false);
        }
      };

      fetch();
    },
    validationSchema: Yup.object({
      codigo_estudiante: Yup.string().required('Campo obligatorio'),
    })
  });

  return (
    <>
      <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ width: { md: '700px', xs: '400px' } }}>
        <LinearProgress sx={{ mb: 2, width: '100%', display: (cargando ? 'block' : 'none') }} />
        <Typography variant='h5' component='h3'>{'Añadir'}</Typography>
        <Grid container spacing={3}>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              id='codigo_estudiante'
              label='Estudiante'
              name='codigo_estudiante'
              autoFocus
              select
              error={formikTouched.codigo_estudiante && formikErrors.codigo_estudiante?.length > 0}
              helperText={formikErrors.codigo_estudiante}
              {...getFormikProps('codigo_estudiante')}
              size='small'
            >
              {estudiantes.map(est => (
                <MenuItem key={est.codigo_dni} value={est.codigo_dni}>
                  {`${est.codigo_dni} - ${est.nombre_completo}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        {openAlert ? 
          <Notification 
            onClose={() => {setOpenAlert(false)}}
            mensaje={dataAlert.current.msg}
            severity={dataAlert.current.severity}
          />
          : ''}
        <Button
          type='submit'
          variant='contained'
          color='primary'
          sx={{ mt: 3, mb: 2 }}
        >
          {'Añadir'}
        </Button>
        <Button
          type='button'
          variant='contained'
          color='secondary'
          sx={{ mt: 3, mb: 2, ml: 2 }}
          onClick={onReturn}
        >
          Regresar
        </Button>
      </Box>
    </>
  );
};

export default Form;