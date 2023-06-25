import { Box, Button, Grid, LinearProgress, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Notification from '../Notifications';
import { useFormik } from 'formik';
import { fetchApi, getToken } from '../../tools/api';
import * as Yup from 'yup';

const Form = ({ onReturn, id_asig, id_semestre, numero_grupo }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  useEffect(() => {
    console.log(id_asig);
    console.log(id_semestre);
    console.log(numero_grupo);
  }, []);

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm
  } = useFormik({
    initialValues: {
      descripcion: '',
      porcentaje: '',
    },
    onSubmit: (inputs) => {
      setCargando(true);
      const fetch = async () => {
        try {
          let response = {};
          const config = {
            data: {
              id_asig: id_asig,
              id_semestre: id_semestre,
              numero_grupo: numero_grupo,
              descripcion: inputs.descripcion,
              porcentaje: inputs.porcentaje,
            }
          };
          
          response = await fetchApi(getToken()).post(`/actividades`, config);
          const id_actividad = response.data.newActividad.id_actividad;
          response = await fetchApi(getToken()).get(`/estudiantes_grupos/grupo/${id_asig}/${id_semestre}/${numero_grupo}`);

          const promisesNotasActividades = [];

          console.log(response.data.estudiantesGrupos);

          response.data.estudiantesGrupos.forEach((value, index) => {
            promisesNotasActividades.push(fetchApi(getToken()).post(`/notas_actividades`, {
              data: {
                codigo_estudiante: value.codigo_estudiante,
                id_asig: id_asig,
                id_semestre: id_semestre,
                id_actividad: id_actividad
              }
            }));
          });

          Promise.all(promisesNotasActividades)
            .then(responses => {
              dataAlert.current = {msg: 'Se guardó con éxito', severity: 'success'}
              setOpenAlert(true);
            })
            .catch(err => {
              console.log(err);
              if (err.code === 'ERR_NETWORK') {
                dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
              } else {
                dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
              }
              setOpenAlert(true);
            });

          dataAlert.current = {msg: `Se creó exitosamente la actividad para este grupo`, severity: 'success'};
          setOpenAlert(true);
          setCargando(false);
          resetFormikForm();
        } catch (err) {
          if (err.code === 'ERR_NETWORK') {
            dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
          } else {
            dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
          }
          setOpenAlert(true);
          setCargando(false);
        }
      };

      fetch();
    },
    validationSchema: Yup.object({
      descripcion: Yup.string().max(255, 'Máx. 255 caracteres').required('Campo obligatorio'),
      porcentaje: Yup.number().integer('Solo valores enteros').min(1, 'Rango válido: 1-100').max(100, 'Rango válido: 1-100').required('Campo obligatorio'),
    })
  });

  return (
    <>
      <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ width: { md: '700px', xs: '400px' } }}>
        <LinearProgress sx={{ mb: 2, width: '100%', display: (cargando ? 'block' : 'none') }} />
        <Typography variant='h5' component='h3'>Crear Actividad</Typography>
        <Grid container spacing={3}>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              id='descripcion'
              label='Descripción'
              name='descripcion'
              error={formikTouched.descripcion && formikErrors.descripcion?.length > 0}
              helperText={formikErrors.descripcion}
              {...getFormikProps('descripcion')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='porcentaje'
              label='Porcentaje'
              id='porcentaje'
              type='number'
              error={formikTouched.porcentaje && formikErrors.porcentaje?.length > 0}
              helperText={formikErrors.porcentaje}
              {...getFormikProps('porcentaje')}
              size='small'
            />
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
          Crear Actividad
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