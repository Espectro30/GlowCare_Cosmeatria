import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Services from './pages/Services'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

import ServiceDetail from './pages/ServiceDetail'
import PaymentFlow from './pages/PaymentFlow'
import ClientDashboard from './pages/ClientDashboard'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'
import CosmiatraDashboard from './pages/CosmiatraDashboard'
import { ProtectedRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/servicio/:id" element={<ServiceDetail />} />
          <Route path="/checkout" element={<ProtectedRoute><PaymentFlow /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/mi-calendario" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
          <Route path="/agenda-especialista" element={<ProtectedRoute><CosmiatraDashboard /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="bg-brand-950 border-t border-brand-800 py-12 text-center text-brand-500 mt-auto">
        <p className="font-black uppercase tracking-[0.4em] text-[10px]">© 2026 GlowCare Cosmiatría | Tecnología y Bienestar Organico</p>
      </footer>
    </div>
  )
}

export default App
