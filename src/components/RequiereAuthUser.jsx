import React, { useEffect } from 'react';
import { useUserContext } from '../customHooks/UserProvider';
import { useNavigate } from 'react-router-dom';
import { fetchApi, getToken, setToken } from '../tools/api';

const RequiereAuthUser = ({ children }) => {
  const { user, setUser } = useUserContext();

  const navigate = useNavigate();

  useEffect(() => {
    console.log(user);
    const auth = async () => {
      if (!getToken()) {
        navigate('/login', { replace: true })
        return;
      }

      try {
        const response = await fetchApi(getToken()).post('/usuarios/authenticateToken');
        console.log(response.data.user);
        if (response.data.user) {
          setUser(response.data.user);
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.log(err);
        setToken(null);
        navigate('/login', { replace: true });
      }
    };

    auth();
  }, []);

  
  return (
    <>
      {user ? children : null}
    </>
  );
};

export default RequiereAuthUser;