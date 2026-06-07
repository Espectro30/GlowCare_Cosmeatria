import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { servicesApi } from '../api/services';

const categories = ['Todas', 'Consulta', 'Estética', 'Belleza', 'Salud', 'Muscular', 'De la piel'];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await servicesApi.getAll();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = activeCategory === 'Todas' 
    ? services 
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="pb-32 pt-20 animate-in fade-in duration-700 bg-[#f8faf8] min-h-screen font-sans selection:bg-brand-200">
      <section className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-20">
          <div className="flex justify-center mb-6">
             <span className="bg-brand-100 text-brand-700 px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border border-brand-200">Menú de Tratamientos</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-brand-950 mb-6 tracking-tighter">Inversión en tu <span className="text-brand-600 italic">bienestar.</span></h1>
          <p className="text-brand-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Protocolos diseñados bajo los más estrictos estándares de la cosmiatría moderna. Selecciona tu ruta de cuidado.
          </p>
        </header>

        {/* Categories Filter - GREEN STYLE */}
        <div className="flex flex-wrap justify-center gap-4 mb-20 bg-white p-4 rounded-[2.5rem] shadow-sm border border-brand-50 w-fit mx-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3.5 rounded-[1.5rem] font-black transition-all duration-500 text-xs uppercase tracking-widest ${
                activeCategory === cat 
                  ? 'bg-brand-900 text-white shadow-2xl scale-105' 
                  : 'bg-transparent text-brand-400 hover:text-brand-900 hover:bg-brand-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-20 font-black text-brand-500 text-xl tracking-widest uppercase">Cargando catálogo...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-4 group border border-brand-50 flex flex-col relative">
                <div className="relative h-72 overflow-hidden bg-brand-50">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-brand-950 font-black shadow-xl flex items-center gap-2 text-xs border border-brand-50">
                 <Star className="w-4 h-4 text-brand-500 fill-current" />
                 5.0 / 5
                </div>
                <div className="absolute bottom-6 left-6 bg-brand-950/80 backdrop-blur-xl px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.2em] border border-brand-700">
                 {service.category}
                </div>
              </div>
              
              <div className="p-10 flex flex-col flex-grow relative">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-brand-500 text-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl font-black text-lg border-4 border-white">
                   ${service.price}
                </div>
                
                <div className="mb-6">
                   <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-brand-400" />
                      <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Protocolo Clínico</p>
                   </div>
                   <h3 className="text-2xl font-black text-brand-950 leading-tight tracking-tighter">{service.title}</h3>
                </div>
                
                <p className="text-brand-500 mb-8 flex-grow font-medium leading-relaxed italic">"{service.description}"</p>
                
                <Link 
                  to={`/servicio/${service.id}`}
                  className="group/btn flex items-center justify-between w-full bg-brand-50 text-brand-900 hover:bg-brand-900 hover:text-white font-black py-6 px-8 rounded-[2rem] transition-all duration-500 uppercase text-[10px] tracking-widest shadow-inner border border-brand-100"
                >
                  Agendar Sesión
                  <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
            {filteredServices.length === 0 && (
              <div className="col-span-full text-center py-32 px-6 bg-white rounded-[4rem] border border-dashed border-brand-200">
                <Sparkles className="w-16 h-16 text-brand-100 mx-auto mb-6" />
                <p className="text-2xl font-black text-brand-950 tracking-tighter">No hay servicios en esta categoría.</p>
                <button onClick={() => setActiveCategory('Todas')} className="mt-6 bg-brand-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-transform">Restaurar Filtros</button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
