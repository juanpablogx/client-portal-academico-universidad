import React, { useRef, useState } from 'react';
import { Avatar, Box, Button, Container, LinearProgress, TextField, Typography } from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { fetchApi, setToken } from '../tools/api';
import { useUserContext } from '../customHooks/UserProvider';
import Notification from './Notifications';
import { useLocation, useNavigate } from 'react-router-dom';


const Login = () => {
  const { setUser } = useUserContext();
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const navigate = useNavigate();

  const {
    errors: formikErrors, 
    getFieldProps: getFormikProps, 
    handleSubmit: formikSubmit,
    touched: formikTouched,
    resetForm: resetFormikForm 
  } = useFormik({
    initialValues: {
      codigo_dni: '',
      password: ''
    },
    onSubmit: (inputs) => {
      setCargando(true);
      setTimeout(() => {
        fetchApi().post('/usuarios/login', {
          data: {
            codigo_dni: inputs.codigo_dni,
            password: inputs.password
          }
        })
        .then(response => {
          // console.log(response);
          if (response.data.usuarios && response.data.usuarios.length === 1 && response.data.token !== null) {
            setToken(response.data.token);

            const { codigo_dni, tipo } = response.data.usuarios[0];
            setUser({ codigo_dni, tipo });
            
            navigate('/main', { replace: true });
          } else {
            setToken(null);
            setUser(null);
            dataAlert.current = {msg: 'Datos incorrectos', severity: 'warning'};
            setOpenAlert(true);
          }
          resetFormikForm();
          setCargando(false);
        })
        .catch(err => {
          if (err.code === 'ERR_NETWORK') {
            dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
          } else {
            dataAlert.current = {msg: err.response.data.message, severity: 'error'};
          }
          setOpenAlert(true);
          setCargando(false);
        });
      }, 1000);
    },
    validationSchema: Yup.object({
      codigo_dni: Yup.string().required('Campo obligatorio'),
      password: Yup.string().required('Campo obligatorio')
    })
  });

  return (
    <Container component='main' maxWidth='xs'>
      <Box
        sx={{
          mt: 8,
          p: 3,
          pt: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {cargando ? <LinearProgress sx={{ mb: 3, width: '100%' }} /> : ''}
        <Avatar sx={{ m: 1, mt: 4, bgcolor: 'primary.dark' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Iniciar Sesión
        </Typography>
        <Box component='form' onSubmit={e => formikSubmit(e)} noValidate sx={{ mt: 2 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='codigo_dni'
            label='Código DNI'
            name='codigo_dni'
            autoFocus
            error={formikTouched.codigo_dni && formikErrors.codigo_dni?.length > 0}
            helperText={formikErrors.codigo_dni}
            {...getFormikProps('codigo_dni')}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='password'
            label='Contraseña'
            type='password'
            id='password'
            error={formikTouched.password && formikErrors.password?.length > 0}
            helperText={formikErrors.password}
            {...getFormikProps('password')}
          />
          {openAlert ? 
            <Notification 
              onClose={() => {setOpenAlert(false)}}
              mensaje={dataAlert.current.msg}
              severity={dataAlert.current.severity}
            />
           : ''}
          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar Sesión
          </Button>
        </Box>
      </Box>
    </Container>
    
  );
};

export default Login;