import { useState, useEffect } from 'react';
import { Calendar, Clock, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { appointmentsApi } from '../api/appointments';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingStore, setLoadingStore] = useState(false);
  const [confirmRedeemProduct, setConfirmRedeemProduct] = useState(null);

  const fetchStore = async () => {
    setLoadingStore(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/servicios/store/products/', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` }
      });
      if(res.ok) setStoreProducts(await res.json());
    } catch(e) {}
    setLoadingStore(false);
  };

  useEffect(() => {
    if(showStoreModal) fetchStore();
  }, [showStoreModal]);

  const handleRedeem = async (prodId) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/servicios/store/redemptions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('glowcare_token')}` },
        body: JSON.stringify({ product_id: prodId })
      });
      if(res.ok) {
        alert('¡Canje exitoso! Retira tu producto en recepción.');
        setConfirmRedeemProduct(null);
        setShowStoreModal(false);
      } else {
        const err = await res.json();
        alert(err.detail || 'Error al canjear.');
      }
    } catch(e) {
      alert('Error de red');
    }
  };

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
    <>
    {showStoreModal && (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-brand-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300'>
        <div className='bg-white rounded-[3rem] p-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative shadow-2xl'>
          <button onClick={() => setShowStoreModal(false)} className='absolute top-8 right-8 text-brand-300 hover:text-brand-600 transition-colors'>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div className='flex items-center gap-4 mb-8'>
            <div className='w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center shrink-0'>
               <svg className="w-8 h-8 text-brand-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
               </svg>
            </div>
            <div>
               <h2 className='text-3xl font-black text-brand-950 tracking-tighter'>Boutique de Beneficios</h2>
               <p className='text-brand-600 font-bold text-sm'>Canjea tus Puntos Glow por productos o cupones.</p>
            </div>
          </div>

          {loadingStore ? <p className="text-center font-bold text-brand-500 py-10">Cargando...</p> : storeProducts.length === 0 ? (
             <p className='text-center font-bold text-brand-500 py-16'>No hay productos disponibles por ahora.</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              {storeProducts.map(p => (
                <div key={p.id} className='border border-brand-100 rounded-[2rem] p-5 flex flex-col items-center hover:shadow-xl transition-all group bg-white'>
                  {p.image_url ? (
                     <img src={p.image_url} alt={p.name} className='w-32 h-32 object-cover rounded-2xl mb-4 group-hover:scale-105 transition-transform' />
                  ) : (
                     <div className='w-32 h-32 bg-brand-50 rounded-2xl mb-4 flex items-center justify-center'>
                       <svg className="w-10 h-10 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                     </div>
                  )}
                  <h3 className='font-black text-brand-900 text-center text-lg leading-tight'>{p.name}</h3>
                  <p className='text-xs font-bold text-brand-500 mb-4 text-center mt-2 line-clamp-2'>{p.description}</p>
                  <button onClick={() => setConfirmRedeemProduct(p)} className='mt-auto bg-brand-50 text-brand-800 hover:bg-brand-900 hover:text-white w-full py-3 rounded-xl font-black transition-colors uppercase tracking-widest text-[10px]'>Canjear por {p.glow_points_cost} pts</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}
    
    {confirmRedeemProduct && (
      <div className='fixed inset-0 z-[60] flex items-center justify-center bg-brand-950/80 backdrop-blur-md p-4'>
        <div className='bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl'>
          <AlertCircle className='w-16 h-16 text-brand-500 mx-auto mb-4' />
          <h3 className='text-xl font-black text-brand-900 mb-2'>¿Confirmar Canje?</h3>
          <p className='text-brand-600 mb-6 font-medium'>¿Estás seguro de canjear {confirmRedeemProduct.glow_points_cost} Puntos Glow por {confirmRedeemProduct.name}? Esta acción no se puede deshacer.</p>
          <div className='flex gap-3'>
            <button onClick={() => setConfirmRedeemProduct(null)} className='flex-1 bg-brand-50 text-brand-700 py-3 rounded-xl font-black'>Cancelar</button>
            <button onClick={() => handleRedeem(confirmRedeemProduct.id)} className='flex-1 bg-brand-800 text-white py-3 rounded-xl font-black'>Sí, Canjear</button>
          </div>
        </div>
      </div>
    )}

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
            ) : appointments.filter(a => !['finalizada', 'completada', 'cancelada'].includes(a.status.toLowerCase())).length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-brand-200">
                <AlertCircle className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                <p className="text-brand-800 font-bold text-lg">Aún no tienes tratamientos agendados.</p>
                <Link to="/servicios" className="text-brand-600 underline font-black block mt-2">Explora nuestro catálogo ahora</Link>
              </div>
            ) : appointments.filter(a => !['finalizada', 'completada', 'cancelada'].includes(a.status.toLowerCase())).map(app => (
              <div key={app.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-brand-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                <div className="flex gap-5">
                   <div className="bg-brand-50 p-4 rounded-3xl flex items-center justify-center">
                      <Clock className="w-8 h-8 text-brand-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-brand-900 italic">{app.schedule_details?.service_title || 'Tratamiento Facial'}</h3>
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
                   <Link to={`/chat/${app.id}`} className="bg-brand-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm shadow-lg hover:bg-brand-800 w-full md:w-auto justify-center">
                      <MessageCircle className="w-4 h-4" /> Hablar con Especialista
                   </Link>
                </div>
              </div>
            ))}

            <h2 className="text-xl font-black text-brand-900 mb-4 mt-10 flex items-center gap-2 border-t border-brand-200 pt-8">
              <Clock className="w-6 h-6 text-brand-600" /> Historial de Citas
            </h2>
            
            {!loading && appointments.filter(a => ['finalizada', 'completada', 'cancelada'].includes(a.status.toLowerCase())).length === 0 ? (
              <p className="text-brand-400 font-bold italic">No tienes citas pasadas.</p>
            ) : appointments.filter(a => ['finalizada', 'completada', 'cancelada'].includes(a.status.toLowerCase())).map(app => (
              <div key={app.id} className="bg-white p-5 rounded-[2rem] border border-brand-100 flex justify-between items-center opacity-80">
                <div>
                   <h3 className="font-black text-brand-900">{app.schedule_details?.service_title || 'Tratamiento Facial'}</h3>
                   <p className="text-xs font-bold text-brand-500">{new Date(app.date_time).toLocaleDateString()} - {new Date(app.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest ${
                     ['finalizada', 'completada'].includes(app.status.toLowerCase()) ? 'bg-brand-100 text-brand-700' : 'bg-red-50 text-red-600'
                   }`}>
                     {app.status}
                </span>
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
                      <span className="font-black text-brand-900 text-xl">{user?.profile?.glow_points || 0}</span>
                   </div>
                   <button onClick={() => setShowStoreModal(true)} className='bg-brand-900 text-white w-full py-4 rounded-2xl font-black hover:bg-brand-800 transition-all shadow-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-2'>
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                     Abrir Boutique de Beneficios
                   </button>
                   <p className="text-[10px] text-brand-500 font-bold uppercase text-center mt-2">Faltan 50 puntos para tu próximo facial gratis</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
