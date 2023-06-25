import { Box, Button, Grid, LinearProgress, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Notification from '../Notifications';
import { useFormik } from 'formik';
import { fetchApi, getToken } from '../../tools/api';
import * as Yup from 'yup';

const Form = ({ onReturn, estudiante }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  useEffect(() => {
    console.log(estudiante);
  }, []);

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm
  } = useFormik({
    initialValues: {
      codigo_dni: estudiante !== null && estudiante !== undefined ? estudiante.codigo_dni : '',
      nombre1: estudiante !== null && estudiante !== undefined ? estudiante.nombre1 : '',
      nombre2: estudiante !== null && estudiante !== undefined ? (estudiante.nombre2 === null ? '' : estudiante.nombre2) : '',
      apellido1: estudiante !== null && estudiante !== undefined ? estudiante.apellido1 : '',
      apellido2: estudiante !== null && estudiante !== undefined ? (estudiante.apellido2 === null ? '' : estudiante.apellido2) : '',
      correo_inst: estudiante !== null && estudiante !== undefined ? estudiante.correo_inst : '',
      telefono: estudiante !== null && estudiante !== undefined ? (estudiante.telefono === null ? '' : estudiante.telefono.trim()) : '',
      celular: estudiante !== null && estudiante !== undefined ? estudiante.celular.trim() : '',
      correo_pers: estudiante !== null && estudiante !== undefined ? estudiante.correo_pers : '',
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      console.log(inputs);
      setCargando(true);
      const fetch = async () => {
        try {
          let response = {};
          const configPersona = {
            data: {
              nombre1: inputs.nombre1,
              nombre2: inputs.nombre2,
              apellido1: inputs.apellido1,
              apellido2: inputs.apellido2,
              telefono: inputs.telefono,
              celular: inputs.celular,
              correo_pers: inputs.correo_pers,
            }
          };

          const configUsuario = {
            data: {correo_inst: inputs.correo_inst,}
          };

          const configEstudiante = {data: {}};

          if (estudiante !== null && estudiante !== undefined) {
            console.log(configPersona);
            response = await fetchApi(getToken()).put(`/personas/${estudiante.codigo_dni}`, configPersona);
            response = await fetchApi(getToken()).put(`/usuarios/${estudiante.codigo_dni}`, configUsuario);
          } else {
            configPersona.data.codigo_dni = inputs.codigo_dni;
            configUsuario.data.codigo_dni = inputs.codigo_dni;
            configEstudiante.data.codigo_dni = inputs.codigo_dni;

            response = await fetchApi(getToken()).post(`/personas`, configPersona);
            response = await fetchApi(getToken()).post(`/usuarios`, configUsuario);
            response = await fetchApi(getToken()).post(`/estudiantes`, configEstudiante);
          }

          let msg = estudiante !== null && estudiante !== undefined ? 'editó' : 'creó';
          let id = estudiante !== null && estudiante !== undefined ? response.data.updatedUsuario.codigo_dni : response.data.newEstudiante.codigo_dni;

          dataAlert.current = {msg: `Se ${msg} exitosamente el estudiante: ${id}`, severity: 'success'};
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
      codigo_dni: Yup.string().max(15, 'Máx. 15 caracteres').required('Campo obligatorio'),
      nombre1: Yup.string().max(20, 'Máx. 20 caracteres').required('Campo obligatorio'),
      nombre2: Yup.string().max(20, 'Máx. 20 caracteres').optional(),
      apellido1: Yup.string().max(20, 'Máx. 20 caracteres').required('Campo obligatorio'),
      apellido2: Yup.string().max(20, 'Máx. 20 caracteres').optional(),
      correo_inst: Yup.string().email('Correo no válido').required('Campo obligatorio'),
      telefono: Yup.number().max(9999999999, 'Máx. 10 dígitos').optional(),
      celular: Yup.number().min(1000000000, 'Debe tener 10 dígitos').max(9999999999, 'Debe tener 10 dígitos').required('Campo obligatorio'),
      correo_pers: Yup.string().email('Correo no válido').required('Campo obligatorio'),
    })
  });

  return (
    <>
      <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ width: { md: '700px', xs: '400px' } }}>
        <LinearProgress sx={{ mb: 2, width: '100%', display: (cargando ? 'block' : 'none') }} />
        <Typography variant='h5' component='h3'>{estudiante !== null && estudiante !== undefined ? 'Editar' : 'Crear'}</Typography>
        <Grid container spacing={3}>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              id='codigo_dni'
              label='Código'
              name='codigo_dni'
              autoFocus
              error={formikTouched.codigo_dni && formikErrors.codigo_dni?.length > 0}
              helperText={formikErrors.codigo_dni}
              {...getFormikProps('codigo_dni')}
              size='small'
              disabled={estudiante !== null && estudiante !== undefined}
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='correo_inst'
              label='Correo Institucional'
              id='correo_inst'
              error={formikTouched.correo_inst && formikErrors.correo_inst?.length > 0}
              helperText={formikErrors.correo_inst}
              {...getFormikProps('correo_inst')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='nombre1'
              label='Primer Nombre'
              id='nombre1'
              error={formikTouched.nombre1 && formikErrors.nombre1?.length > 0}
              helperText={formikErrors.nombre1}
              {...getFormikProps('nombre1')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              name='nombre2'
              label='Segundo Nombre'
              id='nombre2'
              error={formikTouched.nombre2 && formikErrors.nombre2?.length > 0}
              helperText={formikErrors.nombre2}
              {...getFormikProps('nombre2')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='apellido1'
              label='Primer Apellido'
              id='apellido1'
              error={formikTouched.apellido1 && formikErrors.apellido1?.length > 0}
              helperText={formikErrors.apellido1}
              {...getFormikProps('apellido1')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              name='apellido2'
              label='Segundo Apellido'
              id='apellido2'
              error={formikTouched.apellido2 && formikErrors.apellido2?.length > 0}
              helperText={formikErrors.apellido2}
              {...getFormikProps('apellido2')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              name='telefono'
              label='Teléfono'
              id='telefono'
              type='number'
              error={formikTouched.telefono && formikErrors.telefono?.length > 0}
              helperText={formikErrors.telefono}
              {...getFormikProps('telefono')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='celular'
              label='Celular'
              id='celular'
              type='number'
              error={formikTouched.celular && formikErrors.celular?.length > 0}
              helperText={formikErrors.celular}
              {...getFormikProps('celular')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='correo_pers'
              label='Correo Personal'
              id='correo_pers'
              error={formikTouched.correo_pers && formikErrors.correo_pers?.length > 0}
              helperText={formikErrors.correo_pers}
              {...getFormikProps('correo_pers')}
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
          {estudiante !== null && estudiante !== undefined ? 'Editar' : 'Crear'}
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