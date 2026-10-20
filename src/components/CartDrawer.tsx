import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore, getCartItemKey, calculateCartTotals } from '../context/StoreContext';
import { formatPrice } from '../data/products';

export const CartDrawer: React.FC = () => {
  const { cartOpen, setCartOpen, cart, updateQuantity, removeFromCart, coupon, setCoupon, user, navigate } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!cartOpen) return null;

  const totals = calculateCartTotals(cart, coupon, user, 0);
  const remainingForFreeShipping = Math.max(0, 299 - (totals.subtotal - totals.discount));
  const shippingPercent = Math.min(100, ((totals.subtotal - totals.discount) / 299) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!['ALTURA10', 'CLUB20', 'CAPAS10'].includes(code)) {
      setCouponError('Cupón no válido. Prueba con ALTURA10.');
      return;
    }
    if (code === 'CLUB20' && !user) {
      setCouponError('Inicia sesión en Mi Cuenta para usar el cupón CLUB20.');
      return;
    }
    setCoupon(code);
    setCouponError('');
  };

  const totalItemCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="modal-backdrop is-side" onClick={() => setCartOpen(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tu bolsa ({totalItemCount})</h2>
          <button
            className="icon-button"
            onClick={() => setCartOpen(false)}
            aria-label="Cerrar bolsa"
          >
            <X size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state text-center py-16">
            <ShoppingBag size={48} strokeWidth={1.2} className="mx-auto mb-4 text-[#6b6b66]" />
            <h3 className="text-xl font-bold mb-2">Tu bolsa está vacía</h3>
            <p className="text-sm text-[#6b6b66] mb-6">Explora nuestra colección y viste tu próxima ruta.</p>
            <button
              className="button"
              onClick={() => {
                setCartOpen(false);
                navigate('/catalogo');
              }}
            >
              Ver colección ALTURA 2335 <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-80px)] justify-between">
            {/* Free shipping progress */}
            <div className="shipping-progress">
              <p>
                <Truck size={17} />
                {remainingForFreeShipping > 0
                  ? `Te faltan ${formatPrice(remainingForFreeShipping)} para el envío gratis.`
                  : '¡Tu pedido califica para envío gratis!'}
              </p>
              <div>
                <span style={{ width: `${shippingPercent}%` }} />
              </div>
            </div>

            {/* Cart item list */}
            <div className="cart-items overflow-y-auto pr-1 flex-1">
              {cart.map((item) => {
                const itemKey = getCartItemKey(item);
                return (
                  <article key={itemKey} className="cart-item">
                    <a
                      href={`/producto/${item.product.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCartOpen(false);
                        navigate(`/producto/${item.product.slug}`);
                      }}
                    >
                      <img src={item.product.imagenes[0]} alt={item.product.nombre} />
                    </a>
                    <div>
                      <a
                        href={`/producto/${item.product.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setCartOpen(false);
                          navigate(`/producto/${item.product.slug}`);
                        }}
                      >
                        <h3>{item.product.nombre}</h3>
                      </a>
                      <p>
                        {item.color} / Talla {item.talla}
                      </p>
                      <strong>{formatPrice(item.product.precio)}</strong>
                      <div className="quantity">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, item.cantidad - 1)}
                          aria-label="Reducir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, item.cantidad + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="icon-button remove-item"
                      onClick={() => removeFromCart(itemKey)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                );
              })}
            </div>

            {/* Bottom summary and coupon */}
            <div className="cart-summary border-t border-[#deded6] pt-4 mt-2">
              <form className="inline-input mb-3" onSubmit={handleApplyCoupon}>
                <input
                  aria-label="Código de descuento"
                  placeholder="Cupón (ALTURA10, CLUB20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit" className="button button-outline">
                  Aplicar
                </button>
              </form>

              {couponError && <p className="error text-xs mb-2 text-[#d9383a]">{couponError}</p>}

              {coupon && (
                <p className="coupon-applied text-xs mb-2">
                  <span>{coupon} aplicado ({totals.discount > 0 ? `${formatPrice(totals.discount)} de descuento` : 'sin descuento'})</span>
                  <button type="button" className="ml-2 text-red-600 underline text-xs" onClick={() => setCoupon('')}>
                    Quitar
                  </button>
                </p>
              )}

              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>

              {totals.discount > 0 && (
                <div className="summary-line discount text-emerald-700 font-medium">
                  <span>Descuento aplicado</span>
                  <span>−{formatPrice(totals.discount)}</span>
                </div>
              )}

              <div className="summary-line text-xs text-[#6b6b66]">
                <span>Envío estimado</span>
                <span>{totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping)}</span>
              </div>

              <div className="summary-line total font-bold text-lg border-t border-[#deded6] pt-2 mt-2">
                <span>Total estimado</span>
                <span>{formatPrice(totals.total)}</span>
              </div>

              <button
                className="button full mt-4"
                onClick={() => {
                  setCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Continuar al pago <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
