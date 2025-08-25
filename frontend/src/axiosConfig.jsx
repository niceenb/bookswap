import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://13.239.135.216:5001', // live
  //add comment
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
