import { Link, useParams } from 'react-router-dom'
import { Send, User } from 'lucide-react'
import { useState } from 'react'

export default function Chat() {
  const { id } = useParams()
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! Soy la Lic. Ana Gómez. Vi que reservaste la Limpieza Facial Profunda para el Miércoles.", sender: "cosmiatra", time: "10:00 AM" },
    { id: 2, text: "¿Tienes alguna duda sobre qué crema hidratante aplicar antes de venir?", sender: "cosmiatra", time: "10:01 AM" }
  ])
  const [input, setInput] = useState("")

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now(), text: input, sender: "client", time: "Ahora" }])
    setInput("")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[85vh] flex flex-col animate-in fade-in duration-500">
      <Link to="/mi-calendario" className="text-brand-600 hover:text-brand-800 font-medium mb-6 inline-flex items-center gap-2">
        &larr; Volver a Mi Calendario Semanal
      </Link>
      
      <div className="bg-white rounded-3xl shadow-xl border border-brand-100 flex-grow flex flex-col overflow-hidden ring-1 ring-brand-50">
        {/* Chat Header */}
        <div className="bg-brand-50/80 p-6 flex justify-between items-center border-b border-brand-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md text-brand-600 border-2 border-brand-300 relative">
              <User className="w-7 h-7" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="font-extrabold text-brand-900 text-xl tracking-tight">Lic. Ana Gómez</h2>
              <p className="text-sm font-medium text-brand-600">Servicio asignado: Limpieza Facial Profunda</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto bg-gradient-to-b from-brand-50/20 to-white flex flex-col gap-5">
          <div className="text-center text-xs text-brand-400 font-bold uppercase tracking-wider mb-2 border-b border-brand-100 pb-3 flex justify-center">
            <span className="bg-brand-50 px-3 rounded-full">Hoy</span>
          </div>
          
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'client' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[75%] px-6 py-4 rounded-3xl text-[15px] font-medium leading-relaxed ${
                m.sender === 'client' 
                  ? 'bg-brand-700 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white text-brand-800 rounded-tl-sm shadow-md border border-brand-100'
              }`}>
                {m.text}
              </div>
              <span className="text-xs font-bold text-brand-400 mt-1.5 px-2">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-5 bg-white border-t border-brand-100 flex gap-4 items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje aquí..."
            className="flex-grow bg-brand-50/80 border border-brand-200 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-brand-400 text-brand-800 font-medium transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
          >
            <Send className="w-6 h-6 -ml-1 mt-0.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
