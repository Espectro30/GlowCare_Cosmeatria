import apiClient from './axios';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/usuarios/login/', { email, password });
    const data = response.data;

    // Guardar token y usuario en localStorage para persistencia entre páginas
    if (data.access_token) {
      localStorage.setItem('glowcare_token', data.access_token);
    }
    if (data.user) {
      localStorage.setItem('glowcare_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/usuarios/register/', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/usuarios/logout/');
    } catch (e) {
      // Silenciar errores de logout del servidor
    } finally {
      // Limpiar estado local siempre
      localStorage.removeItem('glowcare_token');
      localStorage.removeItem('glowcare_user');
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/usuarios/me/');
    return response.data;
  },

  getClients: async () => {
    const response = await apiClient.get('/usuarios/clients/');
    return response.data;
  },

  getStaff: async () => {
    const response = await apiClient.get('/usuarios/staff/');
    return response.data;
  },

  createCosmiatra: async (cosmiatraData) => {
    const response = await apiClient.post('/usuarios/create-cosmiatra/', cosmiatraData);
    return response.data;
  },

  updateStaff: async (id, data) => {
    const response = await apiClient.patch(`/usuarios/staff/${id}/`, data);
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await apiClient.delete(`/usuarios/staff/${id}/delete/`);
    return response.data;
  },
  
  getNotifications: async () => {
    const response = await apiClient.get('/usuarios/notifications/');
    return response.data;
  },
  
  markNotificationRead: async (id) => {
    const response = await apiClient.patch(`/usuarios/notifications/${id}/read/`);
    return response.data;
  }
};
