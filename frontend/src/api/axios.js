import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de SOLICITUD: Adjuntar token JWT desde localStorage antes de cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('glowcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPUESTA: Manejar errores de sesión expirada globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar token inválido para forzar nuevo login
      localStorage.removeItem('glowcare_token');
      localStorage.removeItem('glowcare_user');
      console.warn('Sesión GlowCare expirada o inválida. Limpiando estado local.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
