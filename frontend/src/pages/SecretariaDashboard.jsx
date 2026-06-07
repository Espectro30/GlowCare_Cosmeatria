import { UserPlus, CalendarPlus, CheckCircle2, ShoppingBag, Ticket, Camera } from 'lucide-react';
import Register from './Register';
import { useState, useEffect, useRef } from 'react';
import { authApi } from '../api/auth';
import { servicesApi, cuponesApi } from '../api/services';
import { appointmentsApi } from '../api/appointments';

export default function SecretariaDashboard() {
  const [activeTab, setActiveTab] = useState('register');
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Canjes y Cupones
  const [redemptions, setRedemptions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedDeliveryRedemption, setSelectedDeliveryRedemption] = useState(null);
  const deliveryImageRef = useRef(null);

  // Formularios Modales
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  
  const [productForm, setProductForm] = useState({ name: '', description: '', glow_points_cost: '', image_url: '', image: null, is_mock: false });
  const [couponForm, setCouponForm] = useState({ 
     code: '', discount_percentage: '', is_unlimited: false, max_uses: '', usage_limit_per_user: '3', valid_until: '' 
  });

  useEffect(() => {
    if (activeTab === 'agendar') {
      authApi.getClients().then(setPatients);
      servicesApi.getAll().then(setServices);
    } else if (activeTab === 'canjes') {
      fetchRedemptions();
    } else if (activeTab === 'cupones') {
      fetchCoupons();
    }
  }, [activeTab]);

  const fetchRedemptions = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/servicios/store/redemptions/all/', {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` }
      });
      if(res.ok) setRedemptions(await res.json());
    } catch(e) { console.error(e) }
  };

  const fetchCoupons = async () => {
    try {
      const res = await cuponesApi.getAll();
      setCoupons(res);
    } catch(e) { console.error(e) }
  };

  useEffect(() => {
    if (selectedService) {
      servicesApi.getSchedules(selectedService).then(setSchedules);
    } else {
      setSchedules([]);
    }
  }, [selectedService]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      await appointmentsApi.create({
        schedule_id: selectedSchedule,
        payment_method: 'presencial',
        payment_reference: 'N/A',
        patient_id: selectedPatient
      });
      setSuccessMsg('Cita agendada exitosamente para el paciente en la clínica.');
      setSelectedPatient('');
      setSelectedService('');
      setSelectedSchedule('');
    } catch (err) {
      alert('Error al agendar. ' + (err.response?.data?.error || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverRedemption = async () => {
    if(!selectedDeliveryRedemption || (!deliveryImageRef.current?.files[0])) {
        alert("Sube una foto como comprobante de entrega");
        return;
    }
    const formData = new FormData();
    formData.append('status', 'delivered');
    formData.append('delivery_image', deliveryImageRef.current.files[0]);

    try {
       const res = await fetch(`http://127.0.0.1:8000/api/servicios/store/redemptions/${selectedDeliveryRedemption.id}/`, {
           method: 'PATCH',
           headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` },
           body: formData
       });
       if(res.ok) {
           alert("Entrega registrada con éxito.");
           setSelectedDeliveryRedemption(null);
           fetchRedemptions();
       } else alert("Error al registrar");
    } catch(e) { alert("Error de red"); }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', productForm.name);
    formData.append('description', productForm.description);
    formData.append('glow_points_cost', productForm.glow_points_cost);
    formData.append('is_mock', productForm.is_mock);
    if(productForm.image_url) formData.append('image_url', productForm.image_url);
    if(productForm.image) formData.append('image', productForm.image);
    
    try {
      const res = await fetch('http://127.0.0.1:8000/api/servicios/store/products/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` },
        body: formData
      });
      if(res.ok) {
        alert('Producto añadido al catálogo de forma exitosa.');
        setShowAddProductModal(false);
        setProductForm({ name: '', description: '', glow_points_cost: '', image_url: '', image: null, is_mock: false });
      } else {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err));
      }
    } catch(e) { alert('Error de red'); }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const payload = {
        code: couponForm.code,
        discount_percentage: couponForm.discount_percentage,
        is_unlimited: couponForm.is_unlimited,
        max_uses: couponForm.is_unlimited ? 1 : couponForm.max_uses,
        usage_limit_per_user: couponForm.usage_limit_per_user,
    };
    if (couponForm.valid_until) {
        payload.valid_until = new Date(couponForm.valid_until).toISOString();
    }
    
    try {
      await cuponesApi.create(payload);
      alert('Cupón propuesto exitosamente. Pendiente de aprobación por Admin.');
      setShowAddCouponModal(false);
      setCouponForm({ code: '', discount_percentage: '', is_unlimited: false, max_uses: '', usage_limit_per_user: '3', valid_until: '' });
      fetchCoupons();
    } catch(e) { alert('Error al crear cupón.'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-500 min-h-[80vh]">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-brand-950 uppercase tracking-tighter mb-3">
          Panel de Recepción
        </h1>
        <p className="text-brand-500 font-bold uppercase tracking-widest text-xs">
          Gestión de Pacientes, Agendamiento y Boutique
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          { id: 'register', label: 'Registrar Paciente', icon: UserPlus },
          { id: 'agendar', label: 'Agendar Cita', icon: CalendarPlus },
          { id: 'canjes', label: 'Gestión Minitienda', icon: ShoppingBag },
          { id: 'cupones', label: 'Generar Cupones', icon: Ticket }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-900 text-white shadow-xl' 
                : 'bg-white text-brand-500 hover:bg-brand-50 border border-brand-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'register' && (
        <div className="bg-white rounded-[3rem] shadow-sm border border-brand-100 p-2 sm:p-6 overflow-hidden">
          <div className="mt-[-2rem] mb-[-2rem]"><Register isSecretaria={true} /></div>
        </div>
      )}

      {activeTab === 'agendar' && (
        <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-sm border border-brand-100 p-8">
          <h2 className="text-2xl font-black text-brand-950 mb-6 tracking-tighter">Agendar Presencialmente</h2>
          {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl font-bold flex items-center gap-3"><CheckCircle2 className="w-5 h-5" /> {successMsg}</div>}
          <form onSubmit={handleBookAppointment} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Paciente</label>
              <select required value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)} className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none focus:border-brand-500">
                <option value="">Seleccione un paciente...</option>
                {patients.map(p => <option key={p.id} value={p.user_id || p.id}>{p.first_name} {p.last_name} ({p.email})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Servicio</label>
              <select required value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none focus:border-brand-500">
                <option value="">Seleccione un servicio...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.title} - ${s.price}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest">Horario Disponible</label>
              <select required value={selectedSchedule} onChange={e => setSelectedSchedule(e.target.value)} disabled={!selectedService} className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none focus:border-brand-500 disabled:opacity-50">
                <option value="">{selectedService ? 'Seleccione un horario...' : 'Primero seleccione un servicio'}</option>
                {schedules.map(sc => <option key={sc.id} value={sc.id}>{sc.date} a las {sc.start_time} con {sc.cosmiatra_name}</option>)}
              </select>
            </div>
            <button disabled={loading || !selectedSchedule || !selectedPatient} type="submit" className="w-full bg-brand-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50">
              {loading ? 'Agendando...' : 'Agendar Cita Manual'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'canjes' && (
        <div className="bg-white rounded-[3rem] shadow-sm border border-brand-100 p-8">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-brand-950 tracking-tighter">Entregas de Minitienda</h2>
              <button onClick={() => setShowAddProductModal(true)} className="bg-brand-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-800">Añadir Producto a Catálogo</button>
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
                                 <button onClick={() => setSelectedDeliveryRedemption(r)} className="bg-brand-500 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-600">Registrar Entrega FÍsica</button>
                             )}
                          </div>
                      </div>
                  ))}
               </div>
           )}
        </div>
      )}

      {activeTab === 'cupones' && (
        <div className="bg-white rounded-[3rem] shadow-sm border border-brand-100 p-8">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-brand-950 tracking-tighter">Cupones Generados</h2>
              <button onClick={() => setShowAddCouponModal(true)} className="bg-brand-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-800">Proponer Cupón</button>
           </div>
           {coupons.length === 0 ? (
               <p className="text-brand-500 font-medium">No se han generado cupones.</p>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coupons.map(c => (
                      <div key={c.id} className="p-5 bg-brand-50 rounded-3xl border border-brand-100 flex justify-between items-center">
                          <div>
                             <p className="text-xl font-black text-brand-900 tracking-widest">{c.code}</p>
                             <p className="text-sm font-bold text-brand-600">{c.discount_percentage}% Dcto</p>
                             <div className="mt-2 text-xs text-brand-500 font-bold">
                                {c.is_unlimited ? 'Usos: Ilimitados' : `Usos: ${c.current_uses}/${c.max_uses}`} <br/>
                                Límite p/p: {c.usage_limit_per_user} <br/>
                                Vence: {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : 'Sin caducidad'}
                             </div>
                          </div>
                          <div>
                             <span className={`px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${c.is_approved_by_admin ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {c.is_approved_by_admin ? 'Aprobado' : 'Pendiente'}
                             </span>
                          </div>
                      </div>
                  ))}
               </div>
           )}
        </div>
      )}

      {/* MODALES REUTILIZABLES */}
      {selectedDeliveryRedemption && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-[3rem] max-w-md w-full">
               <h3 className="text-xl font-black text-brand-950 mb-2">Comprobante de Entrega</h3>
               <p className="text-brand-600 mb-6 font-bold text-sm">Sube una fotografía de la entrega del producto "{selectedDeliveryRedemption.product_details?.name}" a {selectedDeliveryRedemption.user_name}.</p>
               <input type="file" ref={deliveryImageRef} accept="image/*" className="mb-6 w-full file:bg-brand-50 file:border-0 file:p-3 file:rounded-xl file:font-bold file:text-brand-700" />
               <div className="flex gap-4">
                  <button onClick={() => setSelectedDeliveryRedemption(null)} className="flex-1 bg-nut-50 text-nut-700 font-black py-3 rounded-2xl">Cancelar</button>
                  <button onClick={handleDeliverRedemption} className="flex-1 bg-brand-900 text-white font-black py-3 rounded-2xl">Confirmar</button>
               </div>
            </div>
         </div>
      )}

      {showAddProductModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-[3rem] max-w-md w-full max-h-[90vh] overflow-y-auto">
               <h3 className="text-2xl font-black text-brand-950 mb-6 tracking-tighter">Añadir Producto</h3>
               <form onSubmit={handleCreateProduct} className="space-y-4">
                  <input required placeholder="Nombre (Ej. Crema o Cupón)" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} />
                  <textarea required placeholder="Descripción" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none" value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} />
                  <input required type="number" placeholder="Costo en Puntos Glow" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none" value={productForm.glow_points_cost} onChange={e=>setProductForm({...productForm, glow_points_cost: e.target.value})} />
                  <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-2xl border border-brand-100">
                     <input type="checkbox" id="is_mock_secretaria" className="w-5 h-5 accent-brand-600" checked={productForm.is_mock} onChange={e=>setProductForm({...productForm, is_mock: e.target.checked})} />
                     <label htmlFor="is_mock_secretaria" className="font-bold text-brand-800">Producto Mock (Prueba) o Cupón Virtual</label>
                  </div>
                  <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100">
                    <p className="text-xs font-bold text-brand-500 mb-2">Imagen del Producto (URL o Archivo local)</p>
                    <input placeholder="URL Unsplash (Opcional)" className="w-full bg-white p-3 rounded-xl border border-brand-100 font-bold outline-none mb-3" value={productForm.image_url} onChange={e=>setProductForm({...productForm, image_url: e.target.value})} />
                    <div className="relative">
                       <input type="file" accept="image/*" className="w-full file:bg-white file:border-0 file:p-2 file:rounded-xl file:font-bold file:text-brand-700 file:cursor-pointer" onChange={e=>setProductForm({...productForm, image: e.target.files[0]})} />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 bg-nut-50 text-nut-700 font-black py-4 rounded-2xl">Cancelar</button>
                     <button type="submit" className="flex-1 bg-brand-900 text-white font-black py-4 rounded-2xl shadow-xl">Añadir</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {showAddCouponModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-[3rem] max-w-md w-full max-h-[90vh] overflow-y-auto">
               <h3 className="text-2xl font-black text-brand-950 mb-6 tracking-tighter">Proponer Cupón</h3>
               <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <input required placeholder="Código (ej. GLOW50)" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-black outline-none uppercase tracking-widest" value={couponForm.code} onChange={e=>setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} />
                  <input required type="number" step="0.01" placeholder="% Descuento" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none" value={couponForm.discount_percentage} onChange={e=>setCouponForm({...couponForm, discount_percentage: e.target.value})} />
                  
                  <div className="flex items-center gap-3 bg-brand-50 p-4 rounded-2xl border border-brand-100">
                    <input type="checkbox" id="is_unlimited" className="w-5 h-5 accent-brand-600" checked={couponForm.is_unlimited} onChange={e=>setCouponForm({...couponForm, is_unlimited: e.target.checked})} />
                    <label htmlFor="is_unlimited" className="font-bold text-brand-800">Sin Usos (Ilimitado)</label>
                  </div>

                  {!couponForm.is_unlimited && (
                    <input required type="number" placeholder="Con Usos (Ej. 10 totales)" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none" value={couponForm.max_uses} onChange={e=>setCouponForm({...couponForm, max_uses: e.target.value})} />
                  )}
                  
                  <div>
                     <label className="text-[11px] font-black text-brand-400 uppercase tracking-widest px-1">Usos Por Personas (Recomendado 3)</label>
                     <input required type="number" placeholder="Usos por paciente" className="w-full bg-brand-50 p-4 rounded-2xl border border-brand-100 font-bold outline-none mt-1" value={couponForm.usage_limit_per_user} onChange={e=>setCouponForm({...couponForm, usage_limit_per_user: e.target.value})} />
                     {couponForm.usage_limit_per_user > 3 && <p className="text-[10px] text-orange-500 font-bold mt-1 px-1">⚠️ Cuidado, estás proponiendo más de 3 usos por persona.</p>}
                  </div>
                  
                  <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100">
                     <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">Con fecha de vencimiento (Opcional)</p>
                     <input type="datetime-local" className="w-full bg-white p-3 rounded-xl border border-brand-100 font-bold outline-none text-sm" value={couponForm.valid_until} onChange={e=>setCouponForm({...couponForm, valid_until: e.target.value})} />
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setShowAddCouponModal(false)} className="flex-1 bg-nut-50 text-nut-700 font-black py-4 rounded-2xl">Cancelar</button>
                     <button type="submit" className="flex-1 bg-brand-900 text-white font-black py-4 rounded-2xl shadow-xl">Proponer</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
