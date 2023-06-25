import { useEffect, useRef, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon, ModeEdit as ModeEditIcon } from '@mui/icons-material';



const List = ({ estudiantes, setEstudiantes, setModo, formikValues, openAlert, setOpenAlert, dataAlertRef, eliminarEstudianteRef, setOpenDialogDelete }) => {

  const [cargando, setCargando] = useState(false);

  const columnas = [
    { field: 'codigo_estudiante', headerName: 'Código', minWidth: 130 },
    { field: 'nombre_completo_estudiante', headerName: 'Estudiante', minWidth: 280 },
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
      ]
    },
  ];

  useEffect(() => {
    const getEstudiantes = async () => {
      try {
        if (formikValues.id_semestre && formikValues.id_asig && formikValues.id_grupo) {
          console.log(formikValues.id_semestre);
          console.log(formikValues.id_asig);
          console.log(formikValues.id_grupo);
          const response = await fetchApi(getToken()).get(`/estudiantes_grupos/grupo/${formikValues.id_grupo}`);
          let listEstudiantes = response.data.estudiantesGrupos;
          console.log(listEstudiantes);
          setEstudiantes(listEstudiantes);
          if (!listEstudiantes || listEstudiantes.length === 0) {
            dataAlertRef.current = {msg: 'No hay estudiantes para mostrar', severity: 'info'};
            setOpenAlert(true);
          }
        }
      } catch (err) {
        console.log(err);
        if (err.code === 'ERR_NETWORK') {
          dataAlertRef.current = {msg: 'El servidor no responde', severity: 'error'};
        } else {
          dataAlertRef.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        }
        setOpenAlert(true);
      }
      setCargando(false);
    };

    setCargando(true);
    getEstudiantes();
  }, [formikValues.id_semestre, formikValues.id_asig, formikValues.id_grupo]);

  return (
    <>
      <LinearProgress sx={{ mb: 1, width: '100%', display: (cargando ? 'block' : 'none') }} />
      {openAlert ? 
      <Notification 
        onClose={() => {setOpenAlert(false)}}
        mensaje={dataAlertRef.current.msg}
        severity={dataAlertRef.current.severity}
      />
      : ''}
      <Box sx={{ pb: 2 }}>
        <DataGrid 
          sx={{ width: '100%' }}
          rows={estudiantes}
          columns={columnas}
          getRowId={(row) => row.codigo_estudiante}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          pageSizeOptions={[10, 15, 35]}
        />
      </Box>
    </>
  );
};

export default List;