import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, UserPlus, ChevronRight, ChevronLeft, ClipboardList, AlertTriangle, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { authApi } from '../api/auth'

/* Opciones de resultado de tratamientos previos */
const RESULTADO_OPTIONS = ['Excelente resultado', 'Buen resultado', 'Resultado regular', 'Resultado negativo / Reaccion adversa'];

export default function Register() {
  const navigate = useNavigate();

  /* ── PASO 1: Datos de cuenta ── */
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', cedula: '', telefono: '', password: ''
  });

  /* ── PASO 2: Datos clinicos ── */
  const [clinicalData, setClinicalData] = useState({
    alergias: false,
    alergias_detalle: '',
    tratamiento_previo: false,
    tratamiento_previo_tipo: '',
    tratamiento_resultado: '',
    enfermedades_piel: '',
    medicamentos_actuales: '',
    embarazo_lactancia: false,
    fototipo: '',
    observaciones: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Validacion minima del paso 1 */
  const paso1Valido = formData.name && formData.email && formData.cedula && formData.telefono && formData.password.length >= 6;

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!paso1Valido) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      /* Serializar datos clinicos como JSON y guardar en el campo 'address' del perfil */
      const clinical_json = JSON.stringify(clinicalData);
      await authApi.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        cedula: formData.cedula,
        telefono: formData.telefono,
        clinical_data: clinical_json,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrio un error en el registro. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────── STEP 1: CUENTA ─────────────── */
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-nut-100 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 my-8">

          {/* ICONO + TITULO */}
          <div className="flex justify-center mb-5">
            <div className="bg-brand-50 p-4 rounded-full text-brand-600 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>

          {/* INDICADOR DE PASO */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 bg-brand-700 text-white rounded-full flex items-center justify-center font-black text-sm">1</span>
              <span className="text-brand-700 font-black text-xs uppercase tracking-wider">Tu Cuenta</span>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-300" />
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-8 bg-brand-100 text-brand-400 rounded-full flex items-center justify-center font-black text-sm">2</span>
              <span className="text-brand-400 font-black text-xs uppercase tracking-wider">Datos Clinicos</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-center text-brand-900 mb-2 tracking-tight">Crea tu cuenta</h2>
          <p className="text-center text-brand-500 mb-7 font-medium text-sm">Datos reales obligatorios para emitir pagos y gestionar tu calendario.</p>

          {error && <div className="mb-5 text-center text-sm font-bold bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl">{error}</div>}

          <form className="space-y-4" onSubmit={handleStep1}>
            <Field label="Nombre Completo" type="text" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Ana Maria Gomez" required />
            <Field label="Cedula de Identidad" type="text" inputMode="numeric" value={formData.cedula} onChange={v => setFormData({ ...formData, cedula: v })} placeholder="30773710" required />
            <Field label="Telefono Personal" type="text" inputMode="numeric" value={formData.telefono} onChange={v => setFormData({ ...formData, telefono: v })} placeholder="04121234567" required />
            <Field label="Correo Electronico" type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="tu@correo.com" required />
            <Field label="Contrasena (min. 6 caracteres)" type="password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} placeholder="••••••••" required />

            <button
              type="submit"
              disabled={!paso1Valido}
              className="w-full bg-brand-800 hover:bg-brand-900 disabled:bg-brand-300 text-white font-extrabold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 mt-6 text-sm uppercase tracking-widest"
            >
              Continuar <ChevronRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center mt-7 border-t border-brand-50 pt-6 text-brand-600 font-medium">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="font-extrabold text-brand-900 hover:text-brand-600 transition-colors uppercase text-xs ml-2 border border-brand-200 px-3 py-1 rounded-lg">Iniciar sesion</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ─────────────── STEP 2: DATOS CLINICOS ─────────────── */
  return (
    <div className="min-h-screen bg-[#f0f4f0] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 sm:p-10 rounded-[3rem] shadow-2xl border border-nut-100 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 my-8">

        {/* CABECERA */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setStep(1)} className="text-brand-400 hover:text-brand-700 transition-colors p-1">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 p-3 rounded-2xl text-brand-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-brand-900 tracking-tight">Datos Clinicos</h2>
              <p className="text-brand-400 font-bold text-xs uppercase tracking-wider">Paso 2 de 2</p>
            </div>
          </div>
        </div>

        {/* INDICADOR */}
        <div className="flex items-center gap-3 mb-7 mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 bg-brand-200 text-brand-600 rounded-full flex items-center justify-center font-black text-sm">✓</span>
            <span className="text-brand-400 font-black text-xs uppercase">Cuenta</span>
          </div>
          <ChevronRight className="w-4 h-4 text-brand-300" />
          <div className="flex items-center gap-1.5">
            <span className="w-7 h-7 bg-brand-700 text-white rounded-full flex items-center justify-center font-black text-sm">2</span>
            <span className="text-brand-700 font-black text-xs uppercase">Datos Clinicos</span>
          </div>
        </div>

        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-7 flex gap-3">
          <Stethoscope className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
          <p className="text-brand-700 font-bold text-sm leading-relaxed">Esta informacion es confidencial y solo la puede ver tu cosmiatra asignada. Nos ayuda a ofrecerte un tratamiento 100% personalizado y seguro.</p>
        </div>

        {error && <div className="mb-5 text-center text-sm font-bold bg-red-50 border border-red-100 text-red-600 p-3 rounded-2xl">{error}</div>}

        <form onSubmit={handleFinalRegister} className="space-y-6">

          {/* ALERGIAS */}
          <SectionCard icon={<AlertTriangle className="w-5 h-5" />} title="Alergias">
            <RadioGroup
              label="¿Tienes alguna alergia conocida?"
              value={clinicalData.alergias}
              onChange={v => setClinicalData({ ...clinicalData, alergias: v })}
              options={[{ label: 'Si, tengo alergias', value: true }, { label: 'No tengo alergias conocidas', value: false }]}
            />
            {clinicalData.alergias && (
              <textarea
                rows={2}
                value={clinicalData.alergias_detalle}
                onChange={e => setClinicalData({ ...clinicalData, alergias_detalle: e.target.value })}
                className="w-full mt-3 bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm resize-none"
                placeholder="Describe tus alergias: productos, ingredientes, materiales..."
              />
            )}
          </SectionCard>

          {/* TRATAMIENTOS PREVIOS */}
          <SectionCard icon={<ClipboardList className="w-5 h-5" />} title="Tratamientos Esteticos Previos">
            <RadioGroup
              label="¿Has recibido tratamientos esteticos anteriormente?"
              value={clinicalData.tratamiento_previo}
              onChange={v => setClinicalData({ ...clinicalData, tratamiento_previo: v })}
              options={[{ label: 'Si, he recibido tratamientos', value: true }, { label: 'Es mi primera vez', value: false }]}
            />
            {clinicalData.tratamiento_previo && (
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={clinicalData.tratamiento_previo_tipo}
                  onChange={e => setClinicalData({ ...clinicalData, tratamiento_previo_tipo: e.target.value })}
                  className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm"
                  placeholder="Tipo de tratamiento (ej: laser, peeling, radiofrecuencia...)"
                />
                <select
                  value={clinicalData.tratamiento_resultado}
                  onChange={e => setClinicalData({ ...clinicalData, tratamiento_resultado: e.target.value })}
                  className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm"
                >
                  <option value="">-- Como fue el resultado? --</option>
                  {RESULTADO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
          </SectionCard>

          {/* ENFERMEDADES DE LA PIEL */}
          <SectionCard icon={<Stethoscope className="w-5 h-5" />} title="Condiciones Cutaneas">
            <textarea
              rows={2}
              value={clinicalData.enfermedades_piel}
              onChange={e => setClinicalData({ ...clinicalData, enfermedades_piel: e.target.value })}
              className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm resize-none"
              placeholder="Rosacea, psoriasis, dermatitis, acne cronico... (deja en blanco si no aplica)"
            />
          </SectionCard>

          {/* MEDICAMENTOS */}
          <SectionCard icon={<ClipboardList className="w-5 h-5" />} title="Medicamentos Actuales">
            <input
              type="text"
              value={clinicalData.medicamentos_actuales}
              onChange={e => setClinicalData({ ...clinicalData, medicamentos_actuales: e.target.value })}
              className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm"
              placeholder="Ej: isotretinoina, anticoagulantes... (deja en blanco si no tomas)"
            />
          </SectionCard>

          {/* EMBARAZO / LACTANCIA */}
          <SectionCard icon={<AlertTriangle className="w-5 h-5 text-nut-500" />} title="Estado Fisiologico">
            <RadioGroup
              label="¿Estas embarazada o en periodo de lactancia?"
              value={clinicalData.embarazo_lactancia}
              onChange={v => setClinicalData({ ...clinicalData, embarazo_lactancia: v })}
              options={[{ label: 'Si', value: true }, { label: 'No', value: false }]}
            />
          </SectionCard>

          {/* FOTOTIPO */}
          <SectionCard icon={<Sparkles className="w-5 h-5" />} title="Fototipo Cutaneo">
            <select
              value={clinicalData.fototipo}
              onChange={e => setClinicalData({ ...clinicalData, fototipo: e.target.value })}
              className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm"
            >
              <option value="">-- No estoy seguro/a --</option>
              <option value="I">Tipo I — Muy clara, siempre se quema</option>
              <option value="II">Tipo II — Clara, casi siempre se quema</option>
              <option value="III">Tipo III — Morena clara, a veces se quema</option>
              <option value="IV">Tipo IV — Morena, raramente se quema</option>
              <option value="V">Tipo V — Oscura, nunca se quema</option>
              <option value="VI">Tipo VI — Muy oscura</option>
            </select>
          </SectionCard>

          {/* OBSERVACIONES ADICIONALES */}
          <div>
            <label className="block text-[11px] font-extrabold text-brand-700 mb-2 uppercase tracking-wider">Observaciones adicionales (opcional)</label>
            <textarea
              rows={3}
              value={clinicalData.observaciones}
              onChange={e => setClinicalData({ ...clinicalData, observaciones: e.target.value })}
              className="w-full bg-brand-50 border border-brand-200 rounded-2xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 text-sm resize-none"
              placeholder="Cualquier informacion adicional que consideres importante para tu especialista..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-800 hover:bg-brand-900 disabled:bg-brand-300 text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Registrando...' : 'Completar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Componentes auxiliares ── */
function Field({ label, type, value, onChange, placeholder, required, inputMode }) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-brand-700 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-5 py-3.5 bg-brand-50 border border-brand-200 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/20 font-bold transition-all text-brand-900"
        placeholder={placeholder}
      />
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-nut-50 border border-nut-100 rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-nut-700 mb-1">
        {icon}
        <span className="font-black text-sm uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function RadioGroup({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <p className="text-brand-700 font-bold text-sm">{label}</p>
      <div className="flex gap-3 flex-wrap">
        {options.map(opt => (
          <label
            key={String(opt.value)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 cursor-pointer transition-all text-sm font-black ${value === opt.value ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-nut-200 bg-white text-nut-600 hover:border-brand-300'}`}
          >
            <input
              type="radio"
              className="hidden"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
