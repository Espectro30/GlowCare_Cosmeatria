import { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, PlusCircle, Activity, LayoutDashboard, ShieldCheck, TrendingUp, Search, Bell, X, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/auth';
import { appointmentsApi } from '../api/appointments';

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newCosmiatra, setNewCosmiatra] = useState({ name: '', email: '', specialty: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [message, setMessage] = useState(null);
  const [createdPassword, setCreatedPassword] = useState(null);

  // Logs de actividad simulados (en produccion vendrian del endpoint de auditoria)
  const activityLogs = [
    { color: 'bg-green-500', glow: '#22c55e', text: 'Respaldo automatico exitoso', time: 'Hace 5 minutos' },
    { color: 'bg-brand-500', glow: '#5c8356', text: 'Nueva Cosmiatra registrada', time: 'Hace 1 hora' },
    { color: 'bg-orange-400', glow: '#fb923c', text: 'Login administrativo detectado', time: 'Hace 2 horas (IP: 192.168.1.1)' },
    { color: 'bg-blue-400', glow: '#60a5fa', text: 'Cita creada para paciente demo', time: 'Hace 3 horas' },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsData, appsData] = await Promise.all([
          authApi.getClients(),
          appointmentsApi.getAll()
        ]);
        setClients(clientsData);
        setAppointments(appsData);
      } catch (e) {
        console.error('Error cargando dashboard admin', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateCosmiatra = async (e) => {
    e.preventDefault();
    try {
      const passwordToUse = newCosmiatra.password || `GlowCare${Math.random().toString(36).slice(2, 8).toUpperCase()}!`;
      await authApi.createCosmiatra({ ...newCosmiatra, password: passwordToUse });
      setCreatedPassword(passwordToUse);
      setMessage(`Especialista registrada exitosamente. Credenciales listas para entregar.`);
      setNewCosmiatra({ name: '', email: '', specialty: '', password: '' });
    } catch (err) {
      setMessage('Error al registrar la especialista. Verifique los datos e intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f1] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER DEL PANEL */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-brand-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="z-10">
            <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
              <LayoutDashboard className="w-12 h-12 text-brand-400" /> Panel Maestro <span className="text-brand-400">GlowCare</span>
            </h1>
            <p className="text-brand-300 font-bold mt-2 uppercase tracking-[0.3em] text-[10px]">Sistema de Gestion Clinica v2.1.0</p>
          </div>
          <div className="flex gap-4 z-10 w-full md:w-auto relative">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-none bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1 active:scale-95"
            >
              <UserPlus className="w-6 h-6" /> Registrar Staff
            </button>
            {/* BOTON NOTIFICACIONES */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-brand-800 p-4 rounded-2xl text-white relative hover:bg-brand-700 transition-all"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-800 animate-pulse" />
            </button>
            {/* DROPDOWN NOTIFICACIONES */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-brand-50 p-6 z-50 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-brand-950 text-sm uppercase tracking-widest">Actividad Reciente</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-brand-300 hover:text-brand-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {activityLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-brand-50 rounded-2xl">
                      <span className={`w-2.5 h-2.5 ${log.color} rounded-full mt-1.5 flex-shrink-0`} />
                      <div>
                        <p className="text-sm font-bold text-brand-950">{log.text}</p>
                        <p className="text-[10px] text-brand-400 font-black uppercase mt-0.5">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* METRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-brand-500 hover:shadow-xl transition-all group">
            <div className="bg-brand-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-brand-600" />
            </div>
            <p className="text-brand-400 font-black text-xs uppercase tracking-widest mb-1">Pacientes Activos</p>
            <h3 className="text-5xl font-black text-brand-950 tracking-tighter">{clients.length}</h3>
            <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 w-fit px-3 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12% este mes
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-brand-700 hover:shadow-xl transition-all group">
            <div className="bg-brand-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8 text-brand-700" />
            </div>
            <p className="text-brand-400 font-black text-xs uppercase tracking-widest mb-1">Citas Totales</p>
            <h3 className="text-5xl font-black text-brand-950 tracking-tighter">{appointments.length}</h3>
            <p className="mt-4 text-brand-500 font-bold text-xs uppercase tracking-tighter">Registradas en el sistema</p>
          </div>

          <div className="bg-brand-800 p-8 rounded-[2.5rem] shadow-2xl text-white hover:bg-brand-700 transition-all group">
            <div className="bg-brand-900/50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-brand-400" />
            </div>
            <p className="text-brand-300 font-black text-xs uppercase tracking-widest mb-1">Seguridad Clinica</p>
            <h3 className="text-4xl font-black tracking-tighter">OWASP v3</h3>
            <div className="mt-4 flex items-center gap-2 text-brand-200 font-bold text-xs">
              <Activity className="w-4 h-4 animate-pulse" /> Servidores estables
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-brand-300 hover:shadow-xl transition-all">
            <div className="bg-brand-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <PlusCircle className="w-8 h-8 text-brand-400" />
            </div>
            <p className="text-brand-400 font-black text-xs uppercase tracking-widest mb-1">Estado General</p>
            <h3 className="text-3xl font-black text-brand-950 tracking-tighter">Productivo</h3>
            <p className="mt-4 text-brand-500 font-bold text-[10px] uppercase tracking-tighter">GlowCare v2.1.0 Enterprise</p>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* TABLA PACIENTES */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-xl p-10 border border-brand-50">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-brand-950 tracking-tighter">Gestion de Pacientes</h2>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                <input type="text" placeholder="Buscar..." className="pl-11 pr-6 py-3 bg-brand-50 border border-brand-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 font-bold text-sm w-56 transition-all" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-brand-50 text-brand-400 font-black text-[10px] uppercase tracking-[0.2em]">
                    <th className="pb-6 px-4">Paciente</th>
                    <th className="pb-6 px-4">Contacto</th>
                    <th className="pb-6 px-4 text-center">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {loading ? (
                    <tr><td colSpan="3" className="py-20 text-center font-black text-brand-200 uppercase tracking-widest">Consultando datos...</td></tr>
                  ) : clients.length === 0 ? (
                    <tr><td colSpan="3" className="py-20 text-center font-bold text-brand-400 italic">No se han registrado pacientes aun.</td></tr>
                  ) : clients.map(c => (
                    <tr key={c.id} className="group hover:bg-brand-50/50 transition-colors">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center font-black text-brand-600 uppercase">
                            {c.first_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-black text-brand-950 text-lg leading-tight">{c.first_name || 'Usuario Demo'}</p>
                            <p className="text-[10px] font-black text-brand-400 uppercase tracking-tighter">ID: #{String(c.id).slice(0, 6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                        <p className="font-bold text-brand-800 text-sm">{c.email}</p>
                        <p className="text-xs text-brand-400 font-medium">Historial: 0 citas</p>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <button className="bg-brand-50 text-brand-700 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-900 hover:text-white transition-all shadow-sm">
                          Auditar Perfil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDEBAR DERECHO */}
          <div className="space-y-8">
            {/* LOGS DE ACTIVIDAD */}
            <div className="bg-brand-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-500 opacity-20 rounded-full -ml-10 -mb-10 blur-3xl" />
              <h3 className="text-brand-400 font-black text-xs uppercase tracking-widest mb-6 border-b border-brand-800 pb-4">Actividad del Sistema</h3>
              <div className="space-y-5">
                {activityLogs.map((log, i) => (
                  <div key={i} className="flex gap-4 items-start border-l-2 border-brand-700 pl-5 pb-5 last:pb-0">
                    <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: log.glow, boxShadow: `0 0 10px ${log.glow}` }} />
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{log.text}</p>
                      <p className="text-[10px] text-brand-400 font-black uppercase mt-1">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOPORTE */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-brand-50">
              <h3 className="font-black text-brand-950 mb-6 text-lg tracking-tighter italic">
                "GlowCare no es solo software, es la extension digital de tu clinica."
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-900 rounded-full flex items-center justify-center font-black text-white text-xs">GC</div>
                <div>
                  <p className="font-black text-brand-950 text-sm">Soporte Tecnico</p>
                  <p className="text-xs text-brand-500 font-bold">Linea de emergencia activa 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ALTA DE ESPECIALISTA */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] max-w-lg w-full border border-brand-100 animate-in zoom-in-95 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setShowModal(false); setMessage(null); setCreatedPassword(null); }} className="absolute top-8 right-8 text-brand-300 hover:text-brand-900 transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="bg-brand-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6">
              <UserPlus className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="text-3xl font-black text-brand-950 mb-2 tracking-tighter">Alta de Especialista</h2>
            <p className="text-brand-500 text-sm mb-8 font-bold">Crea una identidad profesional para el nuevo miembro del equipo.</p>

            {/* CREDENCIALES CREADAS */}
            {createdPassword && (
              <div className="mb-6 p-5 bg-brand-900 text-white rounded-3xl font-bold text-sm border-l-8 border-brand-400">
                <p className="font-black text-brand-300 text-xs uppercase tracking-widest mb-3">Credenciales de Acceso — Entregar al Especialista</p>
                <p>Email: <span className="text-brand-200 font-black">{newCosmiatra.email || 'el correo registrado'}</span></p>
                <p className="mt-1">Contrasena temporal: <span className="text-white font-black bg-brand-700 px-3 py-1 rounded-lg inline-block mt-1">{createdPassword}</span></p>
                <p className="text-[10px] text-brand-400 mt-3">Recomendamos que el especialista cambie su contrasena en el primer acceso.</p>
              </div>
            )}

            {message && !createdPassword && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl font-bold text-sm">{message}</div>
            )}

            <form onSubmit={handleCreateCosmiatra} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Nombre Completo</label>
                <input required type="text" placeholder="Dra. Elena Perez" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 outline-none focus:ring-4 focus:ring-brand-500/20 font-black text-brand-900 placeholder:text-brand-300 transition-all" value={newCosmiatra.name} onChange={e => setNewCosmiatra({ ...newCosmiatra, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Correo Institucional</label>
                <input required type="email" placeholder="elena@glowcare.com" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 outline-none focus:ring-4 focus:ring-brand-500/20 font-black text-brand-900 placeholder:text-brand-300 transition-all" value={newCosmiatra.email} onChange={e => setNewCosmiatra({ ...newCosmiatra, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Especialidad Clinica</label>
                <input required type="text" placeholder="Cosmiatra Facial / Dermatologia" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 outline-none focus:ring-4 focus:ring-brand-500/20 font-black text-brand-900 placeholder:text-brand-300 transition-all" value={newCosmiatra.specialty} onChange={e => setNewCosmiatra({ ...newCosmiatra, specialty: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Contrasena Temporal <span className="text-brand-300 normal-case font-bold">(opcional, se genera automaticamente)</span></label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} placeholder="Dejar vacio para generar automaticamente" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 outline-none focus:ring-4 focus:ring-brand-500/20 font-black text-brand-900 placeholder:text-brand-300 transition-all pr-14" value={newCosmiatra.password} onChange={e => setNewCosmiatra({ ...newCosmiatra, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-700">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-brand-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-brand-800 transition-all hover:-translate-y-1 active:scale-95">
                  Registrar en GlowCare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
