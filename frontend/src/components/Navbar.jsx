import { Link } from 'react-router-dom'
import { UserCircle, LogOut, CalendarDays, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.svg'

export default function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-white text-brand-900 sticky top-0 z-50 border-b border-nut-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">

        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
          <img src={logo} alt="GlowCare Logo" className="w-10 h-10" />
          <span className="font-black text-2xl tracking-tighter uppercase italic text-brand-800">
            Glow<span className="text-brand-500">Care</span>
          </span>
        </Link>

        {/* NAVEGACION */}
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              {/* ADMIN */}
              {user.role === 'admin' && (
                <Link
                  to="/admin-dashboard"
                  className="flex items-center gap-2 bg-brand-700 text-white font-black hover:bg-brand-800 transition-all text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel Maestro
                </Link>
              )}
              {/* COSMIATRA */}
              {user.role === 'cosmiatra' && (
                <Link
                  to="/agenda-especialista"
                  className="flex items-center gap-2 bg-brand-600 text-white font-black hover:bg-brand-700 transition-all text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-md"
                >
                  <CalendarDays className="w-4 h-4" />
                  Mi Agenda
                </Link>
              )}
              {/* SECRETARIA */}
              {user.role === 'secretaria' && (
                <Link
                  to="/secretaria-dashboard"
                  className="flex items-center gap-2 bg-brand-600 text-white font-black hover:bg-brand-700 transition-all text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel Secretaria
                </Link>
              )}
              {/* CLIENTE */}
              {user.role === 'cliente' && (
                <Link
                  to="/mi-calendario"
                  className="text-brand-700 font-black hover:text-brand-500 transition-colors text-xs uppercase tracking-widest"
                >
                  Mis Citas
                </Link>
              )}
              {/* PERFIL */}
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 text-brand-700 font-black hover:text-brand-500 transition-colors text-xs uppercase tracking-widest"
              >
                <UserCircle className="w-4 h-4" />
                Perfil
              </Link>
              {/* SALIR */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-nut-50 border border-nut-200 text-nut-700 px-5 py-2.5 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all font-black text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-2 bg-brand-600 text-white px-7 py-3 rounded-xl hover:bg-brand-700 transition-all shadow-md font-black uppercase text-xs tracking-widest"
            >
              <UserCircle className="w-5 h-5" />
              <span>Ingresar</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
