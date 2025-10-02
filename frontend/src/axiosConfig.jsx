import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://52.64.174.115:5001', // local
  // baseURL: 'http://13.55.31.24:5001', // live
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
