import React, { useState } from 'react';
import { Mountain, Search, Heart, User as UserIcon, ShoppingBag, Menu, X, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  onOpenVideo?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { cart, favorites, user, setCartOpen, currentPath, navigate } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const navLinks = [
    { label: 'Colección', href: '/catalogo' },
    { label: 'Hombre', href: '/catalogo?publico=Hombre' },
    { label: 'Mujer', href: '/catalogo?publico=Mujer' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Run Club', href: '/run-club' },
    { label: 'Nosotros', href: '/nosotros' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement">
        HECHO PARA LA ALTURA. HECHO PARA TI.{' '}
        <span>
          Envío gratis desde S/ 299 <Truck size={14} className="inline ml-1 mb-0.5" />
        </span>
      </div>

      {/* Main Header */}
      <header className="site-header">
        <div className="header-inner">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="brand"
            aria-label="Urban Vibe Sport, inicio"
          >
            <span className="logo-mark">
              <Mountain size={25} strokeWidth={2.7} />
            </span>
            <span className="logo-name">
              URBAN VIBE<small>SPORT · AREQUIPA</small>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.href);
                  }}
                  className={isActive ? 'active' : ''}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Buscar productos"
              onClick={() => setSearchOpen(true)}
              title="Buscar"
            >
              <Search size={21} />
            </button>

            <a
              href="/favoritos"
              onClick={(e) => {
                e.preventDefault();
                navigate('/favoritos');
              }}
              className="icon-button favorite-header relative"
              aria-label="Mis favoritos"
              title="Favoritos"
            >
              <Heart size={21} className={favorites.length > 0 ? 'fill-[#0047ff] text-[#0047ff]' : ''} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0047ff] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </a>

            <a
              href="/cuenta"
              onClick={(e) => {
                e.preventDefault();
                navigate('/cuenta');
              }}
              className="icon-button account-header"
              aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'}
              title={user ? `Cuenta: ${user.nombre}` : 'Mi cuenta'}
            >
              <UserIcon size={21} className={user ? 'text-[#0047ff]' : ''} />
            </a>

            <button
              className="icon-button bag-button"
              aria-label="Abrir carrito"
              onClick={() => setCartOpen(true)}
              title="Tu bolsa"
            >
              <ShoppingBag size={21} />
              <span className="bag-count">{totalItems}</span>
            </button>

            <button
              className="icon-button mobile-toggle"
              aria-label="Abrir menú"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="modal-backdrop is-side" onClick={() => setMobileMenuOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Explora Urban Vibe</h2>
              <button
                className="icon-button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="mobile-nav">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.href);
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                  <ArrowRight size={18} />
                </a>
              ))}
              <a
                href="/favoritos"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/favoritos');
                  setMobileMenuOpen(false);
                }}
              >
                Favoritos ({favorites.length})
                <ArrowRight size={18} />
              </a>
              <a
                href="/cuenta"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/cuenta');
                  setMobileMenuOpen(false);
                }}
              >
                {user ? `Mi cuenta (${user.nombre.split(' ')[0]})` : 'Iniciar sesión / Mi cuenta'}
                <ArrowRight size={18} />
              </a>
              {user?.role === 'admin' && (
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin');
                    setMobileMenuOpen(false);
                  }}
                  className="text-[#0047ff] font-semibold"
                >
                  Panel de Administración
                  <ArrowRight size={18} />
                </a>
              )}
            </nav>
            <div className="mt-8 border-t border-[#deded6] pt-6">
              <p className="text-xs text-[#6b6b66] uppercase tracking-widest font-mono">
                16°23′ S / 71°32′ O · AREQUIPA
              </p>
              <p className="text-xs text-[#6b6b66] mt-1">Fibras peruanas. Espíritu arequipeño.</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Encuentra tu próxima prenda</h2>
              <button
                className="icon-button"
                onClick={() => setSearchOpen(false)}
                aria-label="Cerrar búsqueda"
              >
                <X size={22} />
              </button>
            </div>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <label htmlFor="site-search" className="block text-sm text-[#6b6b66] mb-2 font-medium">
                ¿Qué estás buscando?
              </label>
              <div className="inline-input">
                <input
                  autoFocus
                  id="site-search"
                  placeholder="Prueba «alpaca», «merino», «running» o «legging»"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="button" type="submit">
                  <Search size={18} /> Buscar
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-[#6b6b66]">Sugerencias:</span>
              {['Baby alpaca', 'Hoodie', 'Running', 'Merino', 'Misti', 'Casaca'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    navigate(`/catalogo?q=${encodeURIComponent(term)}`);
                    setSearchOpen(false);
                  }}
                  className="px-2.5 py-1 bg-[#efe6d6] text-[#0d0d0d] rounded hover:bg-[#0047ff] hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
