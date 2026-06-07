import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Primero intentar recuperar sesión desde localStorage (rápido, sin red)
    const cachedUser = localStorage.getItem('glowcare_user');
    const token = localStorage.getItem('glowcare_token');

    if (cachedUser && token) {
      try {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        // Verificar en background que el token sigue siendo válido
        authApi.getProfile()
          .then(freshData => setUser(freshData))
          .catch(() => {
            // Token expirado: limpiar sesión
            localStorage.removeItem('glowcare_token');
            localStorage.removeItem('glowcare_user');
            setUser(null);
          });
      } catch {
        setUser(null);
        setLoading(false);
      }
    } else {
      // Sin token guardado: no hay sesión
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
