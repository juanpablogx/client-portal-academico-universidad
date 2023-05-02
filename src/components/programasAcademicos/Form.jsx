import { Box, Button, Grid, LinearProgress, MenuItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Notification from '../Notifications';
import { useFormik } from 'formik';
import { fetchApi, getToken } from '../../tools/api';
import * as Yup from 'yup';

const Form = ({ onReturn, programa }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [facultades, setFacultades] = useState([]);
  const [tipos, setTipos] = useState([]);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  useEffect(() => {
    const facultadesPromise = fetchApi(getToken()).get('/facultades');
    const tiposPromise = fetchApi(getToken()).get('/tipos_programas');
    Promise.all([facultadesPromise, tiposPromise]).then(([ responseFacultades, responseTipos ]) => {
      if (responseFacultades.data?.facultades && responseFacultades.data.facultades.length > 0) {
        setFacultades(responseFacultades.data.facultades);
      }
      if (responseTipos.data?.tiposProgramas && responseTipos.data.tiposProgramas.length > 0) {
        setTipos(responseTipos.data.tiposProgramas);
      }
    });
    console.log(programa);
  }, []);

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm
  } = useFormik({
    initialValues: {
      codigo: programa !== null && programa !== undefined ? programa.codigo : '',
      nombre_programa: programa !== null && programa !== undefined ? programa.nombre_programa : '',
      id_fac: programa !== null && programa !== undefined ? programa.id_fac : (facultades.length > 0 ? facultades[0].id_fac : ''),
      id_tipo: programa !== null && programa !== undefined ? programa.id_tipo : (tipos.length > 0 ? tipos[0].id_tipo : ''),
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      setCargando(true);
      const fetch = async () => {
        try {
          let response = {};
          const config = {
            data: {
              codigo: inputs.codigo,
              nombre: inputs.nombre_programa,
              id_fac: inputs.id_fac,
              id_tipo: inputs.id_tipo,
            }
          };
          if (programa !== null && programa !== undefined) {
            response = await fetchApi(getToken()).put(`/programas_academicos/${programa.id_prog}`, config);
          } else {
            response = await fetchApi(getToken()).post(`/programas_academicos`, config);
          }

          let msg = programa !== null && programa !== undefined ? 'editó' : 'creó';
          let id = programa !== null && programa !== undefined ? response.data.updatedPrograma.id_prog : response.data.newPrograma.id_prog;

          dataAlert.current = {msg: `Se ${msg} exitosamente el programa: ${id}`, severity: 'success'};
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
      codigo: Yup.string().max(4, 'Máx. 4 caracteres').required('Campo obligatorio'),
      nombre_programa: Yup.string().max(30, 'Máx. 30 caracteres').required('Campo obligatorio'),
      id_fac: Yup.number().required('Campo obligatorio'),
      id_tipo: Yup.number().required('Campo obligatorio'),
    })
  });

  return (
    <>
      <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ width: { md: '700px', xs: '400px' } }}>
        <LinearProgress sx={{ mb: 2, width: '100%', display: (cargando ? 'block' : 'none') }} />
        <Typography variant='h5' component='h3'>{programa !== null && programa !== undefined ? 'Editar' : 'Crear'}</Typography>
        <Grid container spacing={3}>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              id='codigo'
              label='Código'
              name='codigo'
              autoFocus
              error={formikTouched.codigo && formikErrors.codigo?.length > 0}
              helperText={formikErrors.codigo}
              {...getFormikProps('codigo')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='nombre_programa'
              label='Nombre'
              id='nombre_programa'
              error={formikTouched.nombre_programa && formikErrors.nombre_programa?.length > 0}
              helperText={formikErrors.nombre_programa}
              {...getFormikProps('nombre_programa')}
              size='small'
            />
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='id_fac'
              label='Facultad'
              id='id_fac'
              select
              error={formikTouched.id_fac && formikErrors.id_fac?.length > 0}
              helperText={formikErrors.id_fac}
              {...getFormikProps('id_fac')}
              size='small'
            >
              {facultades.map(fac => (
                <MenuItem key={fac.id_fac} value={fac.id_fac}>
                  {fac.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='id_tipo'
              label='Tipo'
              id='id_tipo'
              select
              error={formikTouched.id_tipo && formikErrors.id_tipo?.length > 0}
              helperText={formikErrors.id_tipo}
              {...getFormikProps('id_tipo')}
              size='small'
            >
              {tipos.map(tipo => (
                <MenuItem key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.nombre}
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
          {programa !== null && programa !== undefined ? 'Editar' : 'Crear'}
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