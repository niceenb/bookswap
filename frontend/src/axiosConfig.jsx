import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://3.27.183.81:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
