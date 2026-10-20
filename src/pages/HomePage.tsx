import React, { useState } from 'react';
import { ArrowUpRight, Play, Mountain, ShieldCheck, Truck, Sparkles, X, CheckCircle, Download } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { formatPrice } from '../data/products';

export const HomePage: React.FC = () => {
  const { products, addToCart, setCoupon, setCartOpen, notify, navigate } = useStore();
  const [videoOpen, setVideoOpen] = useState(false);
  const [packSize, setPackSize] = useState('M');
  const [emailLead, setEmailLead] = useState('');
  const [leadDownloaded, setLeadDownloaded] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // 3-layers bundle products: Polo Misti, Hoodie Heavyweight, Casaca Cortaviento
  const layerSlugs = ['polo-misti', 'hoodie-heavyweight', 'casaca-cortaviento'];
  const layerProducts = layerSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  const packFullPrice = layerProducts.reduce((sum, p) => sum + (p?.precio || 0), 0);
  const packDiscountedPrice = Math.round(packFullPrice * 0.9 * 100) / 100;

  const handleAddPack = () => {
    if (layerProducts.length < 3) return;
    layerProducts.forEach((p) => {
      if (p) {
        addToCart({
          product: p,
          talla: packSize,
          color: p.colores[0],
          cantidad: 1,
        });
      }
    });
    setCoupon('CAPAS10');
    setCartOpen(true);
    notify('¡Conjunto de 3 capas agregado con 10% de descuento!');
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLead.trim()) return;
    setLeadLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLead.trim(), type: 'guide' }),
      });
      setLeadDownloaded(true);
      // Trigger download of guide.pdf
      const link = document.createElement('a');
      link.href = '/guide.pdf';
      link.download = 'UrbanVibe-Guia-Entrena-2335m.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notify('¡Guía descargada! Te hemos enviado también una copia.');
    } catch {
      setLeadDownloaded(true);
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> NUEVA COLECCIÓN · ALTURA 2335
          </span>
          <h1>
            ENTRENA
            <br />
            A TU <em>ALTURA.</em>
          </h1>
          <p>
            Fibras peruanas. Espíritu imparable.
            <br />
            Diseñadas para moverte entre el frío del amanecer y tu próxima cima.
          </p>
          <a
            href="/catalogo"
            onClick={(e) => {
              e.preventDefault();
              navigate('/catalogo');
            }}
            className="button hero-cta"
          >
            Descubre la colección <ArrowUpRight size={21} />
          </a>
          <div className="hero-foot">
            <span>
              <strong>2 335</strong> METROS DE INSPIRACIÓN
            </span>
            <button type="button" onClick={() => setVideoOpen(true)}>
              <span className="play-circle">
                <Play size={14} fill="currentColor" />
              </span>{' '}
              Siente la altura
            </button>
          </div>
        </div>

        <div className="hero-media">
          <img
            src="/images/hero.webp"
            alt="Runner con la colección ALTURA 2335 frente al Misti, Arequipa"
            loading="eager"
            width="800"
            height="800"
          />
          <span className="image-coordinate">AREQUIPA, PERÚ · 2 335 M S. N. M.</span>
          <div className="hero-stamp">
            <Mountain size={32} />
            <span>
              NACIMOS
              <br />
              PARA SUBIR.
            </span>
            <Sparkles size={26} />
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="ticker" aria-hidden="true">
        <span>ALGODÓN PIMA</span>
        <span>↗</span>
        <span>BABY ALPACA</span>
        <span>↗</span>
        <span>MERINO</span>
        <span>↗</span>
        <span>ESPÍRITU AREQUIPEÑO</span>
        <span>↗</span>
        <span>ALTURA 2335</span>
        <span>↗</span>
        <span>ALGODÓN PIMA</span>
        <span>↗</span>
        <span>BABY ALPACA</span>
        <span>↗</span>
        <span>MERINO</span>
        <span>↗</span>
        <span>ALTURA 2335</span>
      </div>

      {/* Benefits */}
      <div className="container benefits">
        <div>
          <ShieldCheck size={28} className="text-[#0047ff]" />
          <span>
            Fibras de origen peruano
            <small>Suavidad que se siente.</small>
          </span>
        </div>
        <div>
          <Mountain size={28} className="text-[#0047ff]" />
          <span>
            Pensado para la altura
            <small>Del amanecer a la cima.</small>
          </span>
        </div>
        <div>
          <Truck size={28} className="text-[#0047ff]" />
          <span>
            Envíos en Arequipa y Perú
            <small>Gratis desde S/ 299.</small>
          </span>
        </div>
      </div>

      {/* Featured Essentials Showcase */}
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">TUS PRÓXIMOS ESENCIALES</span>
            <h2>El movimiento empieza aquí.</h2>
          </div>
          <a
            href="/catalogo"
            onClick={(e) => {
              e.preventDefault();
              navigate('/catalogo');
            }}
            className="text-link"
          >
            Ver las 14 prendas <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="product-grid">
          {[0, 3, 6, 9].map((idx) => {
            const product = products[idx];
            return product ? <ProductCard key={product.slug} product={product} /> : null;
          })}
        </div>
      </section>

      {/* Category Grid */}
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">ENCUENTRA TU RITMO</span>
            <h2>Una colección. Tu manera de moverte.</h2>
          </div>
        </div>

        <div className="category-grid">
          {[
            {
              title: 'Running',
              desc: 'Para ir un kilómetro más.',
              img: '/images/hero.webp',
              number: '01',
              link: '/catalogo?linea=Running',
            },
            {
              title: 'Training',
              desc: 'Tu mejor versión, cada día.',
              img: '/images/training.webp',
              number: '02',
              link: '/catalogo?linea=Training',
            },
            {
              title: 'Altura',
              desc: 'La cima te está esperando.',
              img: '/images/trekking.webp',
              number: '03',
              link: '/catalogo?linea=Altura',
            },
          ].map((cat) => (
            <a
              key={cat.title}
              href={cat.link}
              onClick={(e) => {
                e.preventDefault();
                navigate(cat.link);
              }}
              className="category-card"
            >
              <img src={cat.img} alt={`Look ${cat.title} de la colección`} loading="lazy" />
              <span className="category-number">
                {cat.number} / {cat.title.toUpperCase()}
              </span>
              <div>
                <h3>{cat.title}</h3>
                <p>{cat.desc}</p>
              </div>
              <span className="round-arrow">
                <ArrowUpRight size={18} />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Sistema de Tres Capas */}
      <section className="layers-section" id="sistema-capas">
        <div className="container layers-layout">
          <div className="layers-intro">
            <span className="eyebrow blue">MENOS EXCUSAS. MÁS CAPAS.</span>
            <h2>
              El clima cambia.
              <br />
              <em>Tu ritmo sigue.</em>
            </h2>
            <p>
              Una base suave, una capa que abriga y un exterior para salir. Arma tu sistema de tres capas con
              fibras peruanas y prepárate para cualquier ruta.
            </p>
            <div className="pack-price">
              <strong>{formatPrice(packDiscountedPrice)}</strong>
              <del>{formatPrice(packFullPrice)}</del>
              <span>−10 % EN EL CONJUNTO</span>
            </div>
            <div className="pack-actions">
              <label htmlFor="pack-size" className="sr-only">
                Talla del conjunto
              </label>
              <select
                id="pack-size"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
              >
                {['S', 'M', 'L', 'XL'].map((s) => (
                  <option key={s} value={s}>
                    Talla {s}
                  </option>
                ))}
              </select>
              <button className="button" onClick={handleAddPack}>
                Arma tu conjunto <ArrowUpRight size={18} />
              </button>
            </div>
            <a
              href="/guia-de-tallas"
              onClick={(e) => {
                e.preventDefault();
                navigate('/guia-de-tallas');
              }}
              className="small text-link mt-3 inline-block"
            >
              Encuentra tu talla recomendada
            </a>
          </div>

          <div className="layers-products">
            {layerProducts.map((prod, i) =>
              prod ? (
                <a
                  key={prod.slug}
                  href={`/producto/${prod.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/producto/${prod.slug}`);
                  }}
                >
                  <span className="layer-label">
                    0{i + 1} / {['BASE', 'MEDIA', 'EXTERIOR'][i]}
                  </span>
                  <img src={prod.imagenes[0]} alt={prod.nombre} loading="lazy" />
                  <h3>{prod.nombre}</h3>
                  <p>
                    {
                      ['Respira y acompaña tu ritmo.', 'Abriga tu movimiento con French terry.', 'Completa tu protección contra el viento.'][i]
                    }
                  </p>
                </a>
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* Story teaser */}
      <section className="story-section container section">
        <div className="story-image">
          <img
            src="/images/comunidad.webp"
            alt="Comunidad Urban Vibe en Arequipa con el Misti al fondo"
            loading="lazy"
          />
          <span className="story-label">NUESTRA TIERRA. NUESTRA ENERGÍA.</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow blue">DE AREQUIPA, CON ALTURA</span>
          <h2>
            No es solo
            <br />
            dónde entrenas.
            <br />
            <em>Es lo que te mueve.</em>
          </h2>
          <p>
            Creemos en las mañanas que empiezan temprano, en el valor de nuestras fibras nobles peruanas y en
            las ganas de llegar un poco más lejos. ALTURA 2335 nace de esa forma de vivir.
          </p>
          <a
            href="/nosotros"
            onClick={(e) => {
              e.preventDefault();
              navigate('/nosotros');
            }}
            className="text-link"
          >
            Conoce nuestra historia <ArrowUpRight size={18} />
          </a>
          <a
            href="/run-club"
            onClick={(e) => {
              e.preventDefault();
              navigate('/run-club');
            }}
            className="club-mini"
          >
            <span>
              ÚNETE AL MOVIMIENTO
              <strong>Misti al amanecer · Run Club</strong>
            </span>
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

      {/* Altitude Training Guide lead capture */}
      <section className="guide-section">
        <div className="container guide-layout">
          <div>
            <span className="eyebrow">TU PRÓXIMO PASO EMPIEZA AQUÍ</span>
            <h2>
              Más altura.
              <br />
              Más comunidad.
            </h2>
            <p>
              Descarga gratis nuestra guía «Entrena a 2 335 m».
              <br />
              Capas, cuidado de fibras nobles y hábitos para tus rutas en altitud.
            </p>
          </div>
          <div>
            {leadDownloaded ? (
              <div className="bg-white/10 p-6 rounded text-white flex items-center gap-3">
                <CheckCircle size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">¡Guía descargada exitosamente!</h3>
                  <p className="text-xs text-white/80 mt-1">Revisa tu carpeta de descargas o vuelve a descargarla cuando gustes.</p>
                  <a href="/guide.pdf" download className="mt-2 inline-flex items-center gap-1 text-xs underline font-bold text-white">
                    <Download size={14} /> Descargar de nuevo
                  </a>
                </div>
              </div>
            ) : (
              <form className="guide-form" onSubmit={handleLeadSubmit}>
                <div className="inline-input">
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico"
                    value={emailLead}
                    onChange={(e) => setEmailLead(e.target.value)}
                  />
                  <button type="submit" className="button" disabled={leadLoading}>
                    {leadLoading ? 'Enviando…' : 'Descargar guía gratis'} <ArrowUpRight size={16} />
                  </button>
                </div>
                <label className="checkbox-label flex items-center gap-2 text-white/80 text-[10px] mt-2">
                  <input type="checkbox" defaultChecked required />
                  <span>Acepto recibir novedades y convocatorias del Run Club ALTURA 2335.</span>
                </label>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {videoOpen && (
        <div className="modal-backdrop" onClick={() => setVideoOpen(false)}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Siente la altura · ALTURA 2335</h2>
              <button
                className="icon-button"
                onClick={() => setVideoOpen(false)}
                aria-label="Cerrar video"
              >
                <X size={22} />
              </button>
            </div>
            <div className="aspect-video bg-black rounded overflow-hidden">
              <video
                className="w-full h-full object-contain campaign-video"
                src="/video.mp4"
                controls
                autoPlay
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
