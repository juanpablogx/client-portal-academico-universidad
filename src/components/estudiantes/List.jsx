import { useEffect, useRef, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon, ModeEdit as ModeEditIcon } from '@mui/icons-material';


const List = ({ estudiantes, setEstudiantes, setModo, editarEstudianteRef, eliminarEstudianteRef, setOpenDialogDelete }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const columnas = [
    { field: 'codigo_dni', headerName: 'Código', type: 'number', minWidth: 100 },
    { field: 'nombre_completo', headerName: 'Nombre Completo', minWidth: 200 },
    { field: 'correo_inst', headerName: 'Correo Institucional', minWidth: 200 },
    { field: 'celular', headerName: 'Celular', minWidth: 100 },
    {
      field: 'actions', 
      type: 'actions', 
      minWidth: 130,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label='Eliminar'
          onClick={() => {
            eliminarEstudianteRef.current = params.row;
            setOpenDialogDelete(true);
            setModo('eliminar');
          }}
        />,
        <GridActionsCellItem
          icon={<ModeEditIcon />}
          label='Editar'
          onClick={() => {
            editarEstudianteRef.current = params.row;
            setModo('editar');
          }}
          showInMenu
        />,
      ]
    },
  ];

  useEffect(() => {
    const getDocentes = async () => {
      try {
        const response = await fetchApi(getToken()).get('/estudiantes');
        let listDocentes = response.data?.estudiantes;
        setEstudiantes(listDocentes ?? []);
        if (!listDocentes || listDocentes.length === 0) {
          dataAlert.current = {msg: 'No hay estudiantes para mostrar', severity: 'info'};
          setOpenAlert(true);
        }
      } catch (err) {
        console.log(err);
        if (err.code === 'ERR_NETWORK') {
          dataAlert.current = {msg: 'El servidor no responde', severity: 'error'};
        } else {
          dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        }
        setOpenAlert(true);
      }
      setCargando(false);
    };

    setCargando(true);
    getDocentes();
  }, []);

  return (
    <>
      <LinearProgress sx={{ mb: 1, width: '100%', display: (cargando ? 'block' : 'none') }} />
      {openAlert ? 
      <Notification 
        onClose={() => {setOpenAlert(false)}}
        mensaje={dataAlert.current.msg}
        severity={dataAlert.current.severity}
      />
      : ''}
      <Box sx={{ pb: 2 }}>
        <DataGrid 
          sx={{ width: '100%' }}
          rows={estudiantes}
          columns={columnas}
          getRowId={(row) => row.codigo_dni}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          pageSizeOptions={[10, 15, 25]}
        />
      </Box>
    </>
  );
};

export default List;