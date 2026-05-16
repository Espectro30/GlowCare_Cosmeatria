import { Link } from 'react-router-dom';
import { Leaf, Award, HeartHandshake, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="pb-16 animate-in fade-in duration-700 bg-[#f1f5f1] min-h-screen font-sans selection:bg-brand-200">
      {/* HERO SECTION - MASTER CLASS */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/90 via-brand-900/60 to-brand-950 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=2000" 
          alt="Spa hero" 
          className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[5s]"
        />
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
          <div className="flex justify-center mb-8 animate-in slide-in-from-top-10 duration-1000">
             <span className="bg-brand-900 text-brand-300 px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.4em] border border-brand-600 shadow-lg">Estetica Profesional de Elite</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
             Resalta tu <span className="text-brand-400 italic">brillo</span> natural.
          </h1>
          <p className="text-xl md:text-2xl text-white mb-12 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
             Arquitectura clinica avanzada para el cuidado de la piel. Ciencia, naturaleza y relajacion en un solo santuario.
          </p>
          <div className="flex flex-col sm:row justify-center gap-6">
            <Link to="/servicios" className="bg-brand-500 text-white px-12 py-5 rounded-[2.5rem] font-black text-lg hover:bg-brand-400 transition-all shadow-[0_20px_50px_rgba(92,131,86,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3">
              Explorar Tratamientos <ChevronRight className="w-6 h-6" />
            </Link>
            {!user && (
              <Link to="/registro" className="bg-transparent text-white px-12 py-5 rounded-[2.5rem] font-black text-lg hover:bg-white/10 transition-all border-2 border-white/30 backdrop-blur-md">
                Crear Cuenta Paciente
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* VALUES SECTION - VERY GREEN */}
      <section className="max-w-7xl mx-auto px-6 mt-32 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div>
              <p className="text-brand-500 font-black text-xs uppercase tracking-[0.5em] mb-4">Nuestra Identidad</p>
              <h2 className="text-5xl font-black text-brand-950 mb-8 tracking-tighter leading-tight">El estándar de oro en <br/><span className="text-brand-600 underline decoration-brand-200 underline-offset-8">Cosmiatría Orgánica.</span></h2>
              <p className="text-lg text-brand-700 font-medium leading-relaxed text-justify mb-10">
                GlowCare no es solo una clínica; es un ecosistema diseñado para la regeneración celular y el equilibrio espiritual. Fusionamos tecnología dermatológica de vanguardia con activos botánicos puros para garantizar resultados visibles desde la primera sesión.
              </p>
              <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border-l-8 border-brand-500 shadow-sm">
                 <ShieldCheck className="w-12 h-12 text-brand-600" />
                 <div>
                    <p className="font-black text-brand-950">Seguridad Garantizada</p>
                    <p className="text-sm text-brand-500 font-bold">Protocolos médicos certificados bajo estándares internacionales.</p>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-brand-50 hover:-translate-y-2 transition-all">
                 <Leaf className="w-10 h-10 text-brand-500 mb-6" />
                 <h3 className="text-xl font-black text-brand-950 mb-3">Eco-Bio-Terapia</h3>
                 <p className="text-sm text-brand-600 font-bold leading-relaxed">Productos 100% libres de tóxicos y parabenos.</p>
              </div>
              <div className="bg-brand-900 p-10 rounded-[3rem] shadow-2xl text-white hover:-translate-y-2 transition-all">
                 <Award className="w-10 h-10 text-brand-400 mb-6" />
                 <h3 className="text-xl font-black mb-3">Staff Elite</h3>
                 <p className="text-sm text-brand-300 font-medium leading-relaxed">Especialistas con más de 10 años de trayectoria clínica.</p>
              </div>
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-brand-50 md:col-span-2 flex items-center gap-8">
                 <div className="bg-brand-50 p-4 rounded-full"><HeartHandshake className="w-10 h-10 text-brand-500" /></div>
                 <div>
                    <h3 className="text-xl font-black text-brand-950">Atención Personalizada</h3>
                    <p className="text-sm text-brand-600 font-bold">Diagnóstico instrumental facial en cada consulta inicial.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-brand-100 py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-400 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 px-6">
          <Sparkles className="w-16 h-16 text-brand-500 mx-auto mb-10 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black text-brand-950 mb-8 tracking-tighter leading-none">
            Transforma tu ritual de cuidado hoy mismo.
          </h2>
          <p className="text-brand-700 text-xl mb-12 font-medium">
            Únete a nuestra comunidad de pacientes y accede a la agenda exclusiva de nuestras cosmiatras.
          </p>
          <div className="flex justify-center gap-6 flex-col sm:row">
            <Link to="/servicios" className="bg-white text-brand-950 px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-brand-100 transition-all shadow-2xl">
              Agendar Tratamiento
            </Link>
            {user ? (
              <Link to={user.role === 'admin' ? '/admin-dashboard' : '/mi-calendario'} className="bg-brand-900/50 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-brand-900 border border-brand-800 transition-all backdrop-blur-md">
                Ir a Mi Panel
              </Link>
            ) : (
              <Link to="/registro" className="bg-brand-900/50 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-brand-900 border border-brand-800 transition-all backdrop-blur-md">
                Registrarme Gratis
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER MINI */}
      <footer className="pt-20 text-center">
         <p className="text-brand-400 font-black text-[10px] uppercase tracking-[0.5em]">GlowCare &copy; 2026 | Sistema Médico v2.1.0</p>
      </footer>
    </div>
  );
}
