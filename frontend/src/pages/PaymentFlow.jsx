import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Copy, CheckCircle2, ShieldCheck, Phone, Hash } from 'lucide-react';
import { appointmentsApi } from '../api/appointments';

export default function PaymentFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {};

  const [step, setStep] = useState('methods');
  const [method, setMethod] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const montoUSD = bookingData.price || '$45';
  const montoNum = parseFloat(String(montoUSD).replace('$', '')) || 45;
  const montoVES = (montoNum * 46.8).toLocaleString('es-VE', { minimumFractionDigits: 2 });

  /* Copiar al portapapeles */
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  /* Fix del bug de focus: usar onChange con value controlado pero SIN reemplazar el valor
     sino filtrar sólo dígitos al perder el foco. Para el input numérico usamos
     inputMode="numeric" + pattern para que el teclado móvil sea numérico sin el
     comportamiento problemático de type="number" que causa pérdida de foco. */
  const handleRefChange = useCallback((e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setRefNumber(val);
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    setCustomPhone(val);
  }, []);

  const handleFinalizeBooking = async () => {
    setLoading(true);
    try {
      const payload = {
        schedule_id: bookingData.scheduleId,
        payment_method: method,
        payment_reference: refNumber,
        payment_phone_origin: customPhone
      };
      await appointmentsApi.create(payload);
      setStep('success');
    } catch (err) {
      alert('Error al procesar el agendamiento. Revisa tu conexion y los datos.');
    } finally {
      setLoading(false);
    }
  };

  /* Layout compartido */
  const Wrapper = ({ children, title, hideBack }) => (
    <div className="min-h-screen bg-brand-950 flex flex-col font-sans animate-in fade-in duration-300">
      <header className="bg-brand-900 text-white px-6 py-5 flex items-center border-b border-brand-800 shadow-xl sticky top-0 z-10">
        {!hideBack && (
          <button onClick={() => setStep('methods')} className="mr-4 p-2 rounded-full hover:bg-brand-800 transition-colors text-brand-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{bookingData.serviceTitle || 'GlowCare'}</p>
          <h1 className="text-xl font-black tracking-tighter text-white">{title}</h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col p-6 pb-16 max-w-md mx-auto w-full">
        {children}
      </main>
    </div>
  );

  /* PASO 1: SELECCION DE METODO */
  if (step === 'methods') {
    return (
      <Wrapper title="Via de Pago" hideBack>
        <div className="mt-8 mb-10">
          <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{bookingData.serviceTitle || 'Tu Tratamiento'}</h2>
          <p className="text-brand-400 font-bold">Elige como deseas abonar tu sesion</p>
        </div>

        {/* RESUMEN DEL SERVICIO */}
        <div className="bg-brand-800/50 border border-brand-700 rounded-3xl p-6 mb-8 flex justify-between items-center">
          <div>
            <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest mb-1">Total de la sesion</p>
            <p className="text-3xl font-black text-white">{String(montoUSD).startsWith('$') ? montoUSD : `$${montoUSD}`}</p>
            <p className="text-brand-500 font-bold text-sm mt-1">Bs. {montoVES} (tasa 46.8)</p>
          </div>
          <ShieldCheck className="w-10 h-10 text-brand-500" />
        </div>

        <h3 className="text-brand-300 font-black mb-4 text-xs uppercase tracking-widest border-l-4 border-brand-500 pl-4">Metodo de pago</h3>

        <div className="space-y-4">
          <button
            onClick={() => { setMethod('pago_movil'); setStep('info_pago'); }}
            className="w-full flex items-center justify-between p-6 bg-brand-800/50 rounded-3xl border-2 border-brand-700 hover:border-brand-500 hover:bg-brand-800 transition-all group"
          >
            <div className="text-left">
              <span className="font-black text-white block text-lg">Pago Movil Nacional</span>
              <span className="text-[10px] font-black tracking-widest uppercase bg-brand-600 text-white px-3 py-1 rounded-lg mt-2 inline-block">BNC • BDV • Banesco</span>
            </div>
            <ChevronRight className="w-6 h-6 text-brand-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => { setMethod('zinli'); setStep('info_pago'); }}
            className="w-full flex items-center justify-between p-6 bg-brand-800/50 rounded-3xl border-2 border-brand-700 hover:border-brand-500 hover:bg-brand-800 transition-all group"
          >
            <div className="text-left">
              <span className="font-black text-white block text-lg">Zinli</span>
              <span className="text-[10px] font-black tracking-widest uppercase bg-brand-600 text-white px-3 py-1 rounded-lg mt-2 inline-block">USD • Internacional</span>
            </div>
            <ChevronRight className="w-6 h-6 text-brand-500 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => { setMethod('transferencia'); setStep('info_pago'); }}
            className="w-full flex items-center justify-between p-6 bg-brand-800/50 rounded-3xl border-2 border-brand-700 hover:border-brand-500 hover:bg-brand-800 transition-all group"
          >
            <div className="text-left">
              <span className="font-black text-white block text-lg">Transferencia Bancaria</span>
              <span className="text-[10px] font-black tracking-widest uppercase bg-brand-600 text-white px-3 py-1 rounded-lg mt-2 inline-block">VES • Cuentas Nacionales</span>
            </div>
            <ChevronRight className="w-6 h-6 text-brand-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </Wrapper>
    );
  }

  /* PASO 2: CONFIRMACION DE MONTO */
  if (step === 'info_pago') {
    return (
      <Wrapper title="Confirmar Monto">
        <div className="text-center mt-10 space-y-8">
          <div className="bg-brand-500 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Confirma el Monto</h2>
            <p className="text-brand-300 font-medium">Monto exacto a transferir segun la tasa del dia:</p>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-500" />
            <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest mb-2">Total en Bolivares (VES)</p>
            <p className="text-5xl font-black text-brand-950 tracking-tighter">Bs. {montoVES}</p>
            <p className="text-brand-400 font-bold text-sm mt-3">Equivale a {String(montoUSD).startsWith('$') ? montoUSD : `$${montoUSD}`} USD</p>
          </div>

          <div className="bg-brand-800/50 border border-brand-700 rounded-3xl p-5 text-left">
            <p className="text-brand-300 font-bold text-sm">Metodo seleccionado: <span className="text-white font-black uppercase">{method.replace('_', ' ')}</span></p>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <button onClick={() => setStep('paga_tienda')} className="w-full bg-brand-500 text-white font-black py-6 rounded-[2rem] shadow-2xl uppercase tracking-[0.2em] text-xs hover:bg-brand-400 transition-all hover:-translate-y-1 active:scale-95">
            Ver Datos de la Cuenta
          </button>
        </div>
      </Wrapper>
    );
  }

  /* PASO 3: DATOS DE CUENTA */
  if (step === 'paga_tienda') {
    const cuenta = [
      { label: 'Banco', value: 'BNC (Nacional de Credito)', key: 'banco' },
      { label: 'RIF Empresa', value: 'J-500603800', key: 'rif' },
      { label: 'Telefono Pago Movil', value: '0412-346-6196', key: 'tel' },
    ];
    return (
      <Wrapper title="Datos de Transferencia">
        <h2 className="text-2xl font-black text-white mb-6 mt-4 tracking-tighter">Cuentas Receptoras</h2>

        <div className="bg-brand-800 rounded-[2.5rem] p-8 space-y-6 border border-brand-700 shadow-xl mb-8">
          {cuenta.map(c => (
            <div key={c.key} className="flex justify-between items-center border-b border-brand-700 pb-5 last:border-0 last:pb-0">
              <div>
                <p className="text-brand-400 text-[10px] font-black uppercase tracking-widest mb-1">{c.label}</p>
                <p className="font-black text-white text-lg">{c.value}</p>
              </div>
              <button
                onClick={() => handleCopy(c.value, c.key)}
                className={`p-3 rounded-2xl transition-all ${copied === c.key ? 'bg-brand-500 text-white' : 'bg-brand-900 text-brand-400 hover:bg-brand-700'}`}
              >
                {copied === c.key ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-brand-900/50 border border-brand-800 rounded-3xl p-5 mb-8">
          <p className="text-brand-400 font-black text-[10px] uppercase tracking-widest mb-2">Instrucciones</p>
          <ol className="text-brand-300 font-bold text-sm space-y-2 list-decimal list-inside">
            <li>Copia los datos y realiza la transferencia</li>
            <li>Guarda el comprobante (captura o foto)</li>
            <li>Registra los ultimos 4 digitos de la referencia</li>
          </ol>
        </div>

        <div className="mt-auto">
          <button onClick={() => setStep('input_ref')} className="w-full bg-white text-brand-950 font-black py-6 rounded-[2rem] shadow-2xl uppercase tracking-[0.2em] text-xs transition-all hover:bg-brand-100">
            Ya realize la transferencia
          </button>
        </div>
      </Wrapper>
    );
  }

  /* PASO 4: REGISTRO DE REFERENCIA — FIX DEL BUG DE FOCUS */
  if (step === 'input_ref') {
    return (
      <Wrapper title="Registro de Operacion">
        <div className="mt-8 space-y-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Confirma tu Pago</h2>
            <p className="text-brand-400 font-bold">Ingresa los datos de tu comprobante para validar.</p>
          </div>

          {/* REFERENCIA — 4 ULTIMOS DIGITOS */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-brand-400 font-black text-[10px] uppercase tracking-widest px-1">
              <Hash className="w-4 h-4" />
              Ultimos 4 digitos de la Referencia
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-brand-900 border-2 border-brand-700 p-8 rounded-[2.5rem] font-black text-4xl text-white text-center outline-none focus:border-brand-500 transition-all tracking-[0.5em] placeholder:tracking-normal placeholder:text-brand-700"
              value={refNumber}
              onChange={handleRefChange}
              placeholder="0000"
            />
            <p className="text-brand-600 font-bold text-xs text-center px-2">Solo los 4 ultimos digitos del numero de referencia</p>
          </div>

          {/* TELEFONO EMISOR */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-brand-400 font-black text-[10px] uppercase tracking-widest px-1">
              <Phone className="w-4 h-4" />
              Tu Telefono Emisor (sin guiones)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-brand-900 border-2 border-brand-700 p-6 rounded-[2rem] font-black text-xl text-white text-center outline-none focus:border-brand-500 transition-all tracking-widest placeholder:tracking-normal placeholder:text-brand-700"
              value={customPhone}
              onChange={handlePhoneChange}
              placeholder="04XXXXXXXXX"
            />
          </div>

          <button
            onClick={handleFinalizeBooking}
            disabled={refNumber.length < 4 || customPhone.length < 10 || loading}
            className="w-full bg-brand-500 text-white font-black py-6 rounded-[2.5rem] shadow-2xl uppercase tracking-[0.2em] text-xs disabled:opacity-30 flex justify-center items-center gap-3 hover:bg-brand-400 transition-all hover:-translate-y-1 active:scale-95"
          >
            {loading ? (
              <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block" /> Procesando...</>
            ) : (
              <>Finalizar Agendamiento <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </Wrapper>
    );
  }

  /* PASO 5: EXITO */
  if (step === 'success') {
    return (
      <Wrapper title="Confirmacion" hideBack>
        <div className="flex flex-col items-center justify-center h-[75vh] text-center space-y-8 px-4">
          <div className="bg-green-500 w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.4)] animate-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter leading-none mb-4">Cita Agendada</h2>
            <p className="text-brand-300 font-bold leading-relaxed text-lg italic">"Tu sesion ha sido registrada. La especialista ha sido notificada."</p>
          </div>

          <div className="bg-brand-900/50 p-8 rounded-[3rem] border border-brand-800 w-full text-left space-y-3">
            <p className="text-brand-500 font-black text-[10px] uppercase tracking-widest">Resumen del Turno</p>
            <p className="text-white font-bold">Servicio: <span className="text-brand-300">{bookingData.serviceTitle}</span></p>
            <p className="text-white font-bold">Referencia: <span className="text-brand-300">****{refNumber}</span></p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <p className="text-yellow-400 font-black text-[10px] uppercase tracking-widest">Pendiente por Verificacion de Pago</p>
            </div>
          </div>

          <button onClick={() => navigate('/mi-calendario')} className="w-full bg-white text-brand-950 font-black py-6 rounded-[2.5rem] shadow-2xl uppercase tracking-[0.2em] text-xs hover:bg-brand-100 transition-all">
            Ir a Mis Sesiones
          </button>
        </div>
      </Wrapper>
    );
  }

  return null;
}
