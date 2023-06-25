import { Box, Button, Grid, LinearProgress, MenuItem, TextField, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Notification from '../Notifications';
import { useFormik } from 'formik';
import { fetchApi, getToken } from '../../tools/api';
import * as Yup from 'yup';

const Form = ({ onReturn, grupo }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [semestres, setSemestres] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  useEffect(() => {
    const semestresPromise = fetchApi(getToken()).get('/semestres');
    const asignaturasPromise = fetchApi(getToken()).get('/asignaturas');
    const docentesPromise = fetchApi(getToken()).get('/docentes');
    const horariosPromise = fetchApi(getToken()).get('/horarios');

    Promise.all([semestresPromise, asignaturasPromise, docentesPromise, horariosPromise]).then(([ responseSemestres, responseAsignaturas, responseDocentes, responseHorarios ]) => {
      if (responseSemestres.data?.semestres && responseSemestres.data.semestres.length > 0) {
        setSemestres(responseSemestres.data.semestres);
      }
      if (responseAsignaturas.data?.asignaturas && responseAsignaturas.data.asignaturas.length > 0) {
        setAsignaturas(responseAsignaturas.data.asignaturas);
      }
      if (responseDocentes.data?.docentes && responseDocentes.data.docentes.length > 0) {
        setDocentes(responseDocentes.data.docentes);
      }
      if (responseHorarios.data?.horarios && responseHorarios.data.horarios.length > 0) {
        setHorarios(responseHorarios.data.horarios);
      }
    });
    console.log(grupo);
  }, []);

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm
  } = useFormik({
    initialValues: {
      id_asig: asignaturas.length > 0 ? asignaturas[0].id_asig : '',
      id_semestre: semestres.length > 0 ? semestres[0].id_semestre : '',
      codigo_docente: grupo !== null && grupo !== undefined ? grupo.codigo_docente : (docentes.length > 0 ? docentes[0].codigo_dni : ''),
      numero: grupo !== null && grupo !== undefined ? grupo.numero_grupo : '',
      id_horarios: horarios.length > 0 ? [horarios[0].id_horario] : [],
    },
    enableReinitialize: true,
    onSubmit: (inputs) => {
      setCargando(true);
      const fetch = async () => {
        try {
          let response = {};
          let config = {
            data: {
              codigo_docente: inputs.codigo_docente, 
              numero: inputs.numero,
            }
          };
          if (grupo !== null && grupo !== undefined) {
            response = await fetchApi(getToken()).put(`/grupos_asignaturas/${grupo.id_asig}/${grupo.id_semestre}/${grupo.numero_grupo}`, config);
          } else {
            config = {data: {...config.data, id_asig: inputs.id_asig, id_semestre: inputs.id_semestre,}};
            response = await fetchApi(getToken()).post(`/grupos_asignaturas`, config);
            inputs.id_horarios.forEach(async (id_horario, index) => {
              let cf = {data: {id_asig: inputs.id_asig, id_semestre: inputs.id_semestre, numero_grupo: inputs.numero, id_horario: id_horario}};
              response = await fetchApi(getToken()).post(`/grupos_asignaturas_horarios`, cf);
            });
          }

          let msg = grupo !== null && grupo !== undefined ? 'editó' : 'creó';

          dataAlert.current = {msg: `Se ${msg} exitosamente el grupo`, severity: 'success'};
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
      id_asig: Yup.number().required('Campo obligatorio'),
      id_semestre: Yup.number().required('Campo obligatorio'),
      codigo_docente: Yup.string().required('Campo obligatorio'),
      numero: Yup.number().min(1, 'Número 1 como mínimo').required('Campo obligatorio'),
      id_horarios: Yup.array()
    })
  });

  return (
    <>
      <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ width: { md: '700px', xs: '400px' } }}>
        <LinearProgress sx={{ mb: 2, width: '100%', display: (cargando ? 'block' : 'none') }} />
        <Typography variant='h5' component='h3'>{grupo !== null && grupo !== undefined ? 'Editar' : 'Crear'}</Typography>
        <Grid container spacing={3}>
          {grupo === null || grupo === undefined ? 
            <Grid item lg={6} sm={12}>
              <TextField
                margin='normal'
                fullWidth
                required
                name='id_asig'
                label='Asignatura'
                id='id_asig'
                select
                error={formikTouched.id_asig && formikErrors.id_asig?.length > 0}
                helperText={formikErrors.id_asig}
                {...getFormikProps('id_asig')}
                size='small'
              >
                {asignaturas.map(asig => (
                  <MenuItem key={asig.id_asig} value={asig.id_asig}>
                    {`${asig.codigo_asig} - ${asig.nombre_asignatura}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            : null
          }
          {grupo === null || grupo === undefined ? 
            <Grid item lg={6} sm={12}>
              <TextField
                margin='normal'
                fullWidth
                required
                name='id_semestre'
                label='Semestre'
                id='id_semestre'
                select
                error={formikTouched.id_semestre && formikErrors.id_semestre?.length > 0}
                helperText={formikErrors.id_semestre}
                {...getFormikProps('id_semestre')}
                size='small'
              >
                {semestres.map(semestre => (
                  <MenuItem key={semestre.id_semestre} value={semestre.id_semestre}>
                    {`${semestre.year}-${semestre.numero}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            : null
          }
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              name='codigo_docente'
              label='Docente'
              id='codigo_docente'
              select
              error={formikTouched.codigo_docente && formikErrors.codigo_docente?.length > 0}
              helperText={formikErrors.codigo_docente}
              {...getFormikProps('codigo_docente')}
              size='small'
            >
              {docentes.map(doc => (
                <MenuItem key={doc.codigo_dni} value={doc.codigo_dni}>
                  {doc.nombre_completo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item lg={6} sm={12}>
            <TextField
              margin='normal'
              fullWidth
              required
              id='numero'
              label='Número'
              name='numero'
              type='number'
              error={formikTouched.numero && formikErrors.numero?.length > 0}
              helperText={formikErrors.numero}
              {...getFormikProps('numero')}
              size='small'
            />
          </Grid>
          {grupo === null || grupo === undefined ? 
            <Grid item lg={6} sm={12}>
              <TextField
                margin='normal'
                fullWidth
                required
                name='id_horarios'
                label='Horarios'
                id='id_horarios'
                select
                SelectProps={{ multiple: true }}
                error={formikTouched.id_horarios && formikErrors.id_horarios?.length > 0}
                helperText={formikErrors.id_horarios}
                {...getFormikProps('id_horarios')}
                size='small'
              >
                {horarios.map(hor => (
                  <MenuItem key={hor.id_horario} value={hor.id_horario}>
                    {`${hor.dia} ${hor.hora_inicio}-${hor.hora_fin}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            : null
          }
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
          {grupo !== null && grupo !== undefined ? 'Editar' : 'Crear'}
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