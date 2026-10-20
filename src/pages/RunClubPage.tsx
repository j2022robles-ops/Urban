import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle, MapPin, Clock, Users, Flame, HeartHandshake } from 'lucide-react';
import { getWhatsAppLink } from '../data/products';
import { useStore } from '../context/StoreContext';

export const RunClubPage: React.FC = () => {
  const { notify } = useStore();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), nombre: nombre.trim(), type: 'run-club' }),
      });
      setRegistered(true);
      notify('¡Te has sumado al Run Club! Te contactaremos antes del próximo sábado.');
    } catch {
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="run-club-page">
      {/* Club Hero */}
      <section className="club-hero relative min-h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="/images/comunidad.webp"
          alt="Comunidad deportiva Urban Vibe en Arequipa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />

        <div className="container relative z-10 text-white py-16">
          <span className="eyebrow inline-block bg-[#0047ff] text-white px-3 py-1 font-bold text-xs uppercase tracking-widest mb-4">
            URBAN VIBE RUN CLUB
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
            Misti
            <br />
            <em>al amanecer.</em>
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-lg mb-8 leading-relaxed">
            Hay kilómetros que se disfrutan más en compañía. Entrenar a 2 335 m s. n. m. fortalece el cuerpo y une
            a la comunidad.
          </p>
          <a className="button button-white inline-flex items-center gap-2" href="#unete">
            Únete al movimiento <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

      {/* Club Details */}
      <section className="container club-content section py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div>
          <span className="eyebrow blue">EL RITMO LO PONEMOS JUNTOS</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">Nos mueve la misma energía.</h2>
          <p className="text-sm text-[#6b6b66] leading-relaxed mb-4">
            El Run Club de ALTURA 2335 propone encuentros en la campiña arequipeña los sábados a las 6:30 a. m. Un
            espacio para compartir la ruta, adaptar la respiración al aire andino y conectar con nuestra
            comunidad.
          </p>
          <p className="text-sm text-[#6b6b66] leading-relaxed mb-6">
            Registra tu interés y consulta por WhatsApp la fecha, el punto de encuentro y la disponibilidad del
            próximo entrenamiento.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-white border border-[#deded6]">
              <div className="flex items-center gap-2 text-[#0047ff] font-bold text-sm mb-1">
                <Clock size={18} /> Horario
              </div>
              <p className="text-xs text-[#6b6b66]">Sábados 6:30 a. m. puntual antes del sol fuerte.</p>
            </div>
            <div className="p-4 bg-white border border-[#deded6]">
              <div className="flex items-center gap-2 text-[#0047ff] font-bold text-sm mb-1">
                <MapPin size={18} /> Rutas
              </div>
              <p className="text-xs text-[#6b6b66]">Mirador de Yanahuara, Chilina y campiña de Cayma.</p>
            </div>
            <div className="p-4 bg-white border border-[#deded6]">
              <div className="flex items-center gap-2 text-[#0047ff] font-bold text-sm mb-1">
                <Users size={18} /> Ritmos
              </div>
              <p className="text-xs text-[#6b6b66]">Grupos de 5k (iniciación), 10k y 15k con pacers.</p>
            </div>
            <div className="p-4 bg-white border border-[#deded6]">
              <div className="flex items-center gap-2 text-[#0047ff] font-bold text-sm mb-1">
                <Flame size={18} /> Beneficios
              </div>
              <p className="text-xs text-[#6b6b66]">20% de descuento continuo en indumentaria para miembros.</p>
            </div>
          </div>

          <a
            className="text-link inline-flex items-center gap-2 text-sm font-bold text-[#0047ff]"
            target="_blank"
            rel="noreferrer"
            href={getWhatsAppLink(
              '¡Hola! Quisiera conocer el próximo encuentro de Misti al amanecer: fecha, punto de encuentro y disponibilidad.'
            )}
          >
            Consultar el próximo encuentro por WhatsApp <ArrowUpRight size={17} />
          </a>
        </div>

        {/* Registration form card */}
        <div className="club-registration bg-white border border-[#deded6] p-8" id="unete">
          <div className="flex items-center gap-2 mb-2 text-[#0047ff]">
            <HeartHandshake size={24} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">CONVOCATORIA ABIERTA</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">Quiero ser parte.</h2>
          <p className="text-xs text-[#6b6b66] mb-6">
            Deja tus datos para registrar tu interés. Las salidas son gratuitas y abiertas a todos los niveles de
            runners.
          </p>

          {registered ? (
            <div className="bg-emerald-50 border border-emerald-300 p-6 text-emerald-900 rounded-none">
              <div className="flex items-center gap-2 font-bold mb-2 text-emerald-700">
                <CheckCircle size={20} /> ¡Registro confirmado!
              </div>
              <p className="text-xs leading-relaxed">
                Te hemos añadido a la lista del Run Club. Te enviaremos el punto exacto de encuentro para este sábado.
                Recuerda usar el cupón <strong>CLUB20</strong> en la tienda.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0d0d0d] mb-1">Tu nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mateo Valdivia"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0d0d0d] mb-1">Correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs"
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="button full justify-center text-xs py-3">
                  {loading ? 'Registrando…' : 'Confirmar mi inscripción gratuita'} <ArrowUpRight size={16} />
                </button>
              </div>

              <p className="text-[10px] text-[#6b6b66] text-center">
                Sin spam. Solo coordenadas, ritmo y avisos de aclimatación.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
