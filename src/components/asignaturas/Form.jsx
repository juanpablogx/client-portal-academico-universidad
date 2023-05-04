import { Box, Button, Grid, LinearProgress, MenuItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Notification from '../Notifications';
import { useFormik } from 'formik';
import { fetchApi, getToken } from '../../tools/api';
import * as Yup from 'yup';

const Form = ({ onReturn, asignatura }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [programas, setProgramas] = useState([]);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  useEffect(() => {
    const programasPromise = fetchApi(getToken()).get('/programas_academicos');
    Promise.all([programasPromise]).then(([ responseProgramas ]) => {
      if (responseProgramas.data?.programas && responseProgramas.data.programas.length > 0) {
        setProgramas(responseProgramas.data.programas);
      }
    });
    console.log(asignatura);
  }, []);

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm
  } = useFormik({
    initialValues: {
      codigo_asig: asignatura !== null && asignatura !== undefined ? asignatura.codigo_asig : '',
      nombre_asignatura: asignatura !== null && asignatura !== undefined ? asignatura.nombre_asignatura : '',
      id_prog: asignatura !== null && asignatura !== undefined ? asignatura.id_prog : (programas.length > 0 ? programas[0].id_prog : ''),
      creditos: asignatura !== null && asignatura !== undefined ? asignatura.creditos : '',
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      setCargando(true);
      const fetch = async () => {
        try {
          let response = {};
          const config = {
            data: {
              codigo_asig: inputs.codigo_asig,
              nombre: inputs.nombre_asignatura,
              id_prog: inputs.id_prog,
              creditos: inputs.creditos,
            }
          };
          if (asignatura !== null && asignatura !== undefined) {
            response = await fetchApi(getToken()).put(`/asignaturas/${asignatura.id_asig}`, config);
          } else {
            response = await fetchApi(getToken()).post(`/asignaturas`, config);
          }

          let msg = asignatura !== null && asignatura !== undefined ? 'editó' : 'creó';
          let id = asignatura !== null && asignatura !== undefined ? response.data.updatedAsignatura.id_asig : response.data.newAsignatura.id_asig;

          dataAlert.current = {msg: `Se ${msg} exitosamente la asignatura: ${id}`, severity: 'success'};
          setOpenAlert(true);
          setCargando(false);
          resetFormikForm();
        } catch (err) {
          dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
          setOpenAlert(true);
          setCargando(false);
        }
      };

      fetch();
    },
    validationSchema: Yup.object({
      codigo_asig: Yup.string().max(4, 'Máx. 4 caracteres').required('Campo obligatorio'),
      nombre_asignatura: Yup.string().max(50, 'Máx. 50 caracteres').required('Campo obligatorio'),
      id_prog: Yup.number().required('Campo obligatorio'),
      creditos: Yup.number().integer().min(1, 'Min. 1 crédito').max(25, 'Máx. 25 créditos').required('Campo obligatorio'),
    })
  });

  return (
    <>
      <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ width: { md: '700px', xs: '400px' } }}>
        <LinearProgress sx={{ mb: 2, width: '100%', display: (cargando ? 'block' : 'none') }} />
        <Typography variant='h5' component='h3'>{asignatura !== null && asignatura !== undefined ? 'Editar' : 'Crear'}</Typography>
        <Grid container spacing={3}>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              id='codigo_asig'
              label='Código'
              name='codigo_asig'
              autoFocus
              error={formikTouched.codigo_asig && formikErrors.codigo_asig?.length > 0}
              helperText={formikErrors.codigo_asig}
              {...getFormikProps('codigo_asig')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='nombre_asignatura'
              label='Nombre'
              id='nombre_asignatura'
              error={formikTouched.nombre_asignatura && formikErrors.nombre_asignatura?.length > 0}
              helperText={formikErrors.nombre_asignatura}
              {...getFormikProps('nombre_asignatura')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='id_prog'
              label='Programa'
              id='id_prog'
              select
              error={formikTouched.id_prog && formikErrors.id_prog?.length > 0}
              helperText={formikErrors.id_prog}
              {...getFormikProps('id_prog')}
              size='small'
            >
              {programas.map(prog => (
                <MenuItem key={prog.id_prog} value={prog.id_prog}>
                  {prog.nombre_programa}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='creditos'
              label='Créditos'
              id='creditos'
              type='number'
              error={formikTouched.creditos && formikErrors.creditos?.length > 0}
              helperText={formikErrors.creditos}
              {...getFormikProps('creditos')}
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
          {asignatura !== null && asignatura !== undefined ? 'Editar' : 'Crear'}
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