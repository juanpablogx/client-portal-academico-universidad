import { useState } from 'react';
import { AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon, SchoolOutlined as SchoolOutlinedIcon, BookOutlined as BookOutlinedIcon, BeenhereOutlined as BeenhereOutlinedIcon, AssignmentIndOutlined as AssignmentIndOutlinedIcon, BadgeOutlined as BadgeOutlinedIcon, FaceOutlined as FaceOutlinedIcon } from '@mui/icons-material';
import { useUserContext } from '../customHooks/UserProvider';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

const optionsAdmin = [
  {title: 'Programas académicos', icon: <SchoolOutlinedIcon />},
  {title: 'Asignaturas', icon: <BookOutlinedIcon />},
  {title: 'Docentes', icon: <BadgeOutlinedIcon />},
  {title: 'Estudiantes', icon: <FaceOutlinedIcon />}
];

const optionsEstudiante = [
  {title: 'Notas Parciales', icon: <BeenhereOutlinedIcon />},
  {title: 'Matrícula', icon: <BookOutlinedIcon />}
];

const optionsDocente = [
  {title: 'Notas grupos', icon: <BeenhereOutlinedIcon />},
  {title: 'Estudiantes grupos', icon: <AssignmentIndOutlinedIcon />}
];

const mapOptions = (opt, index) => (
  <ListItem key={opt.title} disablePadding>
    <ListItemButton>
      <ListItemIcon>
        {opt.icon}
      </ListItemIcon>
      <ListItemText primary={opt.title} />
    </ListItemButton>
  </ListItem>
);

const Navigation = ({ window }) => {
  const { user } = useUserContext();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {user?.tipo === 'administrador' ? optionsAdmin.map(mapOptions) : null}
        {user?.tipo === 'estudiante' ? optionsEstudiante.map(mapOptions) : null}
        {user?.tipo === 'docente' ? optionsDocente.map(mapOptions) : null}
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box
      sx={{ display: 'flex' }}
    >
      <AppBar
        position='fixed'
        sx={{
          // width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'primary.dark',
          zIndex: 3000
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' component='h1' noWrap sx={{ flexGrow: 1 }}>
            Portal Académico
          </Typography>
          <Button color='inherit'>Cerrar Sesión</Button>
        </Toolbar>
      </AppBar>
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          container={container}
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />  
      </Box>
    </Box>
  );
}

export default Navigation;
