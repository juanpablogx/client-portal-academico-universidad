import { Backdrop, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { useEffect, useState } from 'react';

const OptionsEsquina = ({ opciones }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleClick = (indexAction) => {
    opciones[indexAction].onClick();
  }

  useEffect(() => console.log(opciones), []);

  return (
    <>
      <Backdrop open={open} />
      <SpeedDial
        ariaLabel='Opciones'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {opciones.map((action, index) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={e => handleClick(index)}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default OptionsEsquina;