import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen pt-20 flex justify-center bg-brand-50">
        <h2 className="text-xl text-brand-700 font-bold">Cargando Seguridad...</h2>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}
