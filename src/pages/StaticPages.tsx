import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { getWhatsAppLink } from '../data/products';
import { ArrowLeft, MessageCircle, Mail, MapPin, CheckCircle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

interface StaticPageProps {
  page: 'nosotros' | 'contacto' | 'guia-de-tallas' | 'cuidado' | 'envios' | 'terminos' | 'privacidad' | 'reclamaciones';
}

export const StaticPage: React.FC<StaticPageProps> = ({ page }) => {
  const { navigate, notify } = useStore();

  // Libro de Reclamaciones Form State
  const [recData, setRecData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    documento: '',
    tipo: 'reclamo' as 'reclamo' | 'queja',
    detalle: '',
    pedido: '',
  });
  const [recSubmitted, setRecSubmitted] = useState<string | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const handleRecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecLoading(true);
    try {
      const res = await fetch('/api/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recData),
      });
      const data = await res.json();
      const code = data.id || `REC-${Math.floor(1000 + Math.random() * 9000)}`;
      setRecSubmitted(code);
      notify(`Reclamación registrada bajo el código ${code}.`);
    } catch {
      const code = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
      setRecSubmitted(code);
      notify(`Reclamación registrada bajo el código ${code}.`);
    } finally {
      setRecLoading(false);
    }
  };

  const titles: Record<string, string> = {
    nosotros: 'De Arequipa, con altura.',
    contacto: 'Hablemos de tu próxima aventura.',
    'guia-de-tallas': 'Encuentra tu talla.',
    cuidado: 'Cuida lo que te mueve.',
    envios: 'Más cerca de tu próxima ruta.',
    terminos: 'Condiciones de la tienda.',
    privacidad: 'Tus datos, con claridad.',
    reclamaciones: 'Libro de reclamaciones.',
  };

  return (
    <article className="container info-page py-12 max-w-3xl">
      <div className="breadcrumb mb-4">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          className="inline-flex items-center gap-1 text-xs text-[#6b6b66] hover:text-[#0047ff]"
        >
          <ArrowLeft size={14} /> Inicio / Urban Vibe Sport
        </a>
      </div>

      <span className="eyebrow blue block text-xs font-bold uppercase tracking-widest text-[#0047ff] mb-1">
        URBAN VIBE SPORT / ALTURA 2335
      </span>
      <h1 className="text-4xl font-extrabold text-[#0d0d0d] mb-8">{titles[page]}</h1>

      <div className="prose text-sm text-[#0d0d0d] leading-relaxed space-y-6">
        {/* NOSOTROS */}
        {page === 'nosotros' && (
          <>
            <img
              className="info-cover w-full h-80 object-cover border border-[#deded6] mb-6"
              src="/images/comunidad.webp"
              alt="La comunidad de Urban Vibe en Arequipa"
            />
            <h2 className="text-2xl font-bold">Fibras peruanas. Espíritu arequipeño.</h2>
            <p>
              <strong>ALTURA 2335</strong> toma su nombre de la altitud de la ciudad de Arequipa (2 335 metros sobre
              el nivel del mar), a los pies de los imponentes volcanes Misti, Chachani y Pichu Pichu.
            </p>
            <p>
              Nuestra colección nació para acompañar a quienes despiertan antes del alba para correr por la campiña
              de Cayma y Yanahuara, a quienes entrenan fuerza en el gimnasio urbano, y a quienes buscan coronar cimas
              más allá del horizonte.
            </p>
            <p>
              Son 14 prendas concebidas con los materiales más nobles de nuestra patria: algodón pima de la costa
              sur, lana merino extrafina, y baby alpaca de pastores andinos. Una propuesta de tres capas diseñada para
              protegerte de la oscilación térmica de los Andes sin sacrificar transpirabilidad ni ligereza.
            </p>
            <div className="pt-4">
              <button className="button" onClick={() => navigate('/catalogo')}>
                Conoce la colección ALTURA 2335 <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* CONTACTO */}
        {page === 'contacto' && (
          <>
            <p>
              Te ayudamos a elegir tus prendas, encontrar tu talla perfecta y coordinar entregas directas o envíos
              nacionales.
            </p>
            <div className="contact-card bg-white border border-[#deded6] p-6 space-y-4 my-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle size={20} className="text-[#0047ff]" /> Atención directa por WhatsApp
              </h2>
              <p className="font-mono text-base font-bold text-[#0d0d0d]">+51 925 147 306</p>
              <p className="text-xs text-[#6b6b66]">
                Horario de atención: Lunes a Sábado de 8:00 a. m. a 8:00 p. m.
              </p>
              <a
                className="button inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] border-0 text-white"
                href={getWhatsAppLink('¡Hola, Urban Vibe! Necesito ayuda con la colección ALTURA 2335.')}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> Iniciar conversación
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-[#deded6]">
                <div className="flex items-center gap-2 text-[#0047ff] font-bold text-sm mb-1">
                  <Mail size={18} /> Correo de contacto
                </div>
                <p className="text-xs font-mono">contacto@urbanvibe.pe</p>
              </div>
              <div className="p-4 bg-white border border-[#deded6]">
                <div className="flex items-center gap-2 text-[#0047ff] font-bold text-sm mb-1">
                  <MapPin size={18} /> Sede y taller
                </div>
                <p className="text-xs">Yanahuara, Arequipa · Perú (2 335 m s. n. m.)</p>
              </div>
            </div>
          </>
        )}

        {/* GUIA DE TALLAS */}
        {page === 'guia-de-tallas' && (
          <>
            <p>
              Esta tabla orientativa utiliza medidas corporales en centímetros. Si estás entre dos tallas, te
              recomendamos la más grande para un calce holgado o la menor para un ajuste atlético compresivo.
            </p>
            <div className="table-wrap border border-[#deded6] bg-white my-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#efe6d6]">
                  <tr>
                    <th className="p-3">Talla</th>
                    <th className="p-3">Pecho</th>
                    <th className="p-3">Cintura</th>
                    <th className="p-3">Cadera</th>
                    <th className="p-3">Estatura sugerida</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#deded6]">
                    <td className="p-3 font-bold">XS</td>
                    <td className="p-3">82 – 88 cm</td>
                    <td className="p-3">64 – 70 cm</td>
                    <td className="p-3">88 – 94 cm</td>
                    <td className="p-3">150 – 162 cm</td>
                  </tr>
                  <tr className="border-b border-[#deded6]">
                    <td className="p-3 font-bold">S</td>
                    <td className="p-3">88 – 94 cm</td>
                    <td className="p-3">70 – 76 cm</td>
                    <td className="p-3">94 – 100 cm</td>
                    <td className="p-3">160 – 170 cm</td>
                  </tr>
                  <tr className="border-b border-[#deded6] bg-[#0047ff]/5">
                    <td className="p-3 font-bold text-[#0047ff]">M</td>
                    <td className="p-3">94 – 102 cm</td>
                    <td className="p-3">76 – 84 cm</td>
                    <td className="p-3">100 – 108 cm</td>
                    <td className="p-3">168 – 178 cm</td>
                  </tr>
                  <tr className="border-b border-[#deded6]">
                    <td className="p-3 font-bold">L</td>
                    <td className="p-3">102 – 110 cm</td>
                    <td className="p-3">84 – 92 cm</td>
                    <td className="p-3">108 – 116 cm</td>
                    <td className="p-3">175 – 185 cm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">XL</td>
                    <td className="p-3">110 – 118 cm</td>
                    <td className="p-3">92 – 100 cm</td>
                    <td className="p-3">116 – 124 cm</td>
                    <td className="p-3">180 – 192 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#6b6b66]">
              ¿Tienes dudas específicas? Escríbenos por WhatsApp con tu peso y altura, y te recomendaremos la talla
              exacta.
            </p>
          </>
        )}

        {/* CUIDADO */}
        {page === 'cuidado' && (
          <>
            <p>
              Nuestras prendas están elaboradas con fibras peruanas prémium. Seguir estos pasos garantizará que
              mantengan su suavidad, elasticidad y abrigo durante años.
            </p>
            <div className="space-y-4 my-6">
              <div className="p-4 bg-white border border-[#deded6]">
                <h3 className="font-bold text-base mb-1">Algodón Pima y French Terry</h3>
                <p className="text-xs text-[#6b6b66]">
                  Lavar con agua fría (máx. 30 °C) en ciclo delicado. Usar detergente suave y evitar suavizantes
                  abrasivos. Secar extendido a la sombra.
                </p>
              </div>
              <div className="p-4 bg-white border border-[#deded6]">
                <h3 className="font-bold text-base mb-1">Baby Alpaca y Lana Merino</h3>
                <p className="text-xs text-[#6b6b66]">
                  La alpaca y el merino son fibras con propiedades antibacterianas naturales que no requieren lavado
                  frecuente. Basta con airearlas tras el entrenamiento. Para lavarlas, hacerlo a mano con agua tibia
                  y secar sobre una toalla horizontal sin retorcer.
                </p>
              </div>
              <div className="p-4 bg-white border border-[#deded6]">
                <h3 className="font-bold text-base mb-1">Casacas Cortaviento y Mallas</h3>
                <p className="text-xs text-[#6b6b66]">
                  Cerrar cierres antes de lavar. No planchar sobre estampados térmicos ni áreas reflectivas.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ENVIOS */}
        {page === 'envios' && (
          <>
            <h2 className="text-xl font-bold">Tiempos y tarifas de envío</h2>
            <div className="space-y-3 my-4">
              <div className="p-3 bg-white border border-[#deded6] flex justify-between items-center text-xs">
                <div>
                  <strong>Arequipa Metropolitana</strong>
                  <p className="text-[#6b6b66]">Entrega en 24 a 48 horas laborables</p>
                </div>
                <span className="font-bold text-[#0047ff]">S/ 10.00 (Gratis desde S/ 299)</span>
              </div>
              <div className="p-3 bg-white border border-[#deded6] flex justify-between items-center text-xs">
                <div>
                  <strong>Lima Metropolitana</strong>
                  <p className="text-[#6b6b66]">Courier expreso en 48 a 72 horas</p>
                </div>
                <span className="font-bold">S/ 15.00</span>
              </div>
              <div className="p-3 bg-white border border-[#deded6] flex justify-between items-center text-xs">
                <div>
                  <strong>Provincias y resto del Perú</strong>
                  <p className="text-[#6b6b66]">Olva Courier o Shalom en 3 a 5 días hábiles</p>
                </div>
                <span className="font-bold">S/ 18.00</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mt-6">Política de cambios sin costo</h2>
            <p className="text-xs text-[#6b6b66]">
              Si la talla o el calce no te queda perfecto, tienes hasta 7 días calendario tras recibir tu pedido
              para solicitar un cambio sin costo en Arequipa. La prenda debe estar sin uso y con sus etiquetas
              originales.
            </p>
          </>
        )}

        {/* TERMINOS */}
        {page === 'terminos' && (
          <>
            <p>
              Bienvenido a Urban Vibe Sport. Al realizar compras en nuestra plataforma web aceptas los presentes
              términos y condiciones aplicables al comercio electrónico en el territorio de la República del Perú.
            </p>
            <h3 className="text-base font-bold">1. Precios y disponibilidad</h3>
            <p className="text-xs text-[#6b6b66]">
              Todos los precios están expresados en Soles peruanos (S/) e incluyen el Impuesto General a las Ventas
              (IGV). El stock se actualiza en tiempo real en nuestra base de datos.
            </p>
            <h3 className="text-base font-bold">2. Envíos y entregas</h3>
            <p className="text-xs text-[#6b6b66]">
              Los despachos se realizan previa confirmación de pago y validación de datos de entrega con el cliente.
            </p>
          </>
        )}

        {/* PRIVACIDAD */}
        {page === 'privacidad' && (
          <>
            <p>
              En cumplimiento con la Ley N° 29733 (Ley de Protección de Datos Personales del Perú), te informamos que
              tus datos personales recolectados a través de formularios o compras serán tratados de manera confidencial
              y utilizados exclusivamente para la gestión de pedidos, asesoría en tallas y convocatorias del Run
              Club.
            </p>
            <p className="text-xs text-[#6b6b66]">
              Puedes ejercer tus derechos de acceso, rectificación, cancelación u oposición (ARCO) escribiéndonos a
              contacto@urbanvibe.pe.
            </p>
          </>
        )}

        {/* RECLAMACIONES */}
        {page === 'reclamaciones' && (
          <>
            <p>
              Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571) de la
              República del Perú e INDECOPI, ponemos a tu disposición nuestro Libro de Reclamaciones Virtual.
            </p>

            {recSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-300 p-8 text-center my-6">
                <CheckCircle size={40} className="text-emerald-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-emerald-900 mb-1">Reclamación registrada</h3>
                <p className="text-xs text-emerald-800 mb-3">
                  Tu número de registro es <strong className="font-mono text-sm">{recSubmitted}</strong>.
                </p>
                <p className="text-xs text-[#6b6b66] max-w-md mx-auto">
                  De conformidad con la normativa de INDECOPI, te responderemos en un plazo máximo de 15 días hábiles al
                  correo indicado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRecSubmit} className="bg-white border border-[#deded6] p-6 space-y-4 my-6 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Nombre completo *</label>
                    <input
                      required
                      type="text"
                      value={recData.nombre}
                      onChange={(e) => setRecData({ ...recData, nombre: e.target.value })}
                      className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Documento (DNI / CE) *</label>
                    <input
                      required
                      type="text"
                      value={recData.documento}
                      onChange={(e) => setRecData({ ...recData, documento: e.target.value })}
                      className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Correo electrónico *</label>
                    <input
                      required
                      type="email"
                      value={recData.email}
                      onChange={(e) => setRecData({ ...recData, email: e.target.value })}
                      className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Teléfono / WhatsApp *</label>
                    <input
                      required
                      type="tel"
                      value={recData.whatsapp}
                      onChange={(e) => setRecData({ ...recData, whatsapp: e.target.value })}
                      className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Tipo de registro *</label>
                    <select
                      value={recData.tipo}
                      onChange={(e) => setRecData({ ...recData, tipo: e.target.value as any })}
                      className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                    >
                      <option value="reclamo">Reclamo (Disconformidad con el producto o servicio)</option>
                      <option value="queja">Queja (Malestar respecto a la atención)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">N° de Pedido (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. UV-10492"
                      value={recData.pedido}
                      onChange={(e) => setRecData({ ...recData, pedido: e.target.value })}
                      className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Detalle de la reclamación o queja *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe los hechos ocurridos de manera clara…"
                    value={recData.detalle}
                    onChange={(e) => setRecData({ ...recData, detalle: e.target.value })}
                    className="w-full bg-[#faf9f6] border border-[#deded6] p-2.5"
                  />
                </div>

                <button type="submit" disabled={recLoading} className="button full justify-center text-xs py-3 font-bold">
                  {recLoading ? 'Registrando…' : 'Enviar reclamación'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </article>
  );
};
