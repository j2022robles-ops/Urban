import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../data/products';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isFavorite, toggleFavorite, navigate } = useStore();
  const fav = isFavorite(product.slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/producto/${product.slug}`);
  };

  return (
    <article className="product-card group relative bg-white border border-[#deded6] rounded-none overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
      {/* Top Image area */}
      <div className="relative aspect-square overflow-hidden bg-[#faf9f6]">
        <a href={`/producto/${product.slug}`} onClick={handleClick} className="block w-full h-full">
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            loading="lazy"
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        </a>

        {/* Labels / Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none">
          {product.etiquetas.map((tag) => (
            <span
              key={tag}
              className="bg-[#0047ff] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider shadow-sm"
            >
              {tag}
            </span>
          ))}
          <span className="bg-[#efe6d6] text-[#0d0d0d] text-[10px] font-medium px-2 py-0.5 tracking-wider uppercase border border-[#deded6]">
            {product.linea}
          </span>
        </div>

        {/* Favorite toggle button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.slug);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            fav ? 'bg-red-50 text-red-600' : 'bg-white/80 hover:bg-white text-[#0d0d0d]'
          } shadow-sm`}
          aria-label={fav ? `Quitar de favoritos: ${product.nombre}` : `Añadir a favoritos: ${product.nombre}`}
          title={fav ? 'Quitar de favoritos' : 'Guardar prenda'}
        >
          <Heart size={18} className={fav ? 'fill-red-600 text-red-600' : ''} />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#6b6b66] mb-1">
            <span className="font-mono uppercase">{product.publico}</span>
            <span className="text-[11px] truncate max-w-[140px]">{product.colores.join(', ')}</span>
          </div>

          <a href={`/producto/${product.slug}`} onClick={handleClick} className="block">
            <h3 className="font-bold text-[#0d0d0d] text-base leading-snug group-hover:text-[#0047ff] transition-colors">
              {product.nombre}
            </h3>
          </a>

          <p className="text-xs text-[#6b6b66] mt-1 line-clamp-1 italic">
            {product.composicion}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#deded6] flex items-center justify-between">
          <div>
            <span className="text-lg font-extrabold text-[#0d0d0d]">{formatPrice(product.precio)}</span>
            {product.stock <= 5 && (
              <span className="block text-[10px] text-amber-700 font-medium">¡Últimas {product.stock} unidades!</span>
            )}
          </div>

          <a
            href={`/producto/${product.slug}`}
            onClick={handleClick}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0047ff] group-hover:translate-x-1 transition-transform"
          >
            Ver prenda <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
};
