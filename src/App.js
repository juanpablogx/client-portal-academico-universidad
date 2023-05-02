import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import UserProvider from './customHooks/UserProvider';
import RequiereAuthUser from './components/RequiereAuthUser';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import NotFound from './components/NotFound';
import * as Programas from './components/programasAcademicos';
import * as Asignaturas from './components/asignaturas';
import * as Docentes from './components/docentes';
import * as Estudiantes from './components/estudiantes';
import * as Notas from './components/notas';
import * as Grupos from './components/grupos';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/login' element={<Login />} />
            <Route path='*' element={<NotFound />} />
            <Route path='/main' element={<Navigation />}>
              <Route index element={<RequiereAuthUser><Dashboard /></RequiereAuthUser>} />
              <Route path='dashboard' element={<RequiereAuthUser><Dashboard /></RequiereAuthUser>} />
              <Route path='programas' element={<RequiereAuthUser><Programas.Main /></RequiereAuthUser>} />
              <Route path='asignaturas' element={<RequiereAuthUser><Asignaturas.Main /></RequiereAuthUser>} />
              <Route path='matricula' element={<RequiereAuthUser><Asignaturas.Main /></RequiereAuthUser>} />
              <Route path='docentes' element={<RequiereAuthUser><Docentes.Main /></RequiereAuthUser>} />
              <Route path='estudiantes' element={<RequiereAuthUser><Estudiantes.Main /></RequiereAuthUser>} />
              <Route path='grupos' element={<RequiereAuthUser><Grupos.Main /></RequiereAuthUser>} />
              <Route path='notas' element={<RequiereAuthUser><Notas.Main /></RequiereAuthUser>} />
              <Route path='*' element={<RequiereAuthUser><NotFound /></RequiereAuthUser>} />
            </Route>
          </Routes>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
