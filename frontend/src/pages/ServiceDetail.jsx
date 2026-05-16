import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Sparkles, Info, CheckCircle2, ShieldCheck, ChevronLeft, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { servicesApi } from '../api/services';

/* Datos detallados de fallback para demo sin BD */
const fallbackServices = {
  'limpieza-profunda': {
    title: 'Limpieza Facial Profunda',
    category: 'De la piel',
    description: 'Tratamiento purificante clinicamente validado que combina extraccion manual, exfoliacion enzimatica y mascarilla hidratante organica de activos botanicos. Ideal para pieles grasas, mixtas o con comedones.',
    price: '$45',
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200',
    benefits: ['Extraccion profunda de impurezas', 'Cierre y refinamiento de poros', 'Luminosidad inmediata', 'Hidratacion celular activa'],
    ideal_for: 'Pieles grasas, mixtas o con comedones visibles.',
    post_treatment: 'Evitar exposicion solar directa 48 horas. Aplicar FPS 50+.',
  },
  'anti-aging': {
    title: 'Terapia Anti-Aging',
    category: 'Estetica',
    description: 'Protocolo rejuvenecedor de ultima generacion que combina radiofrecuencia monopolar, microdermoabrasion y sueros concentrados de peptidos bioactivos. Resultados visibles desde la primera sesion.',
    price: '$75',
    duration: '90 min',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1200',
    benefits: ['Reduccion de lineas de expresion', 'Reafirmacion del ovalo facial', 'Estimulacion de colageno', 'Efecto lifting sin cirugia'],
    ideal_for: 'Pieles maduras o con signos tempranos de envejecimiento.',
    post_treatment: 'Hidratacion intensa y proteccion solar obligatoria.',
  },
  'hidratacion-intensiva': {
    title: 'Hidratacion Intensiva',
    category: 'De la piel',
    description: 'Protocolo clinico de restablecimiento de la barrera cutanea que utiliza acido hialuronico de triple peso molecular, vitamina C estabilizada y ceramidas de origen vegetal. Resultados desde la primera aplicacion.',
    price: '$55',
    duration: '75 min',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1200',
    benefits: ['Hidratacion sostenida 72 horas', 'Restauracion de la barrera cutanea', 'Reduccion de descamacion', 'Efecto plumping natural'],
    ideal_for: 'Pieles deshidratadas, sensibles o con deshidratacion estacional.',
    post_treatment: 'Aplicar hidratante ligero y evitar agua caliente 24 horas.',
  },
  'masaje-descontracturante': {
    title: 'Masaje Descontracturante',
    category: 'Muscular',
    description: 'Terapia manual especializada de alta presion focalizada en grupos musculares con tension cronica. Libera nudos miofasciales, mejora la alineacion postural y activa la circulacion linfatica profunda.',
    price: '$60',
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200',
    benefits: ['Alivio de tension muscular cronica', 'Mejora de la movilidad articular', 'Reduccion del estres fisico', 'Activacion de la circulacion'],
    ideal_for: 'Personas con trabajo de oficina, deportistas o con contracturas cronicas.',
    post_treatment: 'Hidratacion abundante y reposo 2-3 horas.',
  },
  'consulta-inicial': {
    title: 'Evaluacion Cosmiatrica',
    category: 'Consulta',
    description: 'Diagnostico integral de tu biotipo cutaneo mediante analisis instrumental y dermatoscopico. La especialista disenara un plan clinico completamente personalizado para tus objetivos esteticos y de salud cutanea.',
    price: '$30',
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1200',
    benefits: ['Diagnostico de biotipo cutaneo', 'Plan de tratamiento personalizado', 'Historial clinico inicial', 'Recomendaciones de productos'],
    ideal_for: 'Primera visita o pacientes que inician su ruta estetica.',
    post_treatment: 'Aplicar el protocolo basico recomendado por la especialista.',
  },
  'drenaje-linfatico': {
    title: 'Drenaje Linfatico',
    category: 'Salud',
    description: 'Tecnica manual ritmada de presion suave que estimula el sistema linfatico para eliminar toxinas, reducir la retencion de liquidos y desinflamar tejidos. Altamente efectiva para el post-operatorio estetico.',
    price: '$50',
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=1200',
    benefits: ['Eliminacion de toxinas', 'Reduccion del edema', 'Mejora de la circulacion linfatica', 'Relajacion profunda del sistema nervioso'],
    ideal_for: 'Personas con retencion de liquidos, post-cirugia o con celulitis.',
    post_treatment: 'Tomar al menos 2 litros de agua y reposo 24 horas.',
  },
};

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const allServices = await servicesApi.getAll();

        /* Buscar por slug o por titulo normalizado */
        const found = allServices.find(
          s => s.slug === id || s.title.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '-') === id
        );

        if (found) {
          const extra = fallbackServices[id] || {};
          setService({ ...extra, ...found, description: found.description || extra.description });
          
          // Buscar horarios disponibles (solo los que is_booked = False)
          const availSchedules = await servicesApi.getSchedules(found.id);
          setSchedules(availSchedules);
        } else {
          setService(fallbackServices[id] || Object.values(fallbackServices)[0]);
        }
      } catch (e) {
        setService(fallbackServices[id] || Object.values(fallbackServices)[0]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-900">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-brand-400 border-t-white rounded-full mx-auto mb-4" />
        <p className="text-white font-black uppercase tracking-widest text-xs">Cargando experiencia GlowCare...</p>
      </div>
    </div>
  );

  if (!service) return null;

  const handleGoToPayment = () => {
    navigate('/checkout', {
      state: {
        serviceId: service.id || id,
        serviceTitle: service.title,
        scheduleId: selectedSchedule,
        price: service.price
      }
    });
  };

  const priceDisplay = typeof service.price === 'number' ? `$${service.price}` : service.price;
  const durationDisplay = service.duration || (service.duration_minutes ? `${service.duration_minutes} min` : '60 min');

  return (
    <div className="bg-[#f0f4f0] min-h-screen pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-700">

        {/* BREADCRUMB */}
        <Link to="/servicios" className="inline-flex items-center text-brand-700 hover:text-brand-950 font-black mb-10 transition-all gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-brand-100 uppercase text-xs tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Volver al catalogo
        </Link>

        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-[4rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-brand-50">
          <div className="flex flex-col lg:flex-row">
            {/* IMAGEN */}
            <div className="lg:w-5/12 relative h-[400px] lg:h-auto overflow-hidden min-h-[400px]">
              <img
                src={service.image || service.image_url || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200'}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white z-10">
                <span className="bg-brand-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{service.category || 'Tratamiento'}</span>
                <h1 className="text-4xl font-black tracking-tighter leading-tight">{service.title}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-black text-sm">5.0</span>
                  <span className="text-brand-300 text-xs font-bold ml-1">— Protocolo Clinico Certificado</span>
                </div>
              </div>
            </div>

            {/* CONTENIDO DETALLADO */}
            <div className="lg:w-7/12 p-10 lg:p-16">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-brand-500" />
                <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.3em]">Certificacion Medica GlowCare</p>
              </div>

              {/* DESCRIPCION */}
              <p className="text-lg text-nut-700 mb-8 leading-relaxed font-medium">
                {service.description}
              </p>

              {/* PRECIO Y DURACION */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                  <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest mb-1">Inversion</p>
                  <p className="text-3xl font-black text-brand-900">{priceDisplay}</p>
                </div>
                <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest">Duracion</p>
                  </div>
                  <p className="text-3xl font-black text-brand-900">{durationDisplay}</p>
                </div>
              </div>

              {/* BENEFICIOS */}
              {service.benefits && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-brand-500" />
                    <h3 className="font-black text-brand-950 text-sm uppercase tracking-widest">Beneficios del Protocolo</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-3 bg-brand-50 p-3 rounded-2xl border border-brand-100">
                        <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <p className="text-sm font-bold text-brand-800">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IDEAL PARA */}
              {service.ideal_for && (
                <div className="bg-nut-50 border border-nut-100 rounded-3xl p-6 mb-8">
                  <p className="text-[10px] font-black text-nut-600 uppercase tracking-widest mb-1">Ideal para</p>
                  <p className="text-nut-800 font-bold">{service.ideal_for}</p>
                </div>
              )}

              {/* POST-TRATAMIENTO */}
              {service.post_treatment && (
                <div className="bg-brand-50 border-l-4 border-brand-500 rounded-r-3xl p-5 mb-8">
                  <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1">Cuidados Post-Tratamiento</p>
                  <p className="text-brand-700 font-bold text-sm">{service.post_treatment}</p>
                </div>
              )}

              {/* CTA */}
              {user ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-brand-800 hover:bg-brand-700 text-white font-black text-lg py-6 rounded-[2.5rem] flex justify-center items-center gap-4 transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
                >
                  <Calendar className="w-6 h-6 text-brand-300" />
                  Seleccionar Horario y Agendar
                </button>
              ) : (
                <div className="bg-brand-50 p-8 rounded-[3rem] border border-brand-100 text-center">
                  <h3 className="font-black text-brand-900 text-lg mb-4">Inicia sesion para agendar</h3>
                  <div className="flex gap-4 justify-center">
                    <Link to="/login" className="bg-brand-800 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-brand-700 transition-all uppercase text-xs tracking-widest">Iniciar Sesion</Link>
                    <Link to="/registro" className="bg-white text-brand-800 border border-brand-200 px-8 py-4 rounded-2xl font-black hover:bg-brand-50 transition-all uppercase text-xs tracking-widest">Registrarme</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SELECCION DE HORARIO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[4rem] p-12 w-full max-w-2xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-500" />
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-brand-200 hover:text-brand-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6 text-brand-500" />
              <h3 className="text-3xl font-black text-brand-950 tracking-tighter">Selecciona un Cupo Disponible</h3>
            </div>
            <p className="text-brand-500 mb-8 font-bold">Elige el horario publicado por la especialista que mejor se adapte a ti.</p>

            <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto pr-2">
              {schedules.length === 0 ? (
                <div className="text-center py-10 bg-brand-50 rounded-3xl">
                  <p className="text-brand-400 font-bold italic">No hay horarios disponibles por el momento para este servicio.</p>
                </div>
              ) : schedules.map((sched) => (
                <label
                  key={sched.id}
                  className={`flex items-center justify-between p-6 rounded-3xl border-4 cursor-pointer transition-all ${selectedSchedule === sched.id ? 'border-brand-600 bg-brand-50' : 'border-nut-100 bg-white hover:border-brand-200'}`}
                >
                  <div className="flex items-center gap-5">
                    <input
                      type="radio"
                      className="w-5 h-5 text-brand-600 cursor-pointer"
                      checked={selectedSchedule === sched.id}
                      onChange={() => setSelectedSchedule(sched.id)}
                    />
                    <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center font-black text-brand-700 text-lg">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-brand-950 text-lg">{sched.date} a las {sched.start_time}</p>
                      <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest">Dra. {sched.cosmiatra_name}</p>
                    </div>
                  </div>
                  {selectedSchedule === sched.id && <CheckCircle2 className="w-6 h-6 text-brand-500" />}
                </label>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="w-1/3 bg-nut-50 text-nut-600 border border-nut-200 font-black py-5 rounded-[2rem] hover:bg-nut-100 transition-all uppercase text-[10px] tracking-widest">Cancelar</button>
              <button
                onClick={handleGoToPayment}
                disabled={!selectedSchedule}
                className="w-2/3 bg-brand-900 text-white font-black py-5 rounded-[2.5rem] disabled:opacity-30 transition-all shadow-2xl uppercase text-xs tracking-widest hover:bg-brand-700 hover:-translate-y-1 active:scale-95"
              >
                Confirmar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
