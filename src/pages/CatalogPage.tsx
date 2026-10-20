import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, SlidersHorizontal, RotateCcw, ArrowRight } from 'lucide-react';

interface CatalogPageProps {
  favoritesOnly?: boolean;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ favoritesOnly = false }) => {
  const { products, favorites, currentPath, navigate } = useStore();

  // Parse query params
  const searchParams = useMemo(() => {
    const query = currentPath.includes('?') ? currentPath.split('?')[1] : '';
    return new URLSearchParams(query);
  }, [currentPath]);

  const linea = searchParams.get('linea') || '';
  const publico = searchParams.get('publico') || '';
  const q = searchParams.get('q') || '';
  const talla = searchParams.get('talla') || '';
  const maxPrice = searchParams.get('precio') || '';
  const orden = searchParams.get('orden') || 'coleccion';

  const updateParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    const basePath = favoritesOnly ? '/favoritos' : '/catalogo';
    const qs = nextParams.toString();
    navigate(qs ? `${basePath}?${qs}` : basePath);
  };

  const resetFilters = () => {
    navigate(favoritesOnly ? '/favoritos' : '/catalogo');
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (favoritesOnly && !favorites.includes(p.slug)) return false;

        if (linea) {
          if (linea === 'Accesorios') {
            const isAcc = ['gorro-beanie', 'cuello-termico', 'medias-pack'].includes(p.slug);
            if (!isAcc) return false;
          } else if (p.linea !== linea) {
            return false;
          }
        }

        if (publico && p.publico !== publico && p.publico !== 'Unisex') {
          return false;
        }

        if (talla && !p.tallas.includes(talla)) {
          return false;
        }

        if (maxPrice && p.precio > Number(maxPrice)) {
          return false;
        }

        if (q) {
          const queryLower = q.toLowerCase();
          const matchTarget = `${p.nombre} ${p.composicion} ${p.linea} ${p.publico} ${p.descripcion}`.toLowerCase();
          if (!matchTarget.includes(queryLower)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (orden === 'precio-asc') return a.precio - b.precio;
        if (orden === 'precio-desc') return b.precio - a.precio;
        return 0;
      });
  }, [products, favorites, favoritesOnly, linea, publico, talla, maxPrice, q, orden]);

  const lineTabs = [
    { label: 'Todas las líneas', value: '' },
    { label: 'Running', value: 'Running' },
    { label: 'Training', value: 'Training' },
    { label: 'Altura', value: 'Altura' },
    { label: 'Accesorios', value: 'Accesorios' },
  ];

  return (
    <div className="catalog-page">
      {/* Page Banner */}
      <div className="page-banner">
        <div className="container">
          <div className="breadcrumb">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              Inicio
            </a>{' '}
            / {favoritesOnly ? 'Favoritos' : 'Colección ALTURA 2335'}
          </div>
          <span className="eyebrow blue">
            {favoritesOnly ? 'TUS PRENDAS GUARDADAS' : 'ALTURA 2335 · FIBRAS PERUANAS'}
          </span>
          <h1>{favoritesOnly ? 'Tus favoritos.' : 'Tu próxima aventura, vestida.'}</h1>
          <p>
            {favoritesOnly
              ? 'Las prendas que guardaste para no perderles la pista y salir a la cima.'
              : '14 prendas técnicas. Tres líneas. Fibras nobles de algodón pima, baby alpaca y merino para superar tus límites.'}
          </p>
        </div>
      </div>

      <div className="container catalog-section">
        {/* Line Tabs */}
        {!favoritesOnly && (
          <div className="catalog-tabs">
            {lineTabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                className={linea === tab.value ? 'active' : ''}
                onClick={() => updateParam('linea', tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter bar */}
        <div className="filters bg-white p-4 border border-[#deded6] mb-6 flex flex-wrap items-center gap-4">
          {/* Public filter */}
          <label className="flex-1 min-w-[130px]">
            <span className="block text-[11px] font-bold text-[#6b6b66] uppercase mb-1">Público</span>
            <select
              value={publico}
              onChange={(e) => updateParam('publico', e.target.value)}
              className="w-full bg-[#faf9f6] border border-[#deded6] p-2 text-xs font-medium"
            >
              <option value="">Todos (Hombre / Mujer / Unisex)</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
            </select>
          </label>

          {/* Size filter */}
          <label className="w-28">
            <span className="block text-[11px] font-bold text-[#6b6b66] uppercase mb-1">Talla</span>
            <select
              value={talla}
              onChange={(e) => updateParam('talla', e.target.value)}
              className="w-full bg-[#faf9f6] border border-[#deded6] p-2 text-xs font-medium"
            >
              <option value="">Todas</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="Única">Única</option>
            </select>
          </label>

          {/* Max Price */}
          <label className="w-36">
            <span className="block text-[11px] font-bold text-[#6b6b66] uppercase mb-1">
              Precio {maxPrice ? `hasta S/ ${maxPrice}` : 'Máximo'}
            </span>
            <select
              value={maxPrice}
              onChange={(e) => updateParam('precio', e.target.value)}
              className="w-full bg-[#faf9f6] border border-[#deded6] p-2 text-xs font-medium"
            >
              <option value="">Cualquier precio</option>
              <option value="100">Hasta S/ 100</option>
              <option value="150">Hasta S/ 150</option>
              <option value="200">Hasta S/ 200</option>
              <option value="250">Hasta S/ 250</option>
            </select>
          </label>

          {/* Search bar within catalog */}
          <label className="flex-1 min-w-[180px]">
            <span className="block text-[11px] font-bold text-[#6b6b66] uppercase mb-1">Búsqueda rápida</span>
            <input
              type="text"
              placeholder="Filtra por nombre o fibra…"
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
              className="w-full bg-[#faf9f6] border border-[#deded6] p-2 text-xs"
            />
          </label>

          {/* Reset button if active */}
          {(linea || publico || talla || maxPrice || q) && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-end pb-2 text-xs text-[#0047ff] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw size={13} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Results Bar */}
        <div className="results-bar flex items-center justify-between py-2 border-b border-[#deded6] mb-6">
          <span className="text-xs text-[#6b6b66] font-mono">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'PRENDA ENCONTRADA' : 'PRENDAS ENCONTRADAS'}
            {q && ` · Buscando «${q}»`}
          </span>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6b6b66] uppercase font-bold text-[10px]">Ordenar por:</span>
            <select
              value={orden}
              onChange={(e) => updateParam('orden', e.target.value)}
              className="bg-transparent border-0 font-medium text-xs cursor-pointer focus:ring-0"
            >
              <option value="coleccion">Orden de colección</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-20 bg-white border border-[#deded6]">
            {favoritesOnly ? (
              <>
                <Heart size={44} strokeWidth={1.2} className="mx-auto mb-4 text-[#6b6b66]" />
                <h2 className="text-2xl font-bold mb-2">No tienes prendas en favoritos</h2>
                <p className="text-sm text-[#6b6b66] max-w-md mx-auto mb-6">
                  Explora nuestra colección y dale al corazón para guardar las prendas que te acompañarán en tus
                  rutas.
                </p>
                <button
                  className="button"
                  onClick={() => navigate('/catalogo')}
                >
                  Explorar catálogo completo <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <>
                <SlidersHorizontal size={44} strokeWidth={1.2} className="mx-auto mb-4 text-[#6b6b66]" />
                <h2 className="text-2xl font-bold mb-2">No encontramos prendas con esos filtros</h2>
                <p className="text-sm text-[#6b6b66] max-w-md mx-auto mb-6">
                  Prueba ajustando los filtros de público, talla o precio para ver más opciones disponibles.
                </p>
                <button className="button button-outline" onClick={resetFilters}>
                  Mostrar todas las prendas
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
