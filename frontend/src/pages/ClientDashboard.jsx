import { useState, useEffect } from 'react';
import { Calendar, Clock, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { appointmentsApi } from '../api/appointments';
import { Link } from 'react-router-dom';

export default function ClientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await appointmentsApi.getAll();
        setAppointments(data);
      } catch (e) {
        console.error("Error cargando tus citas");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-brand-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-brand-950 tracking-tight">Mis Sesiones GlowCare</h1>
          <p className="text-brand-700 font-medium mt-2">Gestiona tu bienestar y haz seguimiento a tus tratamientos agendados.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black text-brand-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-600" /> Próximas Citas
            </h2>
            
            {loading ? (
              <div className="bg-white p-10 rounded-[2rem] text-center font-bold text-brand-400">Consultando agenda segura...</div>
            ) : appointments.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-brand-200">
                <AlertCircle className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                <p className="text-brand-800 font-bold text-lg">Aún no tienes tratamientos agendados.</p>
                <Link to="/servicios" className="text-brand-600 underline font-black block mt-2">Explora nuestro catálogo ahora</Link>
              </div>
            ) : appointments.map(app => (
              <div key={app.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                <div className="flex gap-5">
                   <div className="bg-brand-50 p-4 rounded-3xl flex items-center justify-center">
                      <Clock className="w-8 h-8 text-brand-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-brand-950 italic">Tratamiento Facial</h3>
                      <div className="flex gap-4 mt-1 text-brand-600 font-bold text-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(app.date_time).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(app.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs font-black text-brand-400 uppercase tracking-widest mt-2 px-3 py-1 bg-brand-50 rounded-full w-fit">Ref Pago: {app.payment_reference}</p>
                   </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                   <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${
                     app.status === 'completada' ? 'bg-green-100 text-green-700' : 
                     app.status === 'pendiente' ? 'bg-orange-100 text-orange-700' : 'bg-brand-100 text-brand-700'
                   }`}>
                     {app.status}
                   </span>
                   <Link to={`/chat/${app.id}`} className="bg-brand-950 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-lg hover:bg-brand-800 w-full md:w-auto justify-center">
                      <MessageCircle className="w-4 h-4" /> Hablar con Especialista
                   </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="bg-brand-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500 opacity-20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <h3 className="text-brand-300 font-black text-xs uppercase tracking-[0.2em] mb-4">Recomendación Médica</h3>
                <p className="text-lg font-bold leading-relaxed mb-6 italic">"Recuerda hidratar tu piel con agua purificada al menos 3 veces al día antes de tu sesión."</p>
                <div className="flex items-center gap-3 bg-brand-800 p-4 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-brand-400" />
                    <p className="text-xs font-bold text-brand-100">Protector solar FPS 50+ obligatorio.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-brand-100">
                <h3 className="font-black text-brand-950 mb-6 text-lg">Beneficios Acumulados</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center bg-brand-50 p-4 rounded-2xl">
                      <span className="font-bold text-brand-700">Puntos Glow</span>
                      <span className="font-black text-brand-900 text-xl">150</span>
                   </div>
                   <p className="text-[10px] text-brand-500 font-bold uppercase text-center">Faltan 50 puntos para tu próximo facial gratis</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
