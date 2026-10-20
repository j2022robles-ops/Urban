import React from 'react';
import { Mountain, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getWhatsAppLink } from '../data/products';

export const Footer: React.FC = () => {
  const { user, navigate } = useStore();

  const handleLink = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Brand statement */}
        <div>
          <a
            href="/"
            onClick={handleLink('/')}
            className="brand"
            aria-label="Urban Vibe Sport"
          >
            <span className="logo-mark">
              <Mountain size={24} strokeWidth={2.7} />
            </span>
            <span className="logo-name">
              URBAN VIBE<small>SPORT · AREQUIPA</small>
            </span>
          </a>
          <p>
            De la campiña a la cima.
            <br />
            Fibras peruanas para ir más lejos.
          </p>
          <span className="eyebrow block mt-4 text-[10px] tracking-wider text-[#6b6b66] font-mono">
            16°23′ S / 71°32′ O · AREQUIPA, PERÚ
          </span>
        </div>

        {/* Column 1: Explora */}
        <div>
          <h3>Explora</h3>
          <a href="/catalogo" onClick={handleLink('/catalogo')}>
            Colección ALTURA 2335
          </a>
          <a href="/lookbook" onClick={handleLink('/lookbook')}>
            Nuestros looks
          </a>
          <a href="/nosotros" onClick={handleLink('/nosotros')}>
            Nuestra historia
          </a>
          <a href="/run-club" onClick={handleLink('/run-club')}>
            Misti al amanecer
          </a>
        </div>

        {/* Column 2: Estamos para ti */}
        <div>
          <h3>Estamos para ti</h3>
          <a href="/guia-de-tallas" onClick={handleLink('/guia-de-tallas')}>
            Guía de tallas
          </a>
          <a href="/cuidado" onClick={handleLink('/cuidado')}>
            Cuida tus prendas
          </a>
          <a href="/envios" onClick={handleLink('/envios')}>
            Envíos y cambios
          </a>
          <a
            href={getWhatsAppLink('¡Hola! Me gustaría recibir asesoría sobre la colección ALTURA 2335.')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[#0047ff] font-medium"
          >
            Hablemos por WhatsApp <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Column 3: Tu espacio */}
        <div>
          <h3>Tu espacio</h3>
          <a href="/cuenta" onClick={handleLink('/cuenta')}>
            Mi cuenta
          </a>
          <a href="/favoritos" onClick={handleLink('/favoritos')}>
            Mis favoritos
          </a>
          <a href="/contacto" onClick={handleLink('/contacto')}>
            Contacto
          </a>
          <a href="/admin" onClick={handleLink('/admin')}>
            Administración y base de datos
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Urban Vibe Sport. Desde Arequipa, con altura.</span>
        <div>
          <a href="/terminos" onClick={handleLink('/terminos')}>
            Términos
          </a>
          <a href="/privacidad" onClick={handleLink('/privacidad')}>
            Privacidad
          </a>
          <a href="/reclamaciones" onClick={handleLink('/reclamaciones')}>
            Libro de reclamaciones
          </a>
        </div>
      </div>
    </footer>
  );
};
