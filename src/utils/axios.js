import axios from "axios"

axios.defaults.timeout = 5000;

axios.interceptors.request.use(config => {
  let token = JSON.parse(sessionStorage.getItem("token")) ? JSON.parse(sessionStorage.getItem("token")) : "";
  config.headers.Authorization = token;
  return config;
}, error => {
  // Do something with request error
  return Promise.reject(error);
});


axios.interceptors.response.use(response => {
  // Do something before response is sent
  return response.data;
}, error => {
  // Do something with response error
  return Promise.reject(error);
});


export default axios;
