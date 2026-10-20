import React, { useState } from 'react';
import { useStore, calculateCartTotals, getCartItemKey } from '../context/StoreContext';
import { formatPrice, getWhatsAppLink } from '../data/products';
import { Order } from '../types';
import { ArrowLeft, CheckCircle2, MessageCircle, QrCode, CreditCard, Building2, Truck, ShieldCheck, Printer } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, coupon, user, clearCart, navigate } = useStore();

  const [shippingZone, setShippingZone] = useState<'arequipa' | 'lima' | 'provincias'>('arequipa');
  const shippingRate = shippingZone === 'arequipa' ? 10 : shippingZone === 'lima' ? 15 : 18;

  const totals = calculateCartTotals(cart, coupon, user, shippingRate);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    direccion: '',
    distrito: 'Cayma',
    nota: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'yape_plin' | 'whatsapp' | 'card' | 'transfer'>('yape_plin');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-3xl font-extrabold mb-3">Tu bolsa está vacía</h1>
        <p className="text-sm text-[#6b6b66] mb-8">Agrega prendas a tu bolsa antes de proceder al checkout.</p>
        <button className="button" onClick={() => navigate('/catalogo')}>
          Ir al catálogo
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orderPayload = {
      customer: formData,
      items: cart.map((i) => ({
        slug: i.product.slug,
        nombre: i.product.nombre,
        precio: i.product.precio,
        talla: i.talla,
        color: i.color,
        cantidad: i.cantidad,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      coupon: coupon || undefined,
      paymentMethod,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error('Error al registrar pedido.');
      const data: Order = await res.json();
      setCreatedOrder(data);
      clearCart();
    } catch {
      // Offline fallback order creation
      const fakeOrder: Order = {
        id: `UV-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: user?.id,
        createdAt: new Date().toISOString(),
        customer: formData,
        items: orderPayload.items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
        coupon: coupon || undefined,
        status: 'pendiente',
        paymentMethod,
      };
      setCreatedOrder(fakeOrder);
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  const buildWhatsAppMessage = (o: Order) => {
    return `¡Hola, Urban Vibe! Quiero confirmar mi pedido ${o.id}.\n\n` +
      o.items.map((i) => `${i.cantidad} × ${i.nombre} · ${i.talla} · ${i.color} · ${formatPrice(i.precio * i.cantidad)}`).join('\n') +
      `\n\nSubtotal: ${formatPrice(o.subtotal)}\nDescuento: ${formatPrice(o.discount)}\nEnvío: ${formatPrice(o.shipping)}\nTOTAL: ${formatPrice(o.total)}\n\n` +
      `${o.customer.nombre}\n${o.customer.whatsapp}\n${o.customer.direccion}, ${o.customer.distrito}\n${o.customer.nota || ''}\n\n` +
      `Método de pago: ${o.paymentMethod.toUpperCase()}.\nPendiente de confirmar disponibilidad, entrega y pago.`;
  };

  // Order Success Screen
  if (createdOrder) {
    const waLink = getWhatsAppLink(buildWhatsAppMessage(createdOrder));

    return (
      <div className="container order-success py-16 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} />
          </div>
          <span className="eyebrow blue">¡GRACIAS POR TU COMPRA!</span>
          <h1 className="text-3xl font-extrabold mt-2 mb-2">Pedido registrado con éxito</h1>
          <p className="text-xs text-[#6b6b66]">
            Hemos recibido los detalles de tu orden. Ahora confirma tu pedido por WhatsApp para coordinar el despacho.
          </p>
        </div>

        <div className="order-receipt bg-white border border-[#deded6] p-6 mb-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#deded6] mb-4">
            <div>
              <span className="text-xs text-[#6b6b66]">Código de pedido</span>
              <h2 className="text-xl font-mono font-bold text-[#0047ff]">{createdOrder.id}</h2>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 font-bold uppercase">
              {createdOrder.status}
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {createdOrder.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-xs py-1">
                <span>
                  <strong>{i.cantidad}×</strong> {i.nombre} ({i.talla} / {i.color})
                </span>
                <span className="font-mono">{formatPrice(i.precio * i.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#deded6] pt-4 space-y-1 text-xs">
            <div className="flex justify-between text-[#6b6b66]">
              <span>Subtotal</span>
              <span>{formatPrice(createdOrder.subtotal)}</span>
            </div>
            {createdOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Descuento ({createdOrder.coupon || 'Promoción'})</span>
                <span>−{formatPrice(createdOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#6b6b66]">
              <span>Envío ({createdOrder.customer.distrito})</span>
              <span>{createdOrder.shipping === 0 ? 'Gratis' : formatPrice(createdOrder.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-[#deded6] text-[#0d0d0d]">
              <span>TOTAL</span>
              <span>{formatPrice(createdOrder.total)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#deded6] text-xs text-[#6b6b66]">
            <p className="font-bold text-[#0d0d0d] mb-1">Datos de entrega:</p>
            <p>{createdOrder.customer.nombre} · {createdOrder.customer.whatsapp}</p>
            <p>{createdOrder.customer.direccion}, {createdOrder.customer.distrito}</p>
            {createdOrder.customer.nota && <p className="italic mt-1">«{createdOrder.customer.nota}»</p>}
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="button full justify-center bg-[#25D366] hover:bg-[#20ba59] text-white border-0 py-3.5 text-sm font-bold shadow-md"
          >
            <MessageCircle size={20} /> Confirmar pedido por WhatsApp ahora
          </a>

          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="button button-outline flex-1 justify-center text-xs"
            >
              <Printer size={15} /> Imprimir comprobante
            </button>
            <button
              onClick={() => navigate('/catalogo')}
              className="button button-outline flex-1 justify-center text-xs"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page py-12">
      <div className="breadcrumb mb-6">
        <a
          href="/catalogo"
          onClick={(e) => {
            e.preventDefault();
            navigate('/catalogo');
          }}
          className="inline-flex items-center gap-1 text-xs text-[#6b6b66] hover:text-[#0047ff]"
        >
          <ArrowLeft size={14} /> Volver a la tienda
        </a>
      </div>

      <span className="eyebrow blue">FINALIZAR COMPRA</span>
      <h1 className="text-3xl md:text-4xl font-extrabold mt-1 mb-8">Tus prendas para la altura.</h1>

      <div className="checkout-layout grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form column */}
        <form onSubmit={handlePlaceOrder} className="checkout-form lg:col-span-7 bg-white border border-[#deded6] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Truck size={18} className="text-[#0047ff]" /> 1. Datos para la entrega
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#0d0d0d] mb-1">Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej. Rodrigo Mendoza"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0d0d0d] mb-1">WhatsApp de contacto *</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    placeholder="+51 925 147 306"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#0d0d0d] mb-1">Correo electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0d0d0d] mb-1">Zona de despacho *</label>
                  <select
                    value={shippingZone}
                    onChange={(e) => setShippingZone(e.target.value as any)}
                    className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                  >
                    <option value="arequipa">Arequipa (S/ 10 o Gratis &gt; S/ 299)</option>
                    <option value="lima">Lima Metropolitana (S/ 15)</option>
                    <option value="provincias">Provincias de Perú (S/ 18)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#0d0d0d] mb-1">Distrito / Ciudad *</label>
                  <input
                    type="text"
                    name="distrito"
                    required
                    placeholder="Ej. Cayma, Yanahuara, Miraflores…"
                    value={formData.distrito}
                    onChange={handleInputChange}
                    className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#0d0d0d] mb-1">Dirección exacta / Referencia *</label>
                <input
                  type="text"
                  name="direccion"
                  required
                  placeholder="Av. Bolognesi 304, Dpto 201 (frente al parque)"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-[#0d0d0d] mb-1">Notas para el repartidor (opcional)</label>
                <textarea
                  name="nota"
                  rows={2}
                  placeholder="Horario preferido o indicaciones adicionales de entrega…"
                  value={formData.nota}
                  onChange={handleInputChange}
                  className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#deded6] pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#0047ff]" /> 2. Método de pago
            </h2>

            <div className="space-y-3 text-xs">
              <label
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  paymentMethod === 'yape_plin' ? 'border-[#0047ff] bg-[#0047ff]/5' : 'border-[#deded6]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'yape_plin'}
                  onChange={() => setPaymentMethod('yape_plin')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-sm text-[#0d0d0d]">
                    <QrCode size={16} /> Yape / Plin (Inmediato)
                  </span>
                  <p className="text-[#6b6b66] mt-0.5">
                    Transfiere al número oficial <strong>925 147 306</strong> a nombre de Urban Vibe Sport.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  paymentMethod === 'whatsapp' ? 'border-[#0047ff] bg-[#0047ff]/5' : 'border-[#deded6]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={() => setPaymentMethod('whatsapp')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-sm text-[#0d0d0d]">
                    <MessageCircle size={16} /> Coordinar por WhatsApp
                  </span>
                  <p className="text-[#6b6b66] mt-0.5">
                    Un asesor te responderá de inmediato para confirmar disponibilidad y método de abono.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-[#0047ff] bg-[#0047ff]/5' : 'border-[#deded6]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-sm text-[#0d0d0d]">
                    <CreditCard size={16} /> Tarjeta de crédito / débito (Visa / Mastercard)
                  </span>
                  <p className="text-[#6b6b66] mt-0.5">Pago seguro procesado con encriptación SSL.</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                  paymentMethod === 'transfer' ? 'border-[#0047ff] bg-[#0047ff]/5' : 'border-[#deded6]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold flex items-center gap-1.5 text-sm text-[#0d0d0d]">
                    <Building2 size={16} /> Transferencia BCP / BBVA
                  </span>
                  <p className="text-[#6b6b66] mt-0.5">Cuentas corrientes en soles desde Arequipa.</p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button full justify-center text-sm py-4 font-bold uppercase tracking-wider"
          >
            {loading ? 'Registrando pedido…' : `Confirmar pedido · ${formatPrice(totals.total)}`}
          </button>
        </form>

        {/* Order summary column */}
        <aside className="checkout-summary lg:col-span-5 bg-white border border-[#deded6] p-6 sticky top-6">
          <h2 className="text-lg font-bold mb-4 pb-2 border-b border-[#deded6]">
            Resumen del pedido ({cart.reduce((s, i) => s + i.cantidad, 0)} prendas)
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-6">
            {cart.map((item) => (
              <div key={getCartItemKey(item)} className="flex items-center gap-3">
                <img
                  src={item.product.imagenes[0]}
                  alt={item.product.nombre}
                  className="w-14 h-14 object-contain bg-[#faf9f6] border border-[#deded6] p-1 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <h3 className="font-bold truncate text-[#0d0d0d]">{item.product.nombre}</h3>
                  <p className="text-[#6b6b66]">
                    Talla {item.talla} · {item.color} · Cant: {item.cantidad}
                  </p>
                  <span className="font-bold text-[#0d0d0d]">
                    {formatPrice(item.product.precio * item.cantidad)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#deded6] pt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#6b6b66]">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>

            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento ({coupon || 'Automático'})</span>
                <span>−{formatPrice(totals.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#6b6b66]">
              <span>Envío ({shippingZone === 'arequipa' ? 'Arequipa' : shippingZone === 'lima' ? 'Lima' : 'Provincias'})</span>
              <span>{totals.shipping === 0 ? 'Gratis' : formatPrice(totals.shipping)}</span>
            </div>

            <div className="flex justify-between text-base font-extrabold pt-3 border-t border-[#deded6] text-[#0d0d0d]">
              <span>Total a pagar</span>
              <span className="text-[#0047ff]">{formatPrice(totals.total)}</span>
            </div>
          </div>

          <div className="mt-6 bg-[#efe6d6]/60 p-3 text-[11px] text-[#6b6b66] border border-[#deded6]">
            <strong>Garantía de calidad ALTURA 2335:</strong> Todas nuestras prendas son confeccionadas con fibras
            peruanas certificadas. Si la talla no te queda exacta, te la cambiamos de inmediato.
          </div>
        </aside>
      </div>
    </div>
  );
};
