import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, User, Briefcase, PlusCircle, AlertCircle, Edit, Trash2, FileDown } from 'lucide-react';
import { appointmentsApi } from '../api/appointments';
import { servicesApi } from '../api/services';
import logoSvg from '../assets/logo.svg';

/* Helper: parsea los datos clínicos JSON y los devuelve como objeto legible */
function parseClinicalData(raw) {
  if (!raw) return null;
  try {
    const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return obj;
  } catch {
    return raw; // string plano
  }
}

/* Labels legibles para cada campo clínico */
const CLINICAL_LABELS = {
  alergias: 'Alergias',
  alergias_detalle: 'Detalle de alergias',
  tratamiento_previo: 'Tratamiento previo',
  tratamiento_previo_tipo: 'Tipo de tratamiento previo',
  tratamiento_resultado: 'Resultado del tratamiento',
  enfermedades_piel: 'Condiciones cutáneas',
  enfermedades_piel_otro: 'Otra condición cutánea',
  medicamentos_actuales: 'Medicamentos actuales',
  embarazo_lactancia: 'Embarazo o lactancia',
  fototipo: 'Fototipo cutáneo',
  observaciones: 'Observaciones',
};

function formatClinicalValue(key, value) {
  if (value === true) return 'Sí';
  if (value === false) return 'No';
  if (value === '' || value === null || value === undefined) return 'No especificado';
  return String(value);
}

