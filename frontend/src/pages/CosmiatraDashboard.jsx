import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, User, Briefcase, PlusCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { appointmentsApi } from '../api/appointments';
import { servicesApi } from '../api/services';

export default function CosmiatraDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  const [newSchedule, setNewSchedule] = useState({ 
    service: '', 
    date: '', 
    start_time: '', 
    end_time: '' 
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [apps, scheds, srvs] = await Promise.all([
        appointmentsApi.getAll(),
        servicesApi.getSchedules(), // This fetches all schedules for this cosmiatra
        servicesApi.getAll()
      ]);
      setAppointments(apps);
      setSchedules(scheds);
      setServices(srvs);
    } catch (e) {
      console.error("Error cargando dashboard:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleCompleteAppt = async (id) => {
    try {
      await appointmentsApi.updateStatus(id, 'completada');
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'completada' } : a));
    } catch (e) {
      alert("Error al actualizar la cita.");
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await servicesApi.updateSchedule(editingSchedule.id, newSchedule);
      } else {
        await servicesApi.createSchedule(newSchedule);
      }
      setShowScheduleModal(false);
      setEditingSchedule(null);
      setNewSchedule({ service: '', date: '', start_time: '', end_time: '' });
      loadData();
    } catch (err) {
      alert("Error al guardar el horario.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("¿Segura que deseas eliminar este horario publicado?")) {
      try {
        await servicesApi.deleteSchedule(id);
        loadData();
      } catch (e) {
        alert("Error al eliminar horario");
      }
    }
  };

  const openEditModal = (sched) => {
    setEditingSchedule(sched);
    setNewSchedule({
      service: sched.service,
      date: sched.date,
      start_time: sched.start_time,
      end_time: sched.end_time
    });
    setShowScheduleModal(true);
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setNewSchedule({ service: '', date: '', start_time: '', end_time: '' });
    setShowScheduleModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] p-6 md:p-12 font-sans selection:bg-brand-100">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-10 rounded-[3.5rem] shadow-xl border border-brand-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="z-10">
            <h1 className="text-4xl font-black text-brand-950 flex items-center gap-4 tracking-tighter">
              <Briefcase className="w-12 h-12 text-brand-600" /> Agenda de la Especialista
            </h1>
            <p className="text-brand-500 font-black mt-2 uppercase tracking-[0.4em] text-[10px]">Gestión de Cupos y Pacientes</p>
          </div>
          <button 
             onClick={openCreateModal}
             className="mt-6 md:mt-0 bg-brand-900 hover:bg-brand-800 text-white px-8 py-5 rounded-[2rem] font-black flex items-center gap-3 transition-all shadow-2xl hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-widest"
          >
             <PlusCircle className="w-5 h-5" /> Publicar Nuevo Horario
          </button>
        </header>

        {loading ? (
          <div className="bg-white p-20 rounded-[3rem] text-center font-black text-brand-200 uppercase tracking-[0.3em] animate-pulse border border-brand-50">Sincronizando Sistema...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* COLUMNA 1: MIS HORARIOS PUBLICADOS */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-2xl font-black text-brand-950 tracking-tighter">Mis Horarios Publicados</h2>
              </div>
              
              {schedules.length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] text-center shadow-lg border border-brand-100">
                  <AlertCircle className="w-16 h-16 text-brand-100 mx-auto mb-6" />
                  <p className="text-brand-950 font-black text-lg tracking-tight">No tienes horarios publicados.</p>
                  <p className="text-brand-400 font-bold mt-2 text-sm">Publica horarios para que los pacientes puedan agendarse.</p>
                </div>
              ) : schedules.map(sched => (
                <div key={sched.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-xl hover:border-brand-200 transition-all group">
                  <div>
                     <h3 className="text-lg font-black text-brand-950">{sched.service_title}</h3>
                     <div className="flex flex-wrap gap-3 mt-2 text-brand-500 font-bold text-xs uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {sched.date}</span>
                       <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {sched.start_time} - {sched.end_time}</span>
                     </div>
                     <p className={`mt-3 text-[10px] font-black uppercase tracking-widest ${sched.is_booked ? 'text-red-500' : 'text-green-500'}`}>
                        {sched.is_booked ? 'Cupo Reservado' : 'Disponible'}
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => openEditModal(sched)} className="p-3 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors">
                        <Edit className="w-5 h-5" />
                     </button>
                     {!sched.is_booked && (
                       <button onClick={() => handleDeleteSchedule(sched.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
                          <Trash2 className="w-5 h-5" />
                       </button>
                     )}
                  </div>
                </div>
              ))}
            </div>

            {/* COLUMNA 2: CITAS AGENDADAS */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-2xl font-black text-brand-950 tracking-tighter">Pacientes Agendados</h2>
              </div>
              
              {appointments.length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] text-center shadow-lg border border-brand-100">
                  <User className="w-16 h-16 text-brand-100 mx-auto mb-6" />
                  <p className="text-brand-950 font-black text-lg tracking-tight">Nadie ha reservado tus cupos aún.</p>
                </div>
              ) : appointments.map(app => (
                <div key={app.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100 hover:shadow-xl transition-all">
                  <div className="flex gap-4">
                     <div className="bg-brand-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-brand-300" />
                     </div>
                     <div className="w-full">
                        <h3 className="text-lg font-black text-brand-950">Paciente: {app.user?.name || `ID: ${app.user}`}</h3>
                        <p className="text-brand-600 font-bold text-sm mb-2">{app.schedule_details?.service_title || 'Servicio'}</p>
                        
                        <div className="flex gap-3 text-brand-400 font-black text-[10px] uppercase tracking-widest mb-3">
                          <span>{app.schedule_details?.date}</span>
                          <span>{app.schedule_details?.start_time}</span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                           <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest ${
                             app.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                             {app.status}
                           </span>
                           
                           {app.status !== 'completada' && (
                             <button 
                               onClick={() => handleCompleteAppt(app.id)}
                               className="text-xs font-black text-brand-600 hover:text-brand-900 flex items-center gap-1 uppercase"
                             >
                               <CheckCircle2 className="w-4 h-4" /> Finalizar
                             </button>
                           )}
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* MODAL CREAR/EDITAR HORARIO */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-brand-950/90 backdrop-blur-2xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
           <div className="bg-white p-12 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)] max-w-xl w-full border border-brand-100 animate-in slide-in-from-bottom-10 duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-brand-400 via-brand-600 to-brand-900"></div>
              <button onClick={() => setShowScheduleModal(false)} className="absolute top-10 right-10 text-brand-200 hover:text-brand-900 transition-colors font-black text-3xl">✕</button>
              
              <h2 className="text-3xl font-black text-brand-950 mb-2 tracking-tighter">
                {editingSchedule ? 'Modificar Horario' : 'Nuevo Horario'}
              </h2>
              <p className="text-brand-500 font-bold mb-8">
                {editingSchedule ? 'Al guardar, se notificará al paciente si este cupo ya está reservado.' : 'Define un cupo disponible para que los pacientes puedan agendarse.'}
              </p>

              <form onSubmit={handleSaveSchedule} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Servicio</label>
                    <select 
                      required 
                      className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 outline-none focus:border-brand-500 font-bold text-brand-900 transition-all cursor-pointer" 
                      value={newSchedule.service} 
                      onChange={e=>setNewSchedule({...newSchedule, service: e.target.value})}
                    >
                       <option value="">-- Selecciona el Servicio --</option>
                       {services.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Fecha</label>
                    <input 
                      required 
                      type="date" 
                      className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 outline-none focus:border-brand-500 font-bold text-brand-900 transition-all" 
                      value={newSchedule.date} 
                      onChange={e=>setNewSchedule({...newSchedule, date: e.target.value})} 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Hora Inicio</label>
                       <input 
                         required 
                         type="time" 
                         className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 outline-none focus:border-brand-500 font-bold text-brand-900 transition-all" 
                         value={newSchedule.start_time} 
                         onChange={e=>setNewSchedule({...newSchedule, start_time: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Hora Fin</label>
                       <input 
                         required 
                         type="time" 
                         className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 outline-none focus:border-brand-500 font-bold text-brand-900 transition-all" 
                         value={newSchedule.end_time} 
                         onChange={e=>setNewSchedule({...newSchedule, end_time: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button type="button" onClick={() => setShowScheduleModal(false)} className="w-1/3 py-4 font-black text-brand-400 uppercase tracking-widest text-[10px] hover:bg-brand-50 rounded-2xl">Cancelar</button>
                    <button type="submit" className="w-2/3 bg-brand-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-brand-700 transition-all">Guardar Horario</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
