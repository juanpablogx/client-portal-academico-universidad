import { useEffect, useRef, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress, MenuItem, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useUserContext } from '../../customHooks/UserProvider';
import { Decimal } from 'decimal.js-light';


const List = ({ notas, setNotas, formikValues, openAlert, setOpenAlert, dataAlertRef }) => {
  const { user } = useUserContext();

  const [cargando, setCargando] = useState(false);
  

  const columnas = [
    { field: 'codigo_estudiante', headerName: 'Código', minWidth: 100 },
    { field: 'nombre_completo_estudiante', headerName: 'Estudiante', minWidth: 200 },
    {
      field: 'nota', 
      headerName: 'Nota', 
      type: 'number', 
      minWidth: 50,
      editable: true,
      valueParser: (value, params) => {
        if (value === '') return '';
        let nota = new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_DOWN);
        if (nota.lessThan(0)) return 0;
        if (nota.greaterThan(5)) return 5;
        return nota.toNumber();
      },
      
    },
  ];

  useEffect(() => {
    const getNotas = async () => {
      try {
        if (formikValues.id_semestre && formikValues.id_grupo && formikValues.id_actividad) {
          console.log(formikValues.id_semestre);
          console.log(formikValues.id_grupo);
          console.log(formikValues.id_actividad);
          const response = await fetchApi(getToken()).get(`/notas_actividades/grupo_asignaturas/${formikValues.id_grupo}/actividad/${formikValues.id_actividad}`);
          let listNotas = response.data.notasActividades;
          console.log(listNotas);
          setNotas(listNotas);
          if (!listNotas || listNotas.length === 0) {
            dataAlertRef.current = {msg: 'No hay notas para mostrar', severity: 'info'};
            setOpenAlert(true);
          }
        }
      } catch (err) {
        console.log(err);
        dataAlertRef.current = {msg: (err.response.status === 401 ? 'La sesión expiró, inicia sesión' : err.response.data.message), severity: 'error'};
        setOpenAlert(true);
      }
      setCargando(false);
    };

    setCargando(true);
    getNotas();
  }, [formikValues.id_semestre, formikValues.id_grupo, formikValues.id_actividad]);

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
          rows={notas}
          columns={columnas}
          getRowId={(row) => row.codigo_estudiante}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          pageSizeOptions={[10, 15, 25]}
          processRowUpdate={(updatedNota, oldNota) => {
            console.log(updatedNota);
            console.log(oldNota);
            if (updatedNota.nota !== oldNota.nota) {
              const codigo_estudiante = updatedNota.codigo_estudiante.trim();
              const nota = updatedNota.nota === '' ? 0 : updatedNota.nota;
              setNotas(state => {
                let nuevasNotas = state.map((value, index) => {
                  if (value.codigo_estudiante.trim() === codigo_estudiante) {
                    return {...value, nota: new Decimal(nota).toDecimalPlaces(2, Decimal.ROUND_DOWN).toNumber()}
                  } else {
                    return value;
                  }
                });

                return nuevasNotas;
              });

              return updatedNota;
            } else {
              return oldNota;
            }
          }}
          onProcessRowUpdateError={err => console.log(err)}
        />
      </Box>
    </>
  );
};

export default List;