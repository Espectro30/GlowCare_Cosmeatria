import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Calendar, Activity, LayoutDashboard, ShieldCheck, Tag, Box, Search, X, Eye, EyeOff, Edit, PlusCircle, CheckCircle2, FileDown } from 'lucide-react';
import { authApi } from '../api/auth';
import { appointmentsApi } from '../api/appointments';
import { servicesApi, cuponesApi, storeApi } from '../api/services';
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pacientes');
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Estados
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'staff', 'servicio', 'cupon', 'editar_cita', 'paciente_detalles'
  const [selectedItem, setSelectedItem] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const deliveryImageRef = useRef(null);

  // Forms
  const [newCosmiatra, setNewCosmiatra] = useState({ name: '', email: '', specialty: '', password: '', phone: '', bio: '', role: 'cosmiatra' });
  const [staffList, setStaffList] = useState([]);
  const [newService, setNewService] = useState({ title: '', slug: '', category: '', description: '', price: '', duration_minutes: '', image: null, image_url: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_percentage: '', is_unlimited: false, max_uses: '', usage_limit_per_user: '3', valid_until: '' });
  const [editAppt, setEditAppt] = useState({ status: '', payment_reference: '' });
  const [newProduct, setNewProduct] = useState({ name: '', description: '', glow_points_cost: '', image_url: '', image: null, is_mock: false });

  const [showPass, setShowPass] = useState(false);
  const [imageInputType, setImageInputType] = useState('local'); // 'local' o 'url'
  const [message, setMessage] = useState(null);
  const [createdPassword, setCreatedPassword] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'pacientes') {
        setClients(await authApi.getClients());
      } else if (activeTab === 'citas') {
        setAppointments(await appointmentsApi.getAll());
      } else if (activeTab === 'servicios') {
        setServices(await servicesApi.getAll());
      } else if (activeTab === 'cupones') {
        setCoupons(await cuponesApi.getAll());
      } else if (activeTab === 'staff') {
        setStaffList(await authApi.getStaff());
      } else if (activeTab === 'boutique') {
        setRedemptions(await storeApi.getAllRedemptions());
      }
    } catch (e) {
      console.error('Error cargando datos', e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem && modalType === 'staff') {
         await authApi.updateStaff(selectedItem.id, newCosmiatra);
         setMessage('Staff actualizado exitosamente.');
      } else {
         const passwordToUse = newCosmiatra.password || `GlowCare${Math.random().toString(36).slice(2, 8).toUpperCase()}!`;
         await authApi.createCosmiatra({ ...newCosmiatra, password: passwordToUse });
         setCreatedPassword(passwordToUse);
         setMessage(`Staff registrado exitosamente.`);
      }
      fetchData();
    } catch (err) {
      setMessage('Error al registrar/actualizar staff.');
    }
  };

  const handleDeleteStaff = async (id) => {
    if(window.confirm('¿Estás seguro de que deseas eliminar este miembro del staff?')) {
      try {
        await authApi.deleteStaff(id);
        fetchData();
      } catch (err) {
        setMessage('Error al eliminar staff.');
      }
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      if (imageInputType === 'url' && newService.image_url) {
        if (!newService.image_url.startsWith('https://images.unsplash.com/') && !newService.image_url.startsWith('https://unsplash.com/')) {
          setMessage('Error: Por seguridad, solo se permiten URLs de Unsplash.');
          return;
        }
      }
      if (imageInputType === 'local' && newService.image) {
         const ext = newService.image.name.split('.').pop().toLowerCase();
         if (!['jpg', 'jpeg', 'png'].includes(ext)) {
            setMessage('Error: Por seguridad, solo se permiten imágenes JPG o PNG.');
            return;
         }
      }

      const formData = new FormData();
      Object.keys(newService).forEach(key => {
        if (key === 'image' && imageInputType === 'url') return;
        if (key === 'image_url' && imageInputType === 'local') return;
        if (newService[key] !== null && newService[key] !== '') formData.append(key, newService[key]);
      });
      
      if (selectedItem && modalType === 'servicio') {
         await fetch(`http://127.0.0.1:8000/api/servicios/${selectedItem.id}/`, {
           method: 'PUT',
           headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` },
           body: formData
         });
         setMessage('Servicio actualizado exitosamente.');
      } else {
         await servicesApi.create(formData);
         setMessage('Servicio creado exitosamente.');
      }
      
      setNewService({ title: '', slug: '', category: '', description: '', price: '', duration_minutes: '', image: null, image_url: '' });
      fetchData();
    } catch (err) {
      setMessage('Error al guardar servicio: ' + (err.response?.data?.image_url?.[0] || err.response?.data?.image?.[0] || 'Verifica los datos.'));
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: newCoupon.code,
        discount_percentage: newCoupon.discount_percentage,
        is_unlimited: newCoupon.is_unlimited,
        max_uses: newCoupon.is_unlimited ? 1 : newCoupon.max_uses,
        usage_limit_per_user: newCoupon.usage_limit_per_user,
      };
      if (newCoupon.valid_until) {
        payload.valid_until = new Date(newCoupon.valid_until).toISOString();
      }
      await cuponesApi.create(payload);
      setMessage('Cupón creado exitosamente.');
      setNewCoupon({ code: '', discount_percentage: '', is_unlimited: false, max_uses: '', usage_limit_per_user: '3', valid_until: '' });
      fetchData();
    } catch (err) {
      setMessage('Error al crear cupón.');
    }
  };

  const handleApproveCoupon = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/servicios/cupones/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` },
        body: JSON.stringify({ is_approved_by_admin: true, is_active: true })
      });
      fetchData();
    } catch(e) {
      setMessage('Error al aprobar cupón.');
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (editAppt.status) payload.status = editAppt.status;
      if (editAppt.payment_reference) payload.payment_reference = editAppt.payment_reference;
      
      await appointmentsApi.updateStatus(selectedItem.id, payload.status || selectedItem.status); 
      // NOTA: Como la API updateStatus solo manda status, usaremos un parche o axios directo
      // Para efectos del demo, si el endpoint se actualizó en el backend, fetch directo:
      await fetch(`http://127.0.0.1:8000/api/citas/status/${selectedItem.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}`
        },
        body: JSON.stringify(payload)
      });
      
      setMessage('Cita actualizada exitosamente.');
      fetchData();
    } catch (err) {
      setMessage('Error al actualizar cita.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newProduct).forEach(key => {
        if(newProduct[key] !== null && newProduct[key] !== '') formData.append(key, newProduct[key]);
      });
      await storeApi.createProduct(formData);
      setMessage('Producto añadido exitosamente.');
      setNewProduct({ name: '', description: '', glow_points_cost: '', image_url: '', image: null, is_mock: false });
      setShowModal(false);
      fetchData();
    } catch(err) { setMessage('Error al añadir producto.'); }
  };

  const handleDeliverRedemption = async () => {
    if (!deliveryImageRef.current?.files[0]) {
      setMessage('Por favor, adjunta una foto de comprobante.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('status', 'delivered');
      formData.append('delivery_image', deliveryImageRef.current.files[0]);
      await storeApi.deliverRedemption(selectedDelivery.id, formData);
      setSelectedDelivery(null);
      setMessage('Entrega registrada exitosamente.');
      fetchData();
    } catch(err) { setMessage('Error al registrar entrega.'); }
  };

  const openModal = async (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setMessage(null);
    setCreatedPassword(null);
    
    if (type === 'editar_cita' && item) {
      setEditAppt({ status: item.status, payment_reference: item.payment_reference || '' });
    }

    if (type === 'staff' && item) {
       setNewCosmiatra({ name: item.name, email: item.email, specialty: item.specialty, password: '', phone: item.phone || '', bio: item.bio || '', role: item.role || 'cosmiatra' });
    } else if (type === 'staff') {
       setNewCosmiatra({ name: '', email: '', specialty: '', password: '', phone: '', bio: '', role: 'cosmiatra' });
    }
    
    if (type === 'servicio' && item) {
      setNewService({
         title: item.title, slug: item.slug, category: item.category, description: item.description,
         price: item.price, duration_minutes: item.duration_minutes, image: null, image_url: item.image_url || '',
         glow_points_reward: item.glow_points_reward || 50
      });
      setImageInputType(item.image_url ? 'url' : 'local');
    }
    
    if (type === 'paciente_detalles' && item) {
       try {
         const res = await fetch(`http://127.0.0.1:8000/api/citas/historial/paciente/${item.id}/`, {
           headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` }
         });
         const data = await res.json();
         setPatientHistory(data);
       } catch (err) {
         setMessage('Error al cargar historial clínico');
       }
    }
    
    setShowModal(true);
  };
  
  const handleDownloadPDF = () => {
    if (!patientHistory) return;
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
  };

  return (
    <div className="min-h-screen bg-[#f1f5f1] p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-brand-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="z-10">
            <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
              <LayoutDashboard className="w-12 h-12 text-brand-400" /> Panel Maestro <span className="text-brand-400">GlowCare</span>
            </h1>
            <p className="text-brand-300 font-bold mt-2 uppercase tracking-[0.3em] text-[10px]">Sistema de Gestión Global v2.2.0</p>
          </div>
          <div className="flex gap-4 z-10 w-full md:w-auto relative">
            <button onClick={() => openModal('staff')} className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-xl hover:-translate-y-1">
              <UserPlus className="w-6 h-6" /> Registrar Staff
            </button>
          </div>
        </header>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
          {['pacientes', 'staff', 'citas', 'servicios', 'cupones', 'boutique'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brand-900 text-white shadow-xl' : 'bg-white text-brand-500 hover:bg-brand-50'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* CONTENIDO TABS */}
        <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-brand-50">
          
          {/* TAB PACIENTES */}
          {activeTab === 'pacientes' && (
            <div>
              <h2 className="text-3xl font-black text-brand-950 mb-8 tracking-tighter">Gestión de Pacientes</h2>
              <table className="w-full text-left">
                <thead><tr className="border-b-2 border-brand-50 text-brand-400 text-[10px] uppercase tracking-widest"><th className="pb-4 px-4">Paciente</th><th className="pb-4 px-4">Contacto</th><th className="pb-4 px-4">Teléfono</th><th className="pb-4 px-4">Acciones</th></tr></thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/30">
                      <td className="py-4 px-4 font-black text-brand-900">{c.first_name} {c.last_name}</td>
                      <td className="py-4 px-4 font-bold text-brand-600">{c.email}</td>
                      <td className="py-4 px-4 font-bold text-brand-600">{c.phone || 'No registrado'}</td>
                      <td className="py-4 px-4">
                        <button onClick={() => openModal('paciente_detalles', c)} className="p-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 font-bold text-xs flex items-center gap-1">
                           <Eye className="w-4 h-4"/> Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB STAFF */}
          {activeTab === 'staff' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-brand-950 tracking-tighter">Gestión de Staff</h2>
              </div>
              <table className="w-full text-left">
                <thead><tr className="border-b-2 border-brand-50 text-brand-400 text-[10px] uppercase tracking-widest"><th className="pb-4 px-4">Especialista</th><th className="pb-4 px-4">Contacto</th><th className="pb-4 px-4">Especialidad</th><th className="pb-4 px-4">Acciones</th></tr></thead>
                <tbody>
                  {staffList.map(s => (
                    <tr key={s.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/30">
                      <td className="py-4 px-4 font-black text-brand-900">
                        {s.name}
                        <br/><span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{s.role === 'secretaria' ? 'Secretaría / Recepción' : 'Cosmiatra / Especialista'}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-brand-600">{s.email}<br/><span className="text-[10px] text-brand-400">{s.phone || 'Sin tel'}</span></td>
                      <td className="py-4 px-4 font-bold text-brand-600">{s.specialty}</td>
                      <td className="py-4 px-4 flex gap-2">
                        <button onClick={() => openModal('staff', s)} className="p-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 font-bold text-xs flex items-center gap-1"><Edit className="w-4 h-4"/> Editar</button>
                        <button onClick={() => handleDeleteStaff(s.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-xs flex items-center gap-1"><X className="w-4 h-4"/> Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB CITAS */}
          {activeTab === 'citas' && (
            <div>
              <h2 className="text-3xl font-black text-brand-950 mb-8 tracking-tighter">Auditoría de Citas y Pagos</h2>
              <table className="w-full text-left">
                <thead><tr className="border-b-2 border-brand-50 text-brand-400 text-[10px] uppercase tracking-widest"><th className="pb-4 px-4">Servicio</th><th className="pb-4 px-4">Monto Final</th><th className="pb-4 px-4">Referencia</th><th className="pb-4 px-4">Estado</th><th className="pb-4 px-4">Acción</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/30">
                      <td className="py-4 px-4 font-black text-brand-900">{a.schedule_details?.service_title || 'Servicio'}</td>
                      <td className="py-4 px-4 font-bold text-brand-600">${a.final_price || a.schedule_details?.service?.price || '0.00'}</td>
                      <td className="py-4 px-4 font-bold text-brand-600">{a.payment_reference || 'N/A'}</td>
                      <td className="py-4 px-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-brand-100 text-brand-700'}`}>{a.status}</span></td>
                      <td className="py-4 px-4">
                        <button onClick={() => openModal('editar_cita', a)} className="p-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100"><Edit className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB SERVICIOS */}
          {activeTab === 'servicios' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-brand-950 tracking-tighter">Catálogo de Servicios</h2>
                <button onClick={() => openModal('servicio')} className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-brand-900 hover:text-white transition-all flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Nuevo Servicio
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(s => (
                  <div key={s.id} className="border border-brand-100 rounded-3xl p-6 hover:shadow-xl transition-all relative group">
                    <button onClick={() => openModal('servicio', s)} className="absolute top-8 right-8 bg-white/90 p-2 rounded-xl text-brand-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-100 shadow-lg backdrop-blur">
                       <Edit className="w-4 h-4" />
                    </button>
                    {s.image_url ? (
                        <img src={s.image_url} alt={s.title} className="w-full h-32 object-cover rounded-xl mb-4" />
                    ) : s.image ? (
                        <img src={s.image} alt={s.title} className="w-full h-32 object-cover rounded-xl mb-4" />
                    ) : <div className="w-full h-32 bg-brand-50 rounded-xl mb-4"></div>}
                    <h3 className="font-black text-brand-900 text-lg">{s.title}</h3>
                    <p className="font-bold text-brand-500 text-sm mt-1">${s.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB CUPONES */}
          {activeTab === 'cupones' && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-brand-950 tracking-tighter">Gestor de Descuentos</h2>
                <button onClick={() => openModal('cupon')} className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl font-black text-xs uppercase hover:bg-brand-900 hover:text-white transition-all flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" /> Crear Cupón
                </button>
              </div>
              <table className="w-full text-left">
                <thead><tr className="border-b-2 border-brand-50 text-brand-400 text-[10px] uppercase tracking-widest"><th className="pb-4 px-4">Código</th><th className="pb-4 px-4">Descuento (%)</th><th className="pb-4 px-4">Detalles</th><th className="pb-4 px-4">Estado</th></tr></thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/30">
                      <td className="py-4 px-4 font-black text-brand-900">{c.code}</td>
                      <td className="py-4 px-4 font-bold text-brand-600">{c.discount_percentage}%</td>
                      <td className="py-4 px-4 text-xs font-bold text-brand-600">
                          {c.is_unlimited ? 'Usos: Ilimitados' : `Usos: ${c.current_uses} / ${c.max_uses}`} <br/>
                          Límite p/p: {c.usage_limit_per_user} <br/>
                          Vence: {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Sin caducidad'}
                      </td>
                      <td className="py-4 px-4">
                        {c.is_approved_by_admin ? (
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.is_active ? 'Activo' : 'Inactivo'}</span>
                        ) : (
                           <button onClick={() => handleApproveCoupon(c.id)} className="bg-brand-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 shadow-sm">
                             Aprobar Cupón
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB BOUTIQUE */}
          {activeTab === 'boutique' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-black text-brand-950 tracking-tighter">Entregas de Minitienda</h2>
                  <button onClick={() => openModal('producto')} className="bg-brand-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-800">Añadir Producto a Catálogo</button>
               </div>
               {redemptions.length === 0 ? (
                   <p className="text-brand-500 font-medium">No hay canjes registrados.</p>
               ) : (
                   <div className="space-y-4">
                      {redemptions.map(r => (
                          <div key={r.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-brand-50 rounded-2xl border border-brand-100">
                              <div>
                                 <p className="font-black text-brand-900">{r.product_details?.name}</p>
                                 <p className="text-sm font-bold text-brand-600">Paciente: {r.user_name}</p>
                                 <p className="text-xs text-brand-400 font-bold mt-1">Fecha: {new Date(r.redeemed_at).toLocaleDateString()}</p>
                              </div>
                              <div className="mt-4 md:mt-0">
                                 {r.status === 'delivered' ? (
                                     <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">Entregado</span>
                                 ) : (
                                     <button onClick={() => setSelectedDelivery(r)} className="bg-brand-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-600">Registrar Entrega FÍsica</button>
                                 )}
                              </div>
                          </div>
                      ))}
                   </div>
               )}
            </div>
          )}

        </div>
      </div>

      {/* MODAL GLOBAL */}
      {showModal && (
        <div className="fixed inset-0 bg-brand-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] max-w-lg w-full border border-brand-100 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-brand-300 hover:text-brand-900"><X className="w-6 h-6" /></button>

            {message && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl font-bold flex items-center gap-3"><CheckCircle2 className="w-5 h-5"/>{message}</div>}

            {modalType === 'staff' && (
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <h2 className="text-3xl font-black text-brand-950 mb-6 tracking-tighter">{selectedItem ? 'Editar Staff' : 'Alta de Staff'}</h2>
                {!selectedItem && (
                  <select required className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newCosmiatra.role} onChange={e => setNewCosmiatra({...newCosmiatra, role: e.target.value})}>
                    <option value="cosmiatra">Rol: Cosmiatra / Especialista</option>
                    <option value="secretaria">Rol: Secretaría / Recepción</option>
                  </select>
                )}
                <input required type="text" placeholder="Nombre Completo" className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newCosmiatra.name} onChange={e => setNewCosmiatra({...newCosmiatra, name: e.target.value})} />
                {!selectedItem && <input required type="email" placeholder="Correo Electrónico" className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newCosmiatra.email} onChange={e => setNewCosmiatra({...newCosmiatra, email: e.target.value})} />}
                <input required type="text" placeholder={newCosmiatra.role === 'secretaria' ? 'Cargo (Ej. Recepcionista Principal)' : 'Especialidad (Ej. Limpieza Facial)'} className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newCosmiatra.specialty} onChange={e => setNewCosmiatra({...newCosmiatra, specialty: e.target.value})} />
                <input type="text" placeholder="Teléfono" className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newCosmiatra.phone} onChange={e => setNewCosmiatra({...newCosmiatra, phone: e.target.value})} />
                <textarea placeholder="Detalles o Biografía" rows="3" className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500 resize-none" value={newCosmiatra.bio} onChange={e => setNewCosmiatra({...newCosmiatra, bio: e.target.value})}></textarea>
                {!selectedItem && <input type="password" placeholder="Contraseña (opcional, se autogenera si está en blanco)" className="w-full bg-brand-50 p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newCosmiatra.password} onChange={e => setNewCosmiatra({...newCosmiatra, password: e.target.value})} />}
                <button type="submit" className="w-full bg-brand-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-brand-800">{selectedItem ? 'Guardar Cambios' : 'Registrar'}</button>
                {createdPassword && <p className="font-bold text-sm bg-brand-100 p-4 rounded-xl mt-4">Contraseña temporal: <span className="text-brand-900 font-black">{createdPassword}</span></p>}
              </form>
            )}

            {modalType === 'servicio' && (
              <form onSubmit={handleCreateService} className="space-y-4">
                <h2 className="text-3xl font-black text-brand-950 mb-6 tracking-tighter">{selectedItem ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                <input required type="text" placeholder="Título" className="w-full bg-brand-50 p-4 rounded-2xl font-bold" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} />
                <input required type="text" placeholder="Categoría" className="w-full bg-brand-50 p-4 rounded-2xl font-bold" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} />
                <textarea required placeholder="Descripción" className="w-full bg-brand-50 p-4 rounded-2xl font-bold" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})}></textarea>
                <div className="flex gap-4">
                  <input required type="number" placeholder="Precio ($)" className="w-1/3 bg-brand-50 p-4 rounded-2xl font-bold" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                  <input required type="number" placeholder="Duración (min)" className="w-1/3 bg-brand-50 p-4 rounded-2xl font-bold" value={newService.duration_minutes} onChange={e => setNewService({...newService, duration_minutes: e.target.value})} />
                  <input required type="number" placeholder="Puntos a otorgar" className="w-1/3 bg-brand-50 p-4 rounded-2xl font-bold" value={newService.glow_points_reward} onChange={e => setNewService({...newService, glow_points_reward: e.target.value})} />
                </div>
                
                <div className="bg-brand-50 p-4 rounded-2xl space-y-3">
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setImageInputType('local')} className={`flex-1 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${imageInputType === 'local' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-500 hover:bg-brand-200'}`}>Subir Archivo Local</button>
                    <button type="button" onClick={() => setImageInputType('url')} className={`flex-1 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${imageInputType === 'url' ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-500 hover:bg-brand-200'}`}>Usar URL Web</button>
                  </div>
                  
                  {imageInputType === 'local' ? (
                    <div>
                      <p className="text-[10px] font-black text-brand-400 uppercase mb-2 px-1">Subir imagen JPG/PNG</p>
                      <input required type="file" accept=".jpg,.jpeg,.png" className="w-full text-brand-900 font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-brand-200 file:text-brand-900 hover:file:bg-brand-300" onChange={e => setNewService({...newService, image: e.target.files[0]})} />
                    </div>
                  ) : (
                    <div>
                      <p className="text-[10px] font-black text-brand-400 uppercase mb-2 px-1">Solo URL de Unsplash segura</p>
                      <input required type="url" placeholder="https://images.unsplash.com/..." className="w-full bg-white border border-brand-100 p-3 rounded-xl font-bold outline-none focus:border-brand-500 text-sm" value={newService.image_url} onChange={e => setNewService({...newService, image_url: e.target.value})} />
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-brand-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-brand-800">Guardar Servicio</button>
              </form>
            )}

            {modalType === 'cupon' && (
              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <h2 className="text-3xl font-black text-brand-950 mb-6 tracking-tighter">Crear Cupón</h2>
                <input required type="text" placeholder="Código (Ej. VERANO20)" className="w-full bg-brand-50 p-4 rounded-2xl font-bold uppercase" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} />
                <input required type="number" step="0.01" placeholder="Descuento %" className="w-full bg-brand-50 p-4 rounded-2xl font-bold" value={newCoupon.discount_percentage} onChange={e => setNewCoupon({...newCoupon, discount_percentage: e.target.value})} />
                
                <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-2xl border border-brand-100">
                  <input type="checkbox" id="is_unlimited_admin" className="w-5 h-5 accent-brand-600" checked={newCoupon.is_unlimited} onChange={e=>setNewCoupon({...newCoupon, is_unlimited: e.target.checked})} />
                  <label htmlFor="is_unlimited_admin" className="font-bold text-brand-800">Sin Usos (Ilimitado)</label>
                </div>

                {!newCoupon.is_unlimited && (
                  <input required type="number" placeholder="Con Usos (Ej. 10 totales)" className="w-full bg-brand-50 p-4 rounded-2xl font-bold border border-brand-100" value={newCoupon.max_uses} onChange={e=>setNewCoupon({...newCoupon, max_uses: e.target.value})} />
                )}
                
                <div>
                   <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Usos Por Personas (Recomendado 3)</label>
                   <input required type="number" placeholder="Usos por paciente" className="w-full bg-brand-50 p-4 rounded-2xl font-bold border border-brand-100 mt-1" value={newCoupon.usage_limit_per_user} onChange={e=>setNewCoupon({...newCoupon, usage_limit_per_user: e.target.value})} />
                   {newCoupon.usage_limit_per_user > 3 && <p className="text-[10px] text-orange-500 font-bold mt-1 px-1">⚠️ Cuidado, estás permitiendo más de 3 usos por persona.</p>}
                </div>
                
                <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100">
                   <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">Con fecha de vencimiento (Opcional)</p>
                   <input type="datetime-local" className="w-full bg-white p-3 rounded-xl border border-brand-100 font-bold outline-none text-sm" value={newCoupon.valid_until} onChange={e=>setNewCoupon({...newCoupon, valid_until: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-brand-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-brand-800">Generar Cupón</button>
              </form>
            )}

            {modalType === 'editar_cita' && (
              <form onSubmit={handleEditAppointment} className="space-y-4">
                <h2 className="text-3xl font-black text-brand-950 mb-6 tracking-tighter">Modificar Cita</h2>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Estado</label>
                  <select className="w-full bg-brand-50 p-4 rounded-2xl font-bold" value={editAppt.status} onChange={e => setEditAppt({...editAppt, status: e.target.value})}>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Referencia de Pago</label>
                  <input type="text" className="w-full bg-brand-50 p-4 rounded-2xl font-bold uppercase" value={editAppt.payment_reference} onChange={e => setEditAppt({...editAppt, payment_reference: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-brand-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-brand-800">Actualizar Auditoría</button>
              </form>
            )}

            {modalType === 'producto' && (
               <form onSubmit={handleCreateProduct} className="space-y-4">
                  <h3 className="text-3xl font-black text-brand-950 mb-6 tracking-tighter">Añadir a Boutique</h3>
                  <input required placeholder="Nombre (Ej. Crema o Cupón)" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} />
                  <textarea required placeholder="Descripción" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} />
                  <input required type="number" placeholder="Costo en Puntos Glow" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none focus:ring-2 focus:ring-brand-500" value={newProduct.glow_points_cost} onChange={e=>setNewProduct({...newProduct, glow_points_cost: e.target.value})} />
                  <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-2xl border border-brand-100">
                     <input type="checkbox" id="is_mock_admin" className="w-5 h-5 accent-brand-600" checked={newProduct.is_mock} onChange={e=>setNewProduct({...newProduct, is_mock: e.target.checked})} />
                     <label htmlFor="is_mock_admin" className="font-bold text-brand-800">Producto Mock (Prueba) o Cupón Virtual</label>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100">
                    <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">Imagen del Producto (URL o Archivo local)</p>
                    <input placeholder="URL Unsplash (Opcional)" className="w-full bg-white p-3 rounded-xl border border-brand-100 font-bold outline-none mb-3 text-sm" value={newProduct.image_url} onChange={e=>setNewProduct({...newProduct, image_url: e.target.value})} />
                    <div className="relative">
                       <input type="file" accept="image/*" className="w-full file:bg-white file:border-0 file:p-2 file:rounded-xl file:font-bold file:text-brand-700 file:cursor-pointer text-sm" onChange={e=>setNewProduct({...newProduct, image: e.target.files[0]})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-900 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:bg-brand-800">Añadir Producto</button>
               </form>
            )}

            {modalType === 'paciente_detalles' && patientHistory && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-3xl font-black text-brand-950 tracking-tighter">Detalles Clínicos</h2>
                </div>
                
                <div className="bg-brand-50 p-6 rounded-3xl">
                   <h3 className="font-black text-brand-900 text-xl mb-4">Ficha del Paciente</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm font-bold text-brand-700">
                      <p>Nombre: <span className="text-brand-900">{patientHistory.paciente.nombre}</span></p>
                      <p>Cédula: <span className="text-brand-900">{patientHistory.paciente.cedula}</span></p>
                      <p>Email: <span className="text-brand-900">{patientHistory.paciente.email}</span></p>
                      <p>Género: <span className="text-brand-900">{patientHistory.paciente.genero === 'M' ? 'Masculino' : patientHistory.paciente.genero === 'F' ? 'Femenino' : 'Otro'}</span></p>
                   </div>
                   {(() => {
                      const clinical = parseClinicalData(patientHistory.paciente.datos_clinicos);
                      if (!clinical) return null;
                      if (typeof clinical === 'object') {
                        return (
                          <div className="mt-4 pt-4 border-t border-brand-200">
                            <p className="text-xs uppercase tracking-widest font-black text-brand-400 mb-3">Datos Clínicos</p>
                            <div className="space-y-2">
                              {Object.entries(clinical).map(([key, value]) => {
                                const label = CLINICAL_LABELS[key] || key;
                                const val = formatClinicalValue(key, value);
                                return (
                                  <div key={key} className="flex items-start gap-2 text-sm">
                                    <span className="font-black text-brand-700 min-w-[180px]">{label}:</span>
                                    <span className="text-brand-900 font-bold">{val}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-4 pt-4 border-t border-brand-200">
                          <p className="text-xs uppercase tracking-widest font-black text-brand-400 mb-2">Datos Clínicos</p>
                          <p className="text-sm font-bold text-brand-900 bg-white p-4 rounded-xl">{clinical}</p>
                        </div>
                      );
                   })()}
                   <div className="mt-4 pt-4 border-t border-brand-200">
                     <button onClick={handleDownloadPDF} className="w-full bg-brand-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-brand-800 transition-all shadow-xl">
                       <FileDown className="w-5 h-5" /> Descargar Ficha Clínica (PDF)
                     </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-black text-brand-900 text-xl">Historial de Citas y Anotaciones</h3>
                   {patientHistory.historial.length === 0 ? (
                      <p className="text-sm font-bold text-brand-500">No hay historial registrado.</p>
                   ) : patientHistory.historial.map(cita => (
                      <div key={cita.cita_id} className="border border-brand-100 p-5 rounded-2xl">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                               <h4 className="font-black text-brand-900">{cita.servicio}</h4>
                               <p className="text-xs font-bold text-brand-500">{cita.fecha} • {cita.cosmiatra}</p>
                            </div>
                            <span className="px-2 py-1 bg-brand-100 text-brand-800 text-[10px] font-black uppercase rounded-lg">{cita.estado}</span>
                         </div>
                         
                         {cita.anotacion && (
                            <div className="bg-brand-50 p-4 rounded-xl mt-3">
                               <p className="text-[10px] uppercase font-black tracking-widest text-brand-500 mb-1">Anotación Cosmeátrica</p>
                               <p className="text-sm font-bold text-brand-900 mb-2">{cita.anotacion.notas}</p>
                               <p className="text-xs font-bold text-brand-600">Productos: {cita.anotacion.productos}</p>
                               <p className="text-xs font-bold text-brand-600">Reacción: {cita.anotacion.reaccion}</p>
                            </div>
                         )}
                      </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL ENTREGA */}
      {selectedDelivery && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[3rem] max-w-md w-full shadow-2xl">
               <h3 className="text-2xl font-black text-brand-950 mb-2 tracking-tighter">Comprobante de Entrega</h3>
               <p className="text-brand-600 mb-6 font-bold text-sm">Sube una fotografía de la entrega del producto "{selectedDelivery.product_details?.name}" a {selectedDelivery.user_name}.</p>
               <input type="file" ref={deliveryImageRef} accept="image/*" className="mb-6 w-full file:bg-brand-50 file:border-0 file:p-3 file:rounded-xl file:font-bold file:text-brand-700" />
               <div className="flex gap-4">
                  <button onClick={() => setSelectedDelivery(null)} className="flex-1 bg-brand-50 text-brand-700 font-black py-4 rounded-2xl hover:bg-brand-100">Cancelar</button>
                  <button onClick={handleDeliverRedemption} className="flex-1 bg-brand-900 text-white font-black py-4 rounded-2xl hover:bg-brand-800 shadow-xl uppercase tracking-widest text-xs">Confirmar</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
