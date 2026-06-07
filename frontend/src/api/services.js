import apiClient from './axios';

export const servicesApi = {
  getAll: async () => {
    const response = await apiClient.get('/servicios/');
    // Normalizar campo image_url -> image para consistencia en el frontend
    return response.data.map(s => ({ ...s, image: s.image_url, duration: `${s.duration_minutes} min` }));
  },
  create: async (serviceData) => {
    // Si serviceData es FormData, axios lo maneja automáticamente
    const response = await apiClient.post('/servicios/', serviceData, {
      headers: serviceData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },
  update: async (id, serviceData) => {
    const response = await apiClient.put(`/servicios/${id}/`, serviceData, {
      headers: serviceData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
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
  },
  validateCoupon: async (code) => {
    const response = await apiClient.post('/servicios/cupones/validar/', { code });
    return response.data;
  },
  getReviews: async (id) => {
    const response = await apiClient.get(`/servicios/${id}/reviews/`);
    return response.data;
  },
  createReview: async (id, data) => {
    const response = await apiClient.post(`/servicios/${id}/reviews/`, data);
    return response.data;
  }
};

export const cuponesApi = {
  getAll: async () => {
    const response = await apiClient.get('/servicios/cupones/');
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/servicios/cupones/', data);
    return response.data;
  }
};

export const storeApi = {
  getProducts: async () => {
    const response = await apiClient.get('/servicios/store/products/');
    return response.data;
  },
  createProduct: async (data) => {
    const response = await apiClient.post('/servicios/store/products/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },
  redeemProduct: async (product_id) => {
    const response = await apiClient.post('/servicios/store/redemptions/', { product_id });
    return response.data;
  },
  getMyRedemptions: async () => {
    const response = await apiClient.get('/servicios/store/redemptions/');
    return response.data;
  },
  getAllRedemptions: async () => {
    const response = await apiClient.get('/servicios/store/redemptions/all/');
    return response.data;
  },
  deliverRedemption: async (id, formData) => {
    const response = await apiClient.patch(`/servicios/store/redemptions/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
