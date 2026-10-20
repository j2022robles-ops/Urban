import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Heart, Truck, ShieldCheck, ArrowRight, ArrowLeft, Ruler, Sparkles, Plus, Minus, MessageCircle } from 'lucide-react';
import { formatPrice, getWhatsAppLink } from '../data/products';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const { products, addToCart, toggleFavorite, isFavorite, navigate } = useStore();
  const product = products.find((p) => p.slug === slug);

  const [selectedColor, setSelectedColor] = useState<string>(product?.colores[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(product?.tallas[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  if (!product) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-extrabold mb-4">Prenda no encontrada</h1>
        <p className="text-[#6b6b66] mb-8">La prenda que buscas no existe o ha cambiado de disponibilidad.</p>
        <button className="button" onClick={() => navigate('/catalogo')}>
          Volver a la colección
        </button>
      </div>
    );
  }

  const fav = isFavorite(product.slug);

  const handleAddToCart = () => {
    addToCart({
      product,
      talla: selectedSize,
      color: selectedColor,
      cantidad: quantity,
    });
  };

  // Related products from the same line or layering
  const relatedProducts = products
    .filter((p) => p.slug !== product.slug && (p.linea === product.linea || p.publico === product.publico))
    .slice(0, 3);

  return (
    <article className="product-page pb-20">
      <div className="container py-6">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-6">
          <a
            href="/catalogo"
            onClick={(e) => {
              e.preventDefault();
              navigate('/catalogo');
            }}
            className="inline-flex items-center gap-1 text-xs text-[#6b6b66] hover:text-[#0047ff]"
          >
            <ArrowLeft size={14} /> Volver a la colección
          </a>
          <span className="mx-2 text-[#deded6]">/</span>
          <span className="text-xs text-[#0d0d0d] font-semibold">{product.nombre}</span>
        </div>

        {/* Main Product Layout */}
        <div className="product-detail grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Photos */}
          <div className="detail-photo relative bg-white border border-[#deded6] overflow-hidden flex items-center justify-center p-8 min-h-[460px]">
            <span className="eyebrow absolute top-4 left-4 bg-[#0047ff] text-white px-2.5 py-1 text-[11px] font-bold">
              {product.linea.toUpperCase()}
            </span>

            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              className="max-h-[420px] w-auto object-contain transition-transform duration-300 hover:scale-105"
            />

            <span className="detail-photo-label absolute bottom-3 left-4 text-[10px] text-[#6b6b66] font-mono uppercase">
              Colección ALTURA 2335 · FIBRAS PERUANAS
            </span>
          </div>

          {/* Details & Selection */}
          <div className="detail-info flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-semibold uppercase text-[#0047ff] tracking-wider">
                  Línea {product.linea} · {product.publico}
                </span>
                {product.etiquetas.map((t) => (
                  <span key={t} className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[#0d0d0d] tracking-tight mb-2">
                {product.nombre}
              </h1>

              <div className="detail-price text-2xl font-black text-[#0d0d0d] mb-4">
                {formatPrice(product.precio)}
                <span className="text-xs font-normal text-[#6b6b66] ml-2">IGV incluido</span>
              </div>

              <div className="p-3 bg-[#efe6d6]/60 border border-[#deded6] rounded-none mb-6">
                <span className="text-[11px] font-bold text-[#0d0d0d] block uppercase tracking-wider mb-1">
                  Composición de fibras
                </span>
                <p className="text-xs text-[#0d0d0d] italic font-medium">{product.composicion}</p>
                <p className="text-xs text-[#6b6b66] mt-2 leading-relaxed">{product.descripcion}</p>
              </div>

              {/* Color selector */}
              <div className="mb-5">
                <div className="selection-heading flex justify-between items-center text-xs font-bold uppercase mb-2">
                  <span>Color: {selectedColor}</span>
                </div>
                <div className="options flex gap-2">
                  {product.colores.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-4 py-2 border text-xs font-semibold transition-all ${
                        selectedColor === col
                          ? 'border-[#0047ff] bg-[#0047ff] text-white shadow-sm'
                          : 'border-[#deded6] bg-white text-[#0d0d0d] hover:border-black'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div className="mb-6">
                <div className="selection-heading flex justify-between items-center text-xs font-bold uppercase mb-2">
                  <span>Talla seleccionada: {selectedSize}</span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-[#0047ff] hover:underline flex items-center gap-1 font-semibold normal-case"
                  >
                    <Ruler size={13} /> Guía de tallas
                  </button>
                </div>
                <div className="options flex flex-wrap gap-2">
                  {product.tallas.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedSize(t)}
                      className={`min-w-12 h-11 border text-xs font-bold transition-all ${
                        selectedSize === t
                          ? 'border-[#0047ff] bg-[#0047ff] text-white'
                          : 'border-[#deded6] bg-white text-[#0d0d0d] hover:border-black'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Actions */}
              <div className="add-row flex items-center gap-3 mb-6">
                <div className="flex items-center border border-[#deded6] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-[#6b6b66] hover:text-[#0d0d0d]"
                    aria-label="Restar"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-4 font-bold text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-[#6b6b66] hover:text-[#0d0d0d]"
                    aria-label="Sumar"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="button flex-1 py-3 text-sm font-bold justify-center"
                >
                  Agregar a la bolsa <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(product.slug)}
                  className={`p-3 border transition-colors ${
                    fav ? 'border-red-500 bg-red-50 text-red-600' : 'border-[#deded6] bg-white hover:bg-neutral-50'
                  }`}
                  aria-label="Guardar en favoritos"
                  title="Guardar en favoritos"
                >
                  <Heart size={20} className={fav ? 'fill-red-600' : ''} />
                </button>
              </div>

              {/* WhatsApp direct advice */}
              <a
                href={getWhatsAppLink(
                  `¡Hola, Urban Vibe! Quisiera consultar sobre disponibilidad y talla de ${product.nombre} (Talla ${selectedSize}, Color ${selectedColor}).`
                )}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-emerald-600 text-emerald-800 bg-emerald-50/50 py-2.5 px-4 text-xs font-bold hover:bg-emerald-100 transition-colors mb-6"
              >
                <MessageCircle size={16} /> Consultar disponibilidad inmediata por WhatsApp
              </a>

              {/* Perks */}
              <div className="detail-perks border-t border-[#deded6] pt-4 grid grid-cols-2 gap-4 text-xs text-[#6b6b66]">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-[#0047ff] shrink-0" />
                  <span>Envío gratis desde S/ 299 en Arequipa y todo Perú</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#0047ff] shrink-0" />
                  <span>Garantía de fibras nobles y cambio sin costo en 7 días</span>
                </div>
              </div>
            </div>

            {/* Technical specs accordion */}
            <div className="mt-8 border-t border-[#deded6] pt-4 space-y-3">
              <details className="cursor-pointer border-b border-[#deded6] pb-3">
                <summary className="font-bold text-xs uppercase tracking-wide text-[#0d0d0d] flex justify-between items-center">
                  <span>Cuidado de las prendas</span>
                  <span className="text-[#0047ff]">+</span>
                </summary>
                <p className="text-xs text-[#6b6b66] mt-2 leading-relaxed">
                  Lavar a máquina en ciclo suave con agua fría. Secar a la sombra sobre superficie plana para
                  preservar la elasticidad del algodón pima y las propiedades térmicas de la alpaca. No usar
                  secadora ni blanqueador.
                </p>
              </details>

              <details className="cursor-pointer border-b border-[#deded6] pb-3">
                <summary className="font-bold text-xs uppercase tracking-wide text-[#0d0d0d] flex justify-between items-center">
                  <span>Origen de producción en Arequipa</span>
                  <span className="text-[#0047ff]">+</span>
                </summary>
                <p className="text-xs text-[#6b6b66] mt-2 leading-relaxed">
                  Confeccionado éticamente en Arequipa, Perú, utilizando hilados certificados de algodón pima de la
                  costa sur y fibra de baby alpaca de pastores del altiplano andino.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#deded6]">
            <div className="section-heading mb-8">
              <div>
                <span className="eyebrow blue">COMPLETA TU RUTA</span>
                <h2 className="text-2xl font-bold">Prendas recomendadas para combinar</h2>
              </div>
            </div>
            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="modal-backdrop" onClick={() => setSizeGuideOpen(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Guía de tallas · Colección ALTURA 2335</h2>
              <button
                className="icon-button"
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Cerrar guía"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#6b6b66] mb-4">
              Medidas corporales en centímetros recomendadas para elegir tu prenda. Las fibras elásticas y el French
              terry tienen ajuste atlético confortable.
            </p>
            <div className="table-wrap">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#efe6d6]">
                  <tr>
                    <th className="p-3">Talla</th>
                    <th className="p-3">Pecho (cm)</th>
                    <th className="p-3">Cintura (cm)</th>
                    <th className="p-3">Cadera (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#deded6]">
                    <td className="p-3 font-bold">XS</td>
                    <td className="p-3">82 – 88</td>
                    <td className="p-3">64 – 70</td>
                    <td className="p-3">88 – 94</td>
                  </tr>
                  <tr className="border-b border-[#deded6]">
                    <td className="p-3 font-bold">S</td>
                    <td className="p-3">88 – 94</td>
                    <td className="p-3">70 – 76</td>
                    <td className="p-3">94 – 100</td>
                  </tr>
                  <tr className="border-b border-[#deded6] bg-[#0047ff]/5">
                    <td className="p-3 font-bold text-[#0047ff]">M (Más común)</td>
                    <td className="p-3">94 – 102</td>
                    <td className="p-3">76 – 84</td>
                    <td className="p-3">100 – 108</td>
                  </tr>
                  <tr className="border-b border-[#deded6]">
                    <td className="p-3 font-bold">L</td>
                    <td className="p-3">102 – 110</td>
                    <td className="p-3">84 – 92</td>
                    <td className="p-3">108 – 116</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">XL</td>
                    <td className="p-3">110 – 118</td>
                    <td className="p-3">92 – 100</td>
                    <td className="p-3">116 – 124</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-[#deded6] flex justify-between items-center">
              <span className="text-[11px] text-[#6b6b66]">
                ¿Tienes dudas con tu talla? Coordinamos el cambio sin costo en Arequipa.
              </span>
              <button
                className="button button-outline text-xs"
                onClick={() => setSizeGuideOpen(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
