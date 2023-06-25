import { useEffect, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useUserContext } from '../../customHooks/UserProvider';


const List = ({ notas, setNotas, formikValues, openAlert, setOpenAlert, dataAlertRef }) => {
  const { user } = useUserContext();

  const [cargando, setCargando] = useState(false);
  const [promedio, setPromedio] = useState(null);

  const columnas = [
    { field: 'descripcion', headerName: 'Descripción', minWidth: 200 },
    { field: 'nota', headerName: 'Nota', type: 'number', minWidth: 70 },
    { field: 'porcentaje', headerName: 'Porcentaje (%)', type: 'number', minWidth: 100, },
  ];

  useEffect(() => {
    const getNotas = async () => {
      try {
        if (formikValues.id_semestre && formikValues.id_grupo) {
          console.log(formikValues.id_semestre);
          console.log(formikValues.id_grupo);
          const response = await fetchApi(getToken()).get(`/notas_actividades/grupo_asignaturas/${formikValues.id_grupo}/estudiante/${user?.codigo_dni.trim()}`);
          let listNotas = response.data.notasActividades;
          console.log(listNotas);
          setNotas(listNotas);
          if (!listNotas || listNotas.length === 0) {
            dataAlertRef.current = {msg: 'No hay notas para mostrar', severity: 'info'};
            setOpenAlert(true);
            setPromedio(null);
          } 

          const responsePromedio = await fetchApi(getToken()).get(`/estudiantes_grupos/${user?.codigo_dni.trim()}/${formikValues.id_grupo.split('/')[0]}/${formikValues.id_grupo.split('/')[1]}`);
          setPromedio(responsePromedio.data.estudiantesGrupos[0].promedio);
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
    getNotas();
  }, [formikValues.id_semestre, formikValues.id_grupo]);

  useEffect(() => console.log(promedio), [promedio]);

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
      <Typography variant='h5' component='span' sx={{ display: 'block' }}>Promedio: {promedio ?? 0}</Typography>
      <Box sx={{ pb: 2, mt: 2 }}>
        <DataGrid 
          sx={{ width: '100%' }}
          rows={notas}
          columns={columnas}
          getRowId={(row) => row.id_actividad}
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