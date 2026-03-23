import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { AuthResponse, RepairRequest, CompleteRepairRequest, Technician } from '../types';

const API_BASE_URL = 'http://192.168.1.127:8088/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  let token = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = window.localStorage.getItem('token');
  } else {
    token = await AsyncStorage.getItem('token');
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('technician');
      } else {
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('technician');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (phone: string, password: string): Promise<{ data: AuthResponse }> => {
    const response = await api.post<AuthResponse>('/technician/login', { phone, password });
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('token', response.data.token);
      window.localStorage.setItem('technician', JSON.stringify(response.data.user));
    } else {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('technician', JSON.stringify(response.data.user));
    }
    return { data: response.data };
  },

  register: async (data: {
    phone: string;
    name: string;
    password: string;
    email?: string;
    service_area?: string;
  }): Promise<{ data: Technician }> => {
    const response = await api.post('/technician/register', data);
    return { data: response.data };
  },

  updateFCMToken: async (fcmToken: string): Promise<void> => {
    await api.put('/technician/fcm-token', { fcm_token: fcmToken });
  },
};

export const jobsApi = {
  list: async (): Promise<{ data: RepairRequest[] }> => {
    const response = await api.get<RepairRequest[]>('/technician/repair-requests');
    return { data: response.data };
  },

  accept: async (requestId: number): Promise<{ data: { message: string } }> => {
    const response = await api.post(`/technician/repair-requests/${requestId}/accept`);
    return { data: response.data };
  },
};

export const assignmentsApi = {
  list: async (): Promise<{ data: RepairRequest[] }> => {
    const response = await api.get<RepairRequest[]>('/technician/assignments');
    return { data: response.data };
  },

  start: async (assignmentId: number): Promise<{ data: { message: string } }> => {
    const response = await api.post(`/technician/assignments/${assignmentId}/start`);
    return { data: response.data };
  },

  complete: async (
    assignmentId: number,
    data: CompleteRepairRequest
  ): Promise<{ data: { message: string } }> => {
    const response = await api.post(`/technician/assignments/${assignmentId}/complete`, data);
    return { data: response.data };
  },
};

export default api;
