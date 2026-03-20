import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (phone: string, name: string, email: string, password: string) =>
    api.post('/customer/register', { phone, name, email, password }),
  login: (phone: string, password: string) =>
    api.post('/customer/login', { phone, password }),
};

export const repairApi = {
  create: (data: any) => api.post('/customer/repair-requests', data),
  list: () => api.get('/customer/repair-requests'),
  get: (id: number) => api.get(`/customer/repair-requests/${id}`),
  updateFCMToken: (token: string) =>
    api.put('/customer/repair-requests/0/fcm-token', { fcm_token: token }),
};

export default api;
