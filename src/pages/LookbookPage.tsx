import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight, ArrowRight, Download, CheckCircle } from 'lucide-react';

export const LookbookPage: React.FC = () => {
  const { navigate } = useStore();
  const [emailLead, setEmailLead] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const looks = [
    {
      title: 'Runner de campiña',
      img: '/images/hero.webp',
      line: 'Running',
      desc: 'Polo Misti, short y malla. La campiña de Yanahuara y Cayma marca el ritmo.',
    },
    {
      title: 'Training urbano',
      img: '/images/training.webp',
      line: 'Training',
      desc: 'Top deportivo y legging 7/8 de algodón orgánico para moverte a tu manera.',
    },
    {
      title: 'De camino al gym',
      img: '/images/gym.webp',
      line: 'Training',
      desc: 'French terry heavyweight y un fit relajado para el frío de primera hora.',
    },
    {
      title: 'Exploradora de altura',
      img: '/images/trekking.webp',
      line: 'Altura',
      desc: 'Capas térmicas de baby alpaca que acompañan tus rutas hacia el Misti y Chachani.',
    },
    {
      title: 'Después de entrenar',
      img: '/images/athleisure.webp',
      line: 'Training',
      desc: 'El movimiento continúa, incluso sin prisa. Caída suave de algodón pima.',
    },
    {
      title: 'Espíritu de montaña',
      img: '/images/altura.webp',
      line: 'Altura',
      desc: 'Alpaca y merino seleccionados para ir un paso más lejos con abrigo ligero.',
    },
  ];

  const campaignCards = [
    { title: 'Capa base · Running', img: '/campana/1.webp' },
    { title: 'Capa media · Training', img: '/campana/2.webp' },
    { title: 'Capa exterior · Trekking', img: '/campana/3.webp' },
    { title: 'French terry · Gym', img: '/campana/4.webp' },
    { title: 'Guía · Entrena a 2 335 m', img: '/campana/5.webp' },
  ];

  const handleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLead.trim()) return;
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLead.trim(), type: 'guide' }),
      });
      setDownloaded(true);
      const link = document.createElement('a');
      link.href = '/guide.pdf';
      link.download = 'UrbanVibe-Guia-Entrena-2335m.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setDownloaded(true);
    }
  };

  return (
    <div className="container section py-12">
      {/* Lookbook Heading */}
      <div className="section-heading mb-10">
        <div>
          <span className="eyebrow blue">ALTURA 2335 / LOOKBOOK</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 mb-3">
            Seis looks.
            <br />
            Infinitas maneras de moverte.
          </h1>
          <p className="muted text-sm max-w-xl">
            Tres miradas de hombre y tres de mujer, conectadas por nuestra tierra, la campiña arequipeña y las
            alturas del volcán Misti.
          </p>
        </div>
      </div>

      {/* Lookbook 6 items grid */}
      <div className="lookbook-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {looks.map((look, i) => (
          <article key={look.title} className="flex flex-col justify-between bg-white border border-[#deded6] p-4">
            <a
              href={`/catalogo?linea=${look.line}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/catalogo?linea=${look.line}`);
              }}
              className="lookbook-photo relative block aspect-[3/4] overflow-hidden bg-[#faf9f6] mb-4 group"
            >
              <img
                src={look.img}
                alt={look.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute bottom-3 left-3 bg-[#0d0d0d] text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                LOOK 0{i + 1} <ArrowUpRight size={14} />
              </span>
            </a>

            <div>
              <span className="text-[10px] font-mono uppercase text-[#0047ff] tracking-widest block mb-1">
                LÍNEA {look.line.toUpperCase()}
              </span>
              <h2 className="text-xl font-bold mb-2">{look.title}</h2>
              <p className="muted text-xs leading-relaxed mb-4">{look.desc}</p>
            </div>

            <a
              className="text-link inline-flex items-center gap-1 text-xs font-bold text-[#0047ff] pt-2 border-t border-[#deded6]"
              href={`/catalogo?linea=${look.line}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/catalogo?linea=${look.line}`);
              }}
            >
              Explorar línea {look.line} <ArrowRight size={15} />
            </a>
          </article>
        ))}
      </div>

      {/* Campaign Section */}
      <section className="campaign-section bg-[#efe6d6] p-8 md:p-12 border border-[#deded6]">
        <div className="section-heading mb-8">
          <div>
            <span className="eyebrow blue">SISTEMA DE TRES CAPAS / LA CAMPAÑA</span>
            <h2 className="text-3xl font-extrabold mt-2">Prepárate para cada parte del día.</h2>
          </div>
        </div>

        {/* Campaign gallery cards */}
        <div
          className="campaign-gallery flex gap-4 overflow-x-auto pb-4 mb-10"
          tabIndex={0}
          role="region"
          aria-label="Carrusel de tarjetas de la campaña"
        >
          {campaignCards.map((c) => (
            <div
              key={c.title}
              className="shrink-0 w-60 bg-white border border-[#deded6] overflow-hidden rounded-none shadow-sm"
            >
              <img src={c.img} alt={c.title} loading="lazy" className="w-full h-72 object-cover" />
              <div className="p-3">
                <span className="text-xs font-bold text-[#0d0d0d] block">{c.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Campaign Guide form */}
        <div className="campaign-guide bg-white border border-[#deded6] p-6 max-w-xl">
          <h2 className="text-xl font-bold mb-2">Tu guía para dar el siguiente paso en altitud.</h2>
          <p className="text-xs text-[#6b6b66] mb-4">
            Aprende a combinar fibras transpirables y capas de abrigo para entrenar a 2 335 metros sobre el nivel del mar.
          </p>

          {downloaded ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 text-xs font-medium border border-emerald-200">
              <CheckCircle size={18} />
              <span>¡Guía descargada! Revisa tus archivos.</span>
            </div>
          ) : (
            <form onSubmit={handleLead} className="inline-input flex gap-2">
              <input
                type="email"
                required
                placeholder="Ingresa tu correo"
                value={emailLead}
                onChange={(e) => setEmailLead(e.target.value)}
                className="flex-1 bg-[#faf9f6] border border-[#deded6] p-2 text-xs"
              />
              <button type="submit" className="button text-xs py-2 px-4 whitespace-nowrap">
                <Download size={14} /> Descargar PDF
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
