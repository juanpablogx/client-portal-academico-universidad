import axios from 'axios';

const URL_API = 'http://localhost:4000/';

const fetchApi = jwtTokenUsuario => {
  const config = {
    baseURL: URL_API,
  };

  if (jwtTokenUsuario && jwtTokenUsuario !== null && jwtTokenUsuario.length > 0) {
    config.headers = {Authorization: `Bearer ${jwtTokenUsuario}`};
  }
  return axios.create(config);
};

const setToken = (token) => {
  localStorage.setItem('token', token);
};

function getToken() {
  return localStorage.getItem('token');
}

export {
  fetchApi,
  getToken,
  setToken
};