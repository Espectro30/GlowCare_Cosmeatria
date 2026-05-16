import apiClient from './axios';

export const servicesApi = {
  getAll: async () => {
    const response = await apiClient.get('/servicios/');
    // Normalizar campo image_url -> image para consistencia en el frontend
    return response.data.map(s => ({ ...s, image: s.image_url, duration: `${s.duration_minutes} min` }));
  },
  create: async (serviceData) => {
    const response = await apiClient.post('/servicios/', serviceData);
    return response.data;
  },
  getSchedules: async (serviceId = '') => {
    const response = await apiClient.get(`/servicios/horarios/${serviceId ? `?service_id=${serviceId}` : ''}`);
    return response.data;
  },
  createSchedule: async (data) => {
    const response = await apiClient.post('/servicios/horarios/', data);
    return response.data;
  },
  updateSchedule: async (id, data) => {
    const response = await apiClient.put(`/servicios/horarios/${id}/`, data);
    return response.data;
  },
  deleteSchedule: async (id) => {
    const response = await apiClient.delete(`/servicios/horarios/${id}/`);
    return response.data;
  }
};
