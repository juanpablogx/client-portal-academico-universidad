import { useEffect, useRef, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon, ModeEdit as ModeEditIcon } from '@mui/icons-material';


const List = ({ asignaturas, setAsignaturas, setModo, editarAsignaturaRef, eliminarAsignaturaRef, setOpenDialogDelete }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const columnas = [
    { field: 'id_asig', headerName: 'ID', type: 'number', minWidth: 70 },
    { field: 'codigo_asig', headerName: 'Código', minWidth: 100 },
    { field: 'nombre_asignatura', headerName: 'Nombre', minWidth: 200 },
    { field: 'codigo_programa', headerName: 'Código Programa', minWidth: 100 },
    { field: 'nombre_programa', headerName: 'Programa', minWidth: 200 },
    { field: 'creditos', headerName: 'Créditos', type: 'number', minWidth: 100 },
    {
      field: 'actions', 
      type: 'actions', 
      minWidth: 130,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label='Eliminar'
          onClick={() => {
            eliminarAsignaturaRef.current = params.row;
            setOpenDialogDelete(true);
            setModo('eliminar');
          }}
        />,
        <GridActionsCellItem
          icon={<ModeEditIcon />}
          label='Editar'
          onClick={() => {
            editarAsignaturaRef.current = params.row;
            setModo('editar');
          }}
          showInMenu
        />,
      ]
    },
  ];

  useEffect(() => {
    const getAsignaturas = async () => {
      try {
        const response = await fetchApi(getToken()).get('/asignaturas');
        let listAsignaturas = response.data?.asignaturas;
        setAsignaturas(listAsignaturas ?? []);
        if (!listAsignaturas || listAsignaturas.length === 0) {
          dataAlert.current = {msg: 'No hay asignaturas para mostrar', severity: 'info'};
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
    getAsignaturas();
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
          rows={asignaturas}
          columns={columnas}
          getRowId={(row) => row.id_asig}
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