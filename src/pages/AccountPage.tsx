import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice, getWhatsAppLink } from '../data/products';
import { Order, User } from '../types';
import { LogOut, Heart, Shield, ShoppingBag, ArrowRight, UserCheck, MessageCircle } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, setUser, setAdminToken, adminLogout, favorites, notify, navigate } = useStore();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      fetch('/api/orders')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setOrders(data))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      if (data.adminToken) {
        setAdminToken(data.adminToken);
      }
      setUser(data.user);
      notify(`Bienvenido de vuelta, ${data.user.nombre}`);
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          email: email.trim(),
          password,
          whatsapp: whatsapp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear cuenta');

      setUser(data.user);
      notify('¡Cuenta creada! Tienes 20% de descuento con el cupón CLUB20.');
    } catch (err: any) {
      setError(err.message || 'Error al registrarte');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      setEmail('j2022robles@gmail.com');
      setPassword('ijuhyHgtGgb1');
    } else {
      setEmail('cliente@urbanvibe.pe');
      setPassword('cliente123');
    }
    setAuthMode('login');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    await adminLogout();
    setUser(null);
    notify('Has cerrado sesión.');
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newNombre = String(formData.get('nombre') || '');
    const newWhatsapp = String(formData.get('whatsapp') || '');

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newNombre, whatsapp: newWhatsapp }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        notify('Tus datos se actualizaron correctamente.');
      }
    } catch {
      notify('Error al actualizar datos.');
    }
  };

  // If NOT logged in: show Auth Form
  if (!user) {
    return (
      <section className="container auth-section py-16 max-w-md">
        <div className="auth-card bg-white border border-[#deded6] p-8">
          <div className="flex border-b border-[#deded6] mb-6">
            <button
              type="button"
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                authMode === 'login' ? 'border-[#0047ff] text-[#0047ff]' : 'border-transparent text-[#6b6b66]'
              }`}
              onClick={() => setAuthMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                authMode === 'register' ? 'border-[#0047ff] text-[#0047ff]' : 'border-transparent text-[#6b6b66]'
              }`}
              onClick={() => setAuthMode('register')}
            >
              Registrarse en el Club
            </button>
          </div>

          <h1 className="text-2xl font-extrabold mb-2">
            {authMode === 'login' ? 'Bienvenido a Urban Vibe' : 'Únete al Club Altura'}
          </h1>
          <p className="text-xs text-[#6b6b66] mb-6">
            {authMode === 'login'
              ? 'Accede a tu historial de pedidos y aprovecha tus beneficios del club.'
              : 'Regístrate y recibe 20% de descuento en tu primera compra con el cupón CLUB20.'}
          </p>

          {error && <div className="bg-red-50 text-red-600 p-3 text-xs border border-red-200 mb-4">{error}</div>}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d0d0d] mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d0d0d] mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="button full justify-center text-xs py-3 font-bold uppercase tracking-wider"
              >
                {loading ? 'Ingresando…' : 'Entrar a mi cuenta'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d0d0d] mb-1">Nombre y Apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rodrigo Mendoza"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d0d0d] mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+51 925 147 306"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d0d0d] mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0d0d0d] mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="button full justify-center text-xs py-3 font-bold uppercase tracking-wider"
              >
                {loading ? 'Creando cuenta…' : 'Crear cuenta y activar 20% OFF'}
              </button>
            </form>
          )}

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-[#deded6]">
            <span className="text-[10px] text-[#6b6b66] uppercase font-bold tracking-widest block mb-2">
              Acceso rápido para prueba:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className="flex-1 py-2 px-2 bg-[#faf9f6] border border-[#deded6] text-[11px] font-semibold text-[#0d0d0d] hover:border-[#0047ff]"
              >
                Cliente Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="flex-1 py-2 px-2 bg-[#faf9f6] border border-[#deded6] text-[11px] font-semibold text-[#0047ff] hover:bg-[#0047ff] hover:text-white"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If LOGGED IN: show Profile and Orders
  return (
    <section className="container account-page py-12">
      <div className="section-heading flex justify-between items-end border-b border-[#deded6] pb-6 mb-8">
        <div>
          <span className="eyebrow blue">MI ESPACIO / CLUB ALTURA</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Hola, {user.nombre.split(' ')[0]}.</h1>
        </div>
        <button
          className="text-button flex items-center gap-1.5 text-xs text-red-600 hover:underline font-semibold"
          onClick={handleLogout}
        >
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>

      <div className="account-layout grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="club-card bg-[#efe6d6] border border-[#deded6] p-6">
            <span className="eyebrow text-[10px] font-mono text-[#0047ff] font-bold block mb-2">
              TU BENEFICIO DEL CLUB
            </span>
            <strong className="text-2xl font-black block leading-tight text-[#0d0d0d] mb-2">
              20 % para tu
              <br />
              próxima aventura.
            </strong>
            <p className="text-xs text-[#6b6b66]">
              Usa el código <b className="text-[#0d0d0d] font-mono">CLUB20</b> en tu bolsa de compras para aplicar el
              descuento exclusivo.
            </p>
          </div>

          <a
            href="/favoritos"
            onClick={(e) => {
              e.preventDefault();
              navigate('/favoritos');
            }}
            className="account-shortcut flex items-center justify-between p-4 bg-white border border-[#deded6] text-xs font-bold text-[#0d0d0d] hover:border-[#0047ff]"
          >
            <span className="flex items-center gap-2">
              <Heart size={18} className="text-[#0047ff]" /> Mis prendas favoritas
            </span>
            <span className="bg-[#0047ff] text-white text-[10px] px-2 py-0.5 rounded-full">
              {favorites.length}
            </span>
          </a>

          {user.role === 'admin' && (
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin');
              }}
              className="button full justify-center bg-[#0d0d0d] text-white py-3 text-xs font-bold flex items-center gap-2"
            >
              <Shield size={16} /> Panel de Administración y Base de Datos
            </a>
          )}

          {/* Edit Profile Form */}
          <form onSubmit={handleUpdateProfile} className="profile-form bg-white border border-[#deded6] p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <UserCheck size={18} className="text-[#0047ff]" /> Mis datos personales
            </h2>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-[#6b6b66] mb-1 font-semibold">Nombre y Apellidos</label>
                <input
                  name="nombre"
                  defaultValue={user.nombre}
                  required
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                />
              </div>

              <div>
                <label className="block text-[#6b6b66] mb-1 font-semibold">WhatsApp</label>
                <input
                  name="whatsapp"
                  type="tel"
                  defaultValue={user.whatsapp}
                  required
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                />
              </div>

              <div>
                <label className="block text-[#6b6b66] mb-1 font-semibold">Correo registrado</label>
                <input
                  disabled
                  value={user.email}
                  className="w-full bg-neutral-100 border border-[#deded6] p-2.5 text-[#6b6b66]"
                />
              </div>
            </div>

            <button type="submit" className="button button-outline full justify-center text-xs py-2.5 font-bold">
              Guardar cambios
            </button>
          </form>
        </aside>

        {/* Orders list */}
        <div className="lg:col-span-8">
          <h2 className="text-xl font-bold mb-4">Mis pedidos registrados</h2>

          {ordersLoading ? (
            <div className="p-8 text-center text-xs text-[#6b6b66]">Cargando historial de pedidos…</div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((o) => (
                <article key={o.id} className="order-card bg-white border border-[#deded6] p-6">
                  <div className="flex justify-between items-center pb-3 border-b border-[#deded6] mb-3">
                    <div>
                      <strong className="text-base font-mono font-bold text-[#0047ff]">{o.id}</strong>
                      <span className="text-xs text-[#6b6b66] ml-3">
                        {new Date(o.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 font-bold uppercase">
                      {o.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4 text-xs">
                    {o.items.map((i, idx) => (
                      <p key={idx} className="flex justify-between">
                        <span>
                          {i.cantidad} × {i.nombre} ({i.talla} / {i.color})
                        </span>
                        <span className="font-mono">{formatPrice(i.precio * i.cantidad)}</span>
                      </p>
                    ))}
                  </div>

                  <div className="border-t border-[#deded6] pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[#6b6b66]">Total del pedido: </span>
                      <strong className="text-sm font-bold text-[#0d0d0d]">{formatPrice(o.total)}</strong>
                    </div>

                    <a
                      className="text-link flex items-center gap-1 text-[#0047ff] font-bold"
                      href={getWhatsAppLink(
                        `¡Hola, Urban Vibe! Quisiera consultar el estado de mi pedido ${o.id} a nombre de ${o.customer.nombre}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle size={14} /> Consultar por WhatsApp
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state bg-white border border-[#deded6] p-12 text-center">
              <ShoppingBag size={45} strokeWidth={1.2} className="mx-auto mb-4 text-[#6b6b66]" />
              <h3 className="text-lg font-bold mb-2">Aquí empieza tu historia</h3>
              <p className="text-xs text-[#6b6b66] max-w-sm mx-auto mb-6">
                Cuando hagas un pedido con tu sesión iniciada, aparecerá aquí con seguimiento y acceso directo a
                WhatsApp.
              </p>
              <button
                className="button inline-flex items-center gap-1.5 text-xs"
                onClick={() => navigate('/catalogo')}
              >
                Descubrir colección <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
