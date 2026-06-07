import { useState, useRef, useEffect } from 'react';
import { UserCircle, Mail, Phone, FileText, Camera, Save, X, Pencil, Shield, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../api/axios';
import { authApi } from '../api/auth';

export default function Profile() {
  const { user, login } = useAuth();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [notifications, setNotifications] = useState([]);

  /* Datos editables inicializados desde el contexto */
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      if (user.avatar) setAvatar(user.avatar);
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const notifs = await authApi.getNotifications();
      setNotifications(notifs);
    } catch (e) {
      console.error("Error cargando notificaciones", e);
    }
  };

  const markAsRead = async (id) => {
    try {
      await authApi.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f0]">
        <p className="text-brand-700 font-bold text-lg">Por favor inicia sesion para ver tu perfil.</p>
      </div>
    );
  }

  const roleLabel = {
    admin: '🛡 Administrador',
    cosmiatra: '🌿 Especialista Cosmiatra',
    cliente: '✦ Paciente',
  }[user.role] || 'Usuario';

  const roleBg = {
    admin: 'from-brand-800 to-brand-600',
    cosmiatra: 'from-brand-700 to-brand-400',
    cliente: 'from-nut-600 to-nut-400',
  }[user.role] || 'from-brand-700 to-brand-400';

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        first_name: form.name,
        phone: form.phone,
        bio: form.bio,
      };
      if (avatarPreview) {
        payload.avatar = avatarPreview;
      }
      const response = await apiClient.patch('/usuarios/me/', payload);
      
      const current = JSON.parse(localStorage.getItem('glowcare_user') || '{}');
      const updated = { ...current, name: form.name, phone: form.phone, bio: form.bio, avatar: avatarPreview || avatar };
      localStorage.setItem('glowcare_user', JSON.stringify(updated));
      if (avatarPreview) setAvatar(avatarPreview);
      setSaveOk(true);
      setTimeout(() => { setSaveOk(false); setEditing(false); }, 1800);
    } catch (e) {
      console.error("Error guardando perfil", e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
    setAvatarPreview(null);
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f0] pb-24 font-sans animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-white rounded-[4rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-nut-100">

          {/* BANNER SUPERIOR */}
          <div className={`h-36 bg-gradient-to-r ${roleBg} relative`}>
            <div className="absolute inset-0 opacity-20">
              <div className="w-64 h-64 rounded-full bg-white/30 blur-3xl absolute -top-20 -right-20" />
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" /> Editar Perfil
              </button>
            )}
          </div>

          <div className="px-10 pb-12 relative">
            {/* AVATAR */}
            <div className="flex justify-center -mt-16 mb-6 relative">
              <div className="bg-white p-2 rounded-full shadow-xl relative group">
                {(avatarPreview || avatar) ? (
                  <img src={avatarPreview || avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
                ) : (
                  <div className="bg-brand-50 w-28 h-28 rounded-full flex items-center justify-center text-brand-600">
                    <UserCircle className="w-16 h-16" />
                  </div>
                )}
                {editing && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 bg-brand-950/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </>
                )}
              </div>
            </div>

            {/* NOMBRE Y ROL */}
            <div className="text-center mb-8">
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="text-3xl font-black text-center text-brand-950 bg-brand-50 border-2 border-brand-200 rounded-2xl px-6 py-3 outline-none focus:border-brand-500 w-full max-w-sm mb-3"
                  placeholder="Tu nombre completo"
                />
              ) : (
                <h1 className="text-3xl font-black text-brand-950 tracking-tighter mb-2">{user.name || 'Mi Perfil'}</h1>
              )}
              <span className="bg-brand-100 text-brand-800 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block">
                {roleLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CONTENIDO PRINCIPAL DEPENDIENDO DEL ROL */}
              <div className="lg:col-span-2 space-y-6">
                {user.role === 'cliente' ? (
                  /* VISTA CLIENTE */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-nut-50 p-6 rounded-3xl border border-nut-100">
                        <div className="flex items-center gap-3 text-nut-600 mb-2">
                          <Mail className="w-5 h-5" />
                          <span className="font-black text-xs uppercase tracking-wider">Correo</span>
                        </div>
                        <p className="text-nut-900 font-bold text-lg">{user.email}</p>
                      </div>

                      <div className="bg-nut-50 p-6 rounded-3xl border border-nut-100">
                        <div className="flex items-center gap-3 text-nut-600 mb-2">
                          <Phone className="w-5 h-5" />
                          <span className="font-black text-xs uppercase tracking-wider">Teléfono</span>
                        </div>
                        {editing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9+\- ]/g, '') })}
                            className="w-full bg-white border-2 border-nut-200 rounded-xl px-4 py-2.5 font-bold text-nut-900 outline-none focus:border-brand-400 transition-all"
                          />
                        ) : (
                          <p className="text-nut-900 font-bold text-lg">{form.phone || 'No registrado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-nut-50 p-6 rounded-3xl border border-nut-100">
                      <div className="flex items-center gap-3 text-nut-600 mb-3">
                        <FileText className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-wider">Historial Clínico</span>
                      </div>
                      {editing ? (
                        <textarea
                          value={form.bio}
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                          rows={3}
                          className="w-full bg-white border-2 border-nut-200 rounded-xl px-4 py-3 font-bold text-nut-900 outline-none focus:border-brand-400 transition-all resize-none"
                        />
                      ) : (
                        <p className="text-nut-700 font-medium leading-relaxed">{form.bio || 'Sin historial clínico registrado.'}</p>
                      )}
                    </div>
                  </>
                ) : (
                  /* VISTA STAFF (Admin, Cosmiatra, Secretaria) */
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                        <div className="flex items-center gap-3 text-brand-600 mb-2">
                          <Mail className="w-5 h-5" />
                          <span className="font-black text-xs uppercase tracking-wider">Correo Corporativo</span>
                        </div>
                        <p className="text-brand-900 font-bold text-lg">{user.email}</p>
                      </div>

                      <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                        <div className="flex items-center gap-3 text-brand-600 mb-2">
                          <Phone className="w-5 h-5" />
                          <span className="font-black text-xs uppercase tracking-wider">Teléfono de Contacto</span>
                        </div>
                        {editing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9+\- ]/g, '') })}
                            className="w-full bg-white border-2 border-brand-200 rounded-xl px-4 py-2.5 font-bold text-brand-900 outline-none focus:border-brand-400 transition-all"
                          />
                        ) : (
                          <p className="text-brand-900 font-bold text-lg">{form.phone || 'No registrado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-brand-50 p-6 rounded-3xl border border-brand-100">
                      <div className="flex items-center gap-3 text-brand-600 mb-3">
                        <FileText className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-wider">Biografía Profesional</span>
                      </div>
                      {editing ? (
                        <textarea
                          value={form.bio}
                          onChange={e => setForm({ ...form, bio: e.target.value })}
                          rows={3}
                          placeholder="Escribe tus detalles como especialista..."
                          className="w-full bg-white border-2 border-brand-200 rounded-xl px-4 py-3 font-bold text-brand-900 outline-none focus:border-brand-400 transition-all resize-none"
                        />
                      ) : (
                        <p className="text-brand-700 font-medium leading-relaxed">{form.bio || 'Sin biografía registrada.'}</p>
                      )}
                    </div>
                  </>
                )}

                {editing && (
                  <div className="flex gap-4 mt-4">
                    <button onClick={handleCancel} className="flex-1 flex justify-center gap-2 bg-nut-100 text-nut-700 py-4 rounded-2xl font-black uppercase text-xs hover:bg-nut-200 transition-all"><X className="w-4 h-4"/> Cancelar</button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 flex justify-center gap-2 bg-brand-800 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-brand-700 transition-all shadow-xl disabled:opacity-60">
                      {saving ? 'Guardando...' : <><Save className="w-4 h-4"/> Guardar Cambios</>}
                    </button>
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA: NOTIFICACIONES */}
              <div className="lg:col-span-1">
                <div className="bg-brand-50 rounded-[2.5rem] p-6 border border-brand-100 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-500 rounded-full text-white">
                      <Bell className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-brand-950 text-lg">Notificaciones</h3>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {notifications.length === 0 ? (
                      <p className="text-brand-400 font-bold text-sm text-center italic py-4">No tienes notificaciones recientes.</p>
                    ) : notifications.map(notif => (
                      <div key={notif.id} className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.is_read ? 'bg-white border-brand-100 opacity-60' : 'bg-brand-100 border-brand-300 shadow-sm'}`} onClick={() => !notif.is_read && markAsRead(notif.id)}>
                        <p className="text-xs text-brand-900 font-bold">{notif.message}</p>
                        <p className="text-[10px] text-brand-500 mt-2 font-black uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
