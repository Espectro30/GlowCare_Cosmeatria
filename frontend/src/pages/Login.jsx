import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-brand-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
        <h2 className="text-3xl font-extrabold text-center text-brand-900 mb-2 mt-4">Bienvenido de vuelta</h2>
        <p className="text-center text-brand-500 mb-8">Ingresa tus credenciales reales</p>
        
        {error && <div className="mb-4 text-center text-sm font-bold bg-red-100 text-red-600 p-3 rounded-lg">{error}</div>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" 
              placeholder="tu@correo.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-brand-800 hover:bg-brand-900 disabled:bg-brand-300 text-white font-black py-4 rounded-2xl mt-6 transition-all shadow-xl hover:shadow-2xl flex justify-center items-center gap-2 uppercase tracking-widest text-sm transform hover:-translate-y-0.5 active:translate-y-0">
            {loading ? 'Validando Seguridad...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p className="text-center mt-10 border-t border-brand-100 pt-6 text-brand-700 font-medium">
          ¿No tienes una cuenta aún? <Link to="/registro" className="font-extrabold text-brand-900 hover:text-brand-600 transition-colors uppercase tracking-widest text-xs inline-block ml-2 border border-brand-200 px-3 py-1 rounded">Crea tu cuenta</Link>
        </p>
      </div>
    </div>
  )
}
