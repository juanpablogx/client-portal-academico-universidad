import { useEffect, useRef, useState } from 'react';
import { fetchApi, getToken } from '../../tools/api';
import Notification from '../Notifications';
import { Box, LinearProgress, MenuItem, TextField } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Delete as DeleteIcon, ModeEdit as ModeEditIcon } from '@mui/icons-material';


const List = ({ grupos, setGrupos, setModo, editarGrupoRef, eliminarGrupoRef, setOpenDialogDelete }) => {
  const [openAlert, setOpenAlert] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [semestres, setSemestres] = useState([]);
  const [idSemestreActual, setIdSemestreActual] = useState(null);

  const dataAlert = useRef({msg: '', severity: 'warning'});

  const columnas = [
    { field: 'id_asig', headerName: 'ID Asignatura', type: 'number', minWidth: 70 },
    { field: 'nombre_asignatura', headerName: 'Asignatura', minWidth: 150 },
    { field: 'numero_grupo', headerName: 'Número', type: 'number', minWidth: 50 },
    { field: 'nombre_docente', headerName: 'Nombre Docente', minWidth: 200 },
    {
      field: 'horarios', 
      headerName: 'Horarios', 
      minWidth: 400,
      valueGetter: (params) => {
        return params.row.horarios.map(hor => `${hor.dia} ${hor.hora_inicio}-${hor.hora_fin}${hor.salon ? ' '+hor.salon : ''}`).join(', ');
      } 
    },
    {
      field: 'actions', 
      type: 'actions', 
      minWidth: 130,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label='Eliminar'
          onClick={() => {
            eliminarGrupoRef.current = params.row;
            setOpenDialogDelete(true);
            setModo('eliminar');
          }}
        />,
        <GridActionsCellItem
          icon={<ModeEditIcon />}
          label='Editar'
          onClick={() => {
            editarGrupoRef.current = params.row;
            setModo('editar');
          }}
          showInMenu
        />,
      ]
    },
  ];

  useEffect(() => {
    const getSemestres = async () => {
      try {
        const responseSemestres = await fetchApi(getToken()).get('/semestres');
        let listSemestres = responseSemestres.data?.semestres;
        setSemestres(listSemestres ?? []);
        setIdSemestreActual(listSemestres.length > 0 ? listSemestres[0].id_semestre : null);
        if (!listSemestres || listSemestres.length === 0) {
          dataAlert.current = {msg: 'No hay semestres', severity: 'warning'};
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
    }

    getSemestres();
  }, []);

  useEffect(() => {
    const getGrupos = async () => {
      try {
        console.log(idSemestreActual);
        if (idSemestreActual) {
          const response = await fetchApi(getToken()).get(`/grupos_asignaturas_horarios/semestre/${idSemestreActual}`);
          let listGrupos = response.data?.gruposAsignaturasHorarios;
          console.log(listGrupos);
          setGrupos(listGrupos ?? []);
          if (!listGrupos || listGrupos.length === 0) {
            dataAlert.current = {msg: 'No hay grupos para mostrar', severity: 'info'};
            setOpenAlert(true);
          }
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
    getGrupos();
  }, [idSemestreActual]);

  return (
    <>
      {semestres.length > 0 ?
        <TextField
          margin='normal'
          name='id_semestre'
          label='Semestre'
          id='id_semestre'
          select
          value={idSemestreActual}
          onChange={e => setIdSemestreActual(e.target.value)}
          size='small'
          sx={{ minWidth: '150px' }}
        >
          {semestres.map(semestre => (
            <MenuItem key={semestre.id_semestre} value={semestre.id_semestre}>
              {`${semestre.year}-${semestre.numero}`}
            </MenuItem>
          ))}
        </TextField>
        : null
      }
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
          rows={grupos}
          columns={columnas}
          getRowId={(row) => `${row.id_asig}${row.id_semestre}${row.numero_grupo}`}
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