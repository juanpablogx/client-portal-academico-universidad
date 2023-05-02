import { useEffect, useRef, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon, ModeEdit as ModeEditIcon } from '@mui/icons-material';


const List = ({ programas, setProgramas, setModo, editarProgramaRef, eliminarProgramaRef, setOpenDialogDelete }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const columnas = [
    { field: 'id_prog', headerName: 'ID', type: 'number', minWidth: 70 },
    { field: 'codigo', headerName: 'Código', minWidth: 100 },
    { field: 'nombre_programa', headerName: 'Nombre', minWidth: 200 },
    { field: 'nombre_facultad', headerName: 'Facultad', minWidth: 200 },
    { field: 'tipo', headerName: 'Tipo', minWidth: 130 },
    {
      field: 'actions', 
      type: 'actions', 
      minWidth: 130,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label='Eliminar'
          onClick={() => {
            eliminarProgramaRef.current = params.row;
            setOpenDialogDelete(true);
            setModo('eliminar');
          }}
        />,
        <GridActionsCellItem
          icon={<ModeEditIcon />}
          label='Editar'
          onClick={() => {
            editarProgramaRef.current = params.row;
            setModo('editar');
          }}
          showInMenu
        />,
      ]
    },
  ];

  useEffect(() => {
    const getProgramas = async () => {
      try {
        const response = await fetchApi(getToken()).get('/programas_academicos');
        let listProgramas = response.data?.programas;
        setProgramas(listProgramas ?? []);
        if (!listProgramas || listProgramas.length === 0) {
          dataAlert.current = {msg: 'No hay programas para mostrar', severity: 'info'};
          setOpenAlert(true);
        }
      } catch (err) {
        console.log(err);
        dataAlert.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        setOpenAlert(true);
      }
      setCargando(false);
    };

    setCargando(true);
    getProgramas();
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
          rows={programas}
          columns={columnas}
          getRowId={(row) => row.id_prog}
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