export default function CosmiatraDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [annotationForm, setAnnotationForm] = useState({ notes: '', products_used: '', reaction: 'positive' });
  
  const [newSchedule, setNewSchedule] = useState({ 
    service: '', 
    days_of_week: [], 
    start_time: '', 
    end_time: '' 
  });
  const [isEndTimeExtended, setIsEndTimeExtended] = useState(false);
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isEndTimeExtended && newSchedule.service && newSchedule.start_time) {
      const selectedSrv = services.find(s => s.id === newSchedule.service);
      if (selectedSrv && selectedSrv.duration_minutes) {
        const [hours, minutes] = newSchedule.start_time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes + selectedSrv.duration_minutes);
        
        const endHours = String(date.getHours()).padStart(2, '0');
        const endMinutes = String(date.getMinutes()).padStart(2, '0');
        setNewSchedule(prev => ({ ...prev, end_time: `${endHours}:${endMinutes}` }));
      }
    }
  }, [newSchedule.service, newSchedule.start_time, isEndTimeExtended, services]);

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
      // Automáticamente abrir modal de anotación
      const appt = appointments.find(a => a.id === id);
      if (appt) {
         setSelectedAppt({...appt, status: 'completada'});
         setAnnotationForm({ notes: '', products_used: '', reaction: 'positive' });
         setShowAnnotationModal(true);
      }
    } catch (e) {
      alert("Error al actualizar la cita.");
    }
  };

  const handleSaveAnnotation = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://127.0.0.1:8000/api/citas/${selectedAppt.id}/anotacion/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` },
        body: JSON.stringify(annotationForm)
      });
      setShowAnnotationModal(false);
      loadData();
    } catch (err) {
      alert("Error al guardar anotación");
    }
  };

  const [showExtensionWarning, setShowExtensionWarning] = useState(false);
  const [pendingScheduleSave, setPendingScheduleSave] = useState(null);
  const [overtimeJustification, setOvertimeJustification] = useState('');

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (editingSchedule && newSchedule.end_time > editingSchedule.end_time) {
       setPendingScheduleSave(newSchedule);
       setShowExtensionWarning(true);
       return;
    }
    await executeSaveSchedule(newSchedule, '');
  };

  const executeSaveSchedule = async (scheduleData, justification) => {
    try {
      const payload = { ...scheduleData, overtime_justification: justification };
      if (editingSchedule) {
        await servicesApi.updateSchedule(editingSchedule.id, payload);
      } else {
        await servicesApi.createSchedule(payload);
      }
      setShowScheduleModal(false);
      setShowExtensionWarning(false);
      setPendingScheduleSave(null);
      setOvertimeJustification('');
      setEditingSchedule(null);
      setNewSchedule({ service: '', days_of_week: [], start_time: '', end_time: '' });
      setIsEndTimeExtended(false);
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

  const handleDownloadPDF = async (userId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/citas/historial/paciente/${userId}/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` }
      });
      const patientHistory = await res.json();
      if (!patientHistory || !patientHistory.paciente) {
        alert('No se encontró historial para este paciente.');
        return;
      }

      const clinical = parseClinicalData(patientHistory.paciente.datos_clinicos);
      const generoLabel = patientHistory.paciente.genero === 'M' ? 'Masculino' : patientHistory.paciente.genero === 'F' ? 'Femenino' : 'Otro';

      /* Construir filas de datos clínicos */
      let clinicalRows = '';
      if (clinical && typeof clinical === 'object') {
        Object.entries(clinical).forEach(([key, value]) => {
          const label = CLINICAL_LABELS[key] || key;
          const val = formatClinicalValue(key, value);
          clinicalRows += `<tr><td style="padding:8px 12px;font-weight:700;color:#466741;border-bottom:1px solid #e3ece1;width:40%;">${label}</td><td style="padding:8px 12px;color:#1b2a1a;border-bottom:1px solid #e3ece1;">${val}</td></tr>`;
        });
      } else if (clinical) {
        clinicalRows = `<tr><td colspan="2" style="padding:8px 12px;color:#1b2a1a;">${clinical}</td></tr>`;
      }

      /* Construir filas de historial */
      let historialRows = '';
      if (patientHistory.historial && patientHistory.historial.length > 0) {
        patientHistory.historial.forEach(cita => {
          let anotacionHtml = '';
          if (cita.anotacion) {
            anotacionHtml = `
              <div style="background:#f4f7f4;padding:10px 14px;border-radius:8px;margin-top:8px;font-size:12px;">
                <p style="font-weight:700;color:#466741;margin:0 0 4px;">Anotación Cosmeátrica</p>
                <p style="margin:0 0 2px;color:#1b2a1a;">${cita.anotacion.notas || ''}</p>
                <p style="margin:0;color:#466741;">Productos: ${cita.anotacion.productos || 'N/A'} · Reacción: ${cita.anotacion.reaccion || 'N/A'}</p>
              </div>`;
          }
          historialRows += `
            <div style="border:1px solid #e3ece1;border-radius:12px;padding:14px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <p style="font-weight:900;color:#1b2a1a;margin:0;font-size:14px;">${cita.servicio || 'Servicio'}</p>
                  <p style="font-size:11px;color:#5c8356;margin:2px 0 0;">${cita.fecha || ''} · ${cita.cosmiatra || 'N/A'}</p>
                </div>
                <span style="background:#e3ece1;color:#385235;padding:3px 10px;border-radius:6px;font-size:10px;font-weight:900;text-transform:uppercase;">${cita.estado || ''}</span>
              </div>
              ${anotacionHtml}
            </div>`;
        });
      } else {
        historialRows = '<p style="color:#5c8356;font-size:13px;">No hay historial registrado.</p>';
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Ficha Clínica - ${patientHistory.paciente.nombre}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', Arial, sans-serif; color: #1b2a1a; padding: 40px; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2e422c; padding-bottom: 20px; margin-bottom: 30px; }
            .header-left h1 { font-size: 26px; font-weight: 900; color: #1b2a1a; letter-spacing: -1px; }
            .header-left p { font-size: 11px; color: #5c8356; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px; }
            .header-right { display: flex; align-items: center; gap: 10px; }
            .header-right img { width: 40px; height: 40px; }
            .header-right span { font-weight: 900; font-size: 20px; color: #2e422c; font-style: italic; text-transform: uppercase; letter-spacing: -1px; }
            .header-right .care { color: #5c8356; }
            .section-title { font-size: 16px; font-weight: 900; color: #2e422c; text-transform: uppercase; letter-spacing: 2px; margin: 24px 0 12px; }
            .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 20px; }
            .patient-grid p { font-size: 13px; font-weight: 700; color: #466741; }
            .patient-grid p span { color: #1b2a1a; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e3ece1; font-size: 10px; color: #7ba175; text-align: center; }
            @media print {
              body { padding: 20px; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <h1>Ficha Clínica del Paciente</h1>
              <p>Documento generado el ${new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div class="header-right">
              <img src="${logoSvg}" alt="Logo" />
              <span>Glow<span class="care">Care</span></span>
            </div>
          </div>

          <div class="section-title">Datos del Paciente</div>
          <div class="patient-grid">
            <p>Nombre: <span>${patientHistory.paciente.nombre || 'N/A'}</span></p>
            <p>Cédula: <span>${patientHistory.paciente.cedula || 'N/A'}</span></p>
            <p>Email: <span>${patientHistory.paciente.email || 'N/A'}</span></p>
            <p>Género: <span>${generoLabel}</span></p>
          </div>

          <div class="section-title">Datos Clínicos</div>
          <table>${clinicalRows || '<tr><td style="padding:8px;color:#5c8356;">Sin datos clínicos registrados.</td></tr>'}</table>

          <div class="section-title" style="margin-top:30px;">Historial de Citas y Anotaciones</div>
          ${historialRows}

          <div class="footer">
            GlowCare Cosmiatría · Sistema de Gestión Clínica · Documento confidencial
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => { printWindow.print(); }, 500);
        };
      }
    } catch (err) {
      alert("Error al cargar o generar la ficha clínica.");
    }
  };

  const openEditModal = (sched) => {
    setEditingSchedule(sched);
    setNewSchedule({
      service: sched.service,
      days_of_week: sched.days_of_week || [],
      start_time: sched.start_time,
      end_time: sched.end_time
    });
    setIsEndTimeExtended(false);
    setShowScheduleModal(true);
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    setNewSchedule({ service: '', days_of_week: [], start_time: '', end_time: '' });
    setIsEndTimeExtended(false);
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
                       <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {sched.days_of_week && sched.days_of_week.length > 0 ? sched.days_of_week.join(', ') : sched.date}</span>
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
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-black text-brand-950">Paciente: {app.user_details?.name || `ID: ${app.user}`}</h3>
                            <p className="text-brand-600 font-bold text-sm mb-1">Teléfono: {app.user_details?.phone || 'No registrado'}</p>
                          </div>
                          <button 
                            onClick={() => handleDownloadPDF(app.user)}
                            className="bg-brand-50 text-brand-700 p-2 rounded-xl hover:bg-brand-100 transition-colors"
                            title="Descargar Ficha Clínica PDF"
                          >
                            <FileDown className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-brand-600 font-bold text-sm mb-2 mt-1">{app.schedule_details?.service_title || 'Servicio'}</p>
                        
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
                           {app.status === 'completada' && !app.annotation && (
                             <button 
                               onClick={() => { setSelectedAppt(app); setAnnotationForm({ notes: '', products_used: '', reaction: 'positive' }); setShowAnnotationModal(true); }}
                               className="text-xs font-black text-brand-600 hover:text-brand-900 flex items-center gap-1 uppercase bg-brand-50 px-3 py-1.5 rounded-lg"
                             >
                               <Edit className="w-4 h-4" /> Añadir Notas Clínicas
                             </button>
                           )}
                           {app.status === 'completada' && app.annotation && (
                             <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Notas Guardadas</span>
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
                    <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Días de la semana</label>
                    <div className="bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 space-y-3">
                       {diasSemana.map(dia => (
                          <label key={dia} className="flex items-center justify-between cursor-pointer group">
                             <span className="font-bold text-brand-900 group-hover:text-brand-600 transition-colors">{dia}</span>
                             <input 
                               type="checkbox" 
                               className="w-5 h-5 accent-brand-600 rounded" 
                               checked={newSchedule.days_of_week.includes(dia)}
                               onChange={(e) => {
                                 if (e.target.checked) {
                                    setNewSchedule(prev => ({...prev, days_of_week: [...prev.days_of_week, dia]}));
                                 } else {
                                    setNewSchedule(prev => ({...prev, days_of_week: prev.days_of_week.filter(d => d !== dia)}));
                                 }
                               }}
                             />
                          </label>
                       ))}
                    </div>
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
                       <div className="flex justify-between items-center px-1">
                          <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Hora Fin {isEndTimeExtended ? '' : '(Calculada)'}</label>
                          {!isEndTimeExtended && <button type="button" onClick={() => setIsEndTimeExtended(true)} className="text-[9px] bg-brand-200 text-brand-800 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest hover:bg-brand-300">Extender</button>}
                       </div>
                       <input 
                         required 
                         type="time" 
                         className={`w-full p-4 rounded-2xl border-2 outline-none font-bold transition-all ${isEndTimeExtended ? 'bg-brand-50 border-brand-200 text-brand-900 focus:border-brand-500' : 'bg-brand-100/50 border-brand-100 text-brand-400'}`} 
                         value={newSchedule.end_time} 
                         disabled={!isEndTimeExtended}
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

      {/* MODAL ANOTACION MEDICA */}
      {showAnnotationModal && (
        <div className="fixed inset-0 bg-brand-950/90 backdrop-blur-2xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
           <div className="bg-white p-12 rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.6)] max-w-xl w-full border border-brand-100 relative overflow-hidden">
              <button onClick={() => setShowAnnotationModal(false)} className="absolute top-10 right-10 text-brand-200 hover:text-brand-900 font-black text-3xl">✕</button>
              
              <h2 className="text-3xl font-black text-brand-950 mb-2 tracking-tighter">Anotación Cosmeátrica</h2>
              <p className="text-brand-500 font-bold mb-6">Agrega los detalles del servicio prestado a {selectedAppt?.user?.name}.</p>

              <form onSubmit={handleSaveAnnotation} className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Acciones Realizadas / Observaciones</label>
                    <textarea required rows="3" className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 outline-none focus:border-brand-500 font-bold text-brand-900 resize-none" value={annotationForm.notes} onChange={e=>setAnnotationForm({...annotationForm, notes: e.target.value})} placeholder="Ej. Extracción de puntos negros, hidratación profunda..."></textarea>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Productos Aplicados</label>
                    <textarea required rows="2" className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 outline-none focus:border-brand-500 font-bold text-brand-900 resize-none" value={annotationForm.products_used} onChange={e=>setAnnotationForm({...annotationForm, products_used: e.target.value})} placeholder="Marcas o componentes (ej. Ácido Hialurónico al 2%)"></textarea>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Reacción Cutánea</label>
                    <select className="w-full bg-brand-50 p-4 rounded-2xl border-2 border-brand-200 font-bold text-brand-900" value={annotationForm.reaction} onChange={e=>setAnnotationForm({...annotationForm, reaction: e.target.value})}>
                       <option value="positive">Positiva / Normal</option>
                       <option value="neutral">Leve Enrojecimiento (Esperado)</option>
                       <option value="negative">Reacción Adversa / Alergia</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-brand-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl mt-4 hover:bg-brand-700">Guardar Ficha</button>
              </form>
           </div>
        </div>
      )}
      {/* MODAL ADVERTENCIA EXTENSION */}
      {showExtensionWarning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-950/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-brand-900 mb-2 text-center">Extensión Detectada</h3>
            <p className="text-brand-600 mb-6 font-medium text-center text-sm">
              Estás modificando el horario original ({editingSchedule?.end_time}) para terminar más tarde ({pendingScheduleSave?.end_time}). 
              Se requiere justificación para esta extensión de jornada.
            </p>
            <textarea
              className="w-full bg-brand-50 border border-brand-100 rounded-xl p-3 outline-none focus:border-brand-500 font-bold mb-6 resize-none"
              rows={3}
              placeholder="Motivo de la extensión..."
              value={overtimeJustification}
              onChange={(e) => setOvertimeJustification(e.target.value)}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowExtensionWarning(false); setPendingScheduleSave(null); setOvertimeJustification(''); }} 
                className="flex-1 bg-brand-50 text-brand-700 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => executeSaveSchedule(pendingScheduleSave, overtimeJustification)} 
                disabled={!overtimeJustification.trim()}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
