import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
