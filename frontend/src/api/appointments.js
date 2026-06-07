import apiClient from './axios';

export const appointmentsApi = {
  // Obtener citas (Filtra por backend segun sea Admin, Cosmiatra o Cliente)
  getAll: async () => {
    const response = await apiClient.get('/citas/');
    return response.data;
  },

  // Crear una nueva cita con validación de pago P2P
  create: async (appointmentData) => {
    const response = await apiClient.post('/citas/crear/', appointmentData);
    return response.data;
  },

  // Cambiar estado de una cita (Solo Staff/Admin)
  updateStatus: async (appointmentId, status) => {
    const response = await apiClient.patch(`/citas/status/${appointmentId}/`, { status });
    return response.data;
  }
};
