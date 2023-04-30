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
            <Route path='/main' element={<RequiereAuthUser><Navigation /></RequiereAuthUser>}>
              <Route index element={<Dashboard />} />
              <Route path='dashboard' element={<Dashboard />} />
              <Route path='*' element={<NotFound />} />
            </Route>
          </Routes>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
