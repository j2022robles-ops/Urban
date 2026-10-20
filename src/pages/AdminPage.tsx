import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPrice, getWhatsAppLink } from '../data/products';
import {
  Database,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Terminal,
  RefreshCw,
  Save,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  MessageCircle,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, adminToken, isAdmin, adminLogin, adminLogout, refreshProducts, notify, navigate } = useStore();

  // Admin login form states
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin tabs
  const [activeTab, setActiveTab] = useState<'database' | 'sql' | 'inventory' | 'orders' | 'backup'>('database');

  // Stats & data
  const [orders, setOrders] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  // Database Table Explorer state
  const [selectedTable, setSelectedTable] = useState<string>('products');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [dbData, setDbData] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbPage, setDbPage] = useState(1);
  const [activeRowModal, setActiveRowModal] = useState<any>(null);

  // Raw SQL Console state
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM products ORDER BY precio DESC LIMIT 5;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlError, setSqlError] = useState('');

  // Handle Admin Login submission
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const res = await adminLogin(adminEmailInput, adminPasswordInput);
    if (!res.success) {
      setLoginError(res.error || 'Credenciales de administrador incorrectas.');
    } else {
      notify('¡Acceso concedido a la base de datos de Urban Vibe Sport!');
    }
    setLoginLoading(false);
  };

  const handleFillAdminCredentials = () => {
    setAdminEmailInput('j2022robles@gmail.com');
    setAdminPasswordInput('ijuhyHgtGgb1');
    setLoginError('');
  };

  // Load database table
  const loadDatabaseTable = async (table: string, page = 1, search = '') => {
    if (!adminToken) return;
    setDbLoading(true);
    try {
      const q = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/database?table=${encodeURIComponent(table)}&page=${page}${q}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        setDbData(await res.json());
      } else if (res.status === 401) {
        adminLogout();
      }
    } catch {
      // ignore
    } finally {
      setDbLoading(false);
    }
  };

  // Load overview data
  const loadAdminOverview = async () => {
    if (!adminToken) return;
    setLoadingStats(true);
    try {
      const [ordersRes, usersRes, leadsRes, prodsRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/admin/leads', { headers: { Authorization: `Bearer ${adminToken}` } }),
        fetch('/api/products'),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (prodsRes.ok) setProductsList(await prodsRes.json());
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminOverview();
      loadDatabaseTable(selectedTable, dbPage, tableSearch);
    }
  }, [isAdmin, selectedTable, dbPage]);

  // Execute raw SQL query
  const handleExecuteSQL = async (queryToRun?: string) => {
    if (!adminToken) return;
    const query = queryToRun || sqlQuery;
    if (!query.trim()) return;

    setSqlLoading(true);
    setSqlError('');
    setSqlResult(null);

    try {
      const res = await fetch('/api/admin/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ sql: query }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSqlError(data.error || 'Error al ejecutar SQL');
      } else {
        setSqlResult(data);
        notify(`Consulta SQL ejecutada (${data.durationMs} ms)`);
        // If it was an update or insert, reload database overview
        if (!data.isSelect) {
          loadAdminOverview();
          loadDatabaseTable(selectedTable, dbPage, tableSearch);
        }
      }
    } catch (err: any) {
      setSqlError(err.message || 'Error de conexión');
    } finally {
      setSqlLoading(false);
    }
  };

  // Update product price & stock in SQLite
  const handleUpdateProduct = async (slug: string, precio: number, stock: number) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/products/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ precio, stock }),
      });
      if (res.ok) {
        notify(`Prenda ${slug} actualizada en base de datos SQLite.`);
        loadAdminOverview();
        refreshProducts();
      }
    } catch {
      notify('Error al actualizar prenda');
    }
  };

  // Update order status in SQLite
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        notify(`Estado de pedido ${orderId} actualizado a ${status}.`);
        loadAdminOverview();
      }
    } catch {
      notify('Error al actualizar pedido');
    }
  };

  // Download database backup
  const handleDownloadBackup = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/export', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `urbanvibe_sqlite_backup_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        notify('Copia de seguridad de la base de datos descargada.');
      }
    } catch {
      notify('Error al descargar backup.');
    }
  };

  // 1. GATEKEEPER VIEW: If NOT Authenticated as Admin
  if (!isAdmin) {
    return (
      <div className="container py-16 max-w-lg">
        <div className="breadcrumb mb-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="inline-flex items-center gap-1 text-xs text-[#6b6b66] hover:text-[#0047ff]"
          >
            <ArrowLeft size={14} /> Volver a la tienda
          </a>
        </div>

        <div className="bg-white border-2 border-[#0d0d0d] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0047ff]" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-none flex items-center justify-center shrink-0 border border-red-200">
              <Lock size={24} />
            </div>
            <div>
              <span className="eyebrow blue text-[10px] font-mono tracking-widest block">
                ZONA PROTEGIDA · BASE DE DATOS
              </span>
              <h1 className="text-2xl font-black text-[#0d0d0d]">Acceso Exclusivo de Administrador</h1>
            </div>
          </div>

          <p className="text-xs text-[#6b6b66] leading-relaxed mb-6">
            La base de datos SQLite y las funciones de control interno están estrictamente restringidas. Solo el
            administrador registrado con las credenciales asignadas puede acceder.
          </p>

          {loginError && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 text-xs mb-6 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-[#0d0d0d] mb-1">
                Correo del Administrador
              </label>
              <input
                type="text"
                required
                placeholder="j2022robles@gmail.com"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-[#0d0d0d] mb-1">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="button full justify-center text-xs py-3.5 font-bold uppercase tracking-wider bg-[#0d0d0d] text-white hover:bg-[#0047ff] transition-colors"
            >
              {loginLoading ? 'Verificando permisos…' : 'Acceder a la Base de Datos'} <Unlock size={16} />
            </button>
          </form>

          {/* Quick credential helper button */}
          <div className="mt-6 pt-6 border-t border-[#deded6] bg-[#faf9f6] -mx-8 -mb-8 p-6">
            <span className="text-[10px] font-mono text-[#6b6b66] uppercase font-bold tracking-wider block mb-2">
              Credenciales designadas para el Administrador:
            </span>
            <div className="bg-white p-2.5 border border-[#deded6] text-[11px] font-mono text-[#0d0d0d] space-y-1 mb-3">
              <div>
                <span className="text-[#6b6b66]">Correo:</span> <strong>j2022robles@gmail.com</strong>
              </div>
              <div>
                <span className="text-[#6b6b66]">Contraseña:</span> <strong>ijuhyHgtGgb1</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillAdminCredentials}
              className="w-full py-2 bg-white border border-[#0047ff] text-[#0047ff] text-xs font-bold hover:bg-[#0047ff] hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <KeyRound size={14} /> Autocompletar credenciales de Administrador
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ADMIN AUTHENTICATED: Full Database Console & Management
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="container admin-page py-10">
      {/* Top Admin Status Bar */}
      <div className="bg-[#0d0d0d] text-white p-4 mb-8 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0047ff] text-white flex items-center justify-center font-bold">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Administrador Conectado:
              </span>
              <strong className="text-xs font-mono">{user?.email || 'j2022robles@gmail.com'}</strong>
            </div>
            <p className="text-[11px] text-white/70 font-mono">
              Base de Datos: SQLite 3 WAL Mode · Archivo persistente: <code>data/urbanvibe.sqlite</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Descargar copia de seguridad"
          >
            <Download size={14} /> Backup JSON
          </button>
          <button
            onClick={adminLogout}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <LogOut size={14} /> Cerrar Sesión Admin
          </button>
        </div>
      </div>

      {/* Header and KPIs */}
      <div className="section-heading flex justify-between items-end border-b border-[#deded6] pb-6 mb-8">
        <div>
          <span className="eyebrow blue flex items-center gap-1">
            <Shield size={14} /> PANEL EXCLUSIVO DE BASE DE DATOS Y GESTIÓN
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">Consola de Base de Datos SQLite</h1>
        </div>
        <button
          className="button button-outline text-xs flex items-center gap-1.5"
          onClick={() => {
            loadAdminOverview();
            loadDatabaseTable(selectedTable, dbPage, tableSearch);
          }}
          disabled={loadingStats}
        >
          <RefreshCw size={14} className={loadingStats ? 'animate-spin' : ''} /> Refrescar base de datos
        </button>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <article className="bg-white border border-[#deded6] p-5">
          <div className="flex items-center justify-between text-[#6b6b66] mb-1">
            <span className="text-[11px] uppercase font-bold">Total Facturado</span>
            <DollarSign size={18} className="text-[#0047ff]" />
          </div>
          <strong className="text-2xl font-black text-[#0d0d0d]">{formatPrice(totalRevenue)}</strong>
          <small className="block text-[11px] text-[#6b6b66] mt-1">{orders.length} órdenes en tabla `orders`</small>
        </article>

        <article className="bg-white border border-[#deded6] p-5">
          <div className="flex items-center justify-between text-[#6b6b66] mb-1">
            <span className="text-[11px] uppercase font-bold">Inventario Activo</span>
            <Package size={18} className="text-[#0047ff]" />
          </div>
          <strong className="text-2xl font-black text-[#0d0d0d]">{productsList.length}</strong>
          <small className="block text-[11px] text-[#6b6b66] mt-1">
            {productsList.reduce((s, p) => s + (p.stock || 0), 0)} unidades en almacén
          </small>
        </article>

        <article className="bg-white border border-[#deded6] p-5">
          <div className="flex items-center justify-between text-[#6b6b66] mb-1">
            <span className="text-[11px] uppercase font-bold">Usuarios en DB</span>
            <Users size={18} className="text-[#0047ff]" />
          </div>
          <strong className="text-2xl font-black text-[#0d0d0d]">{usersList.length}</strong>
          <small className="block text-[11px] text-[#6b6b66] mt-1">1 Administrador, {usersList.length - 1} Clientes</small>
        </article>

        <article className="bg-white border border-[#deded6] p-5">
          <div className="flex items-center justify-between text-[#6b6b66] mb-1">
            <span className="text-[11px] uppercase font-bold">Leads & Convocatoria</span>
            <Sparkles size={18} className="text-[#0047ff]" />
          </div>
          <strong className="text-2xl font-black text-[#0d0d0d]">{leads.length}</strong>
          <small className="block text-[11px] text-[#6b6b66] mt-1">Registrados en tabla `leads`</small>
        </article>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-[#deded6] mb-6 gap-1 overflow-x-auto">
        {[
          { key: 'database', label: 'Explorador de Tablas (SQLite)', icon: Database },
          { key: 'sql', label: 'Consola SQL Directa', icon: Terminal },
          { key: 'inventory', label: 'Gestión de Inventario', icon: Package },
          { key: 'orders', label: `Pedidos Registrados (${orders.length})`, icon: ShoppingCart },
          { key: 'backup', label: 'Seguridad y Backup', icon: Shield },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-[#0047ff] text-[#0047ff]'
                  : 'border-transparent text-[#6b6b66] hover:text-[#0d0d0d]'
              }`}
              onClick={() => setActiveTab(t.key as any)}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXPLORADOR DE TABLAS SQLITE */}
      {activeTab === 'database' && (
        <section className="bg-white border border-[#deded6] p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <span className="text-xs font-mono text-[#0047ff] uppercase font-bold block mb-1">
                MOTOR: SQLITE 3 (LOCAL PERSISTENTE)
              </span>
              <h2 className="text-xl font-bold">Visualizador de Tablas y Registros</h2>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-[#6b6b66]">
                Tabla:
                <select
                  value={selectedTable}
                  onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setDbPage(1);
                    setTableSearch('');
                  }}
                  className="ml-2 bg-[#faf9f6] border border-[#deded6] p-2 text-xs font-bold text-[#0d0d0d]"
                >
                  <option value="products">products (Productos e Inventario)</option>
                  <option value="orders">orders (Pedidos y Ventas)</option>
                  <option value="order_items">order_items (Detalle de Prendas por Pedido)</option>
                  <option value="users">users (Usuarios y Administradores)</option>
                  <option value="leads">leads (Inscripciones Run Club & Guías)</option>
                  <option value="reclamaciones">reclamaciones (Libro de Reclamaciones)</option>
                  <option value="admin_sessions">admin_sessions (Sesiones de Token)</option>
                  <option value="sql_query_logs">sql_query_logs (Auditoría de Consultas)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Search bar inside current table */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder={`Filtrar registros en tabla ${selectedTable}…`}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadDatabaseTable(selectedTable, 1, tableSearch);
                }
              }}
              className="flex-1 bg-[#faf9f6] border border-[#deded6] p-2.5 text-xs font-mono"
            />
            <button
              className="button button-outline text-xs"
              onClick={() => loadDatabaseTable(selectedTable, 1, tableSearch)}
            >
              Buscar en tabla
            </button>
            {tableSearch && (
              <button
                className="button button-outline text-xs"
                onClick={() => {
                  setTableSearch('');
                  loadDatabaseTable(selectedTable, 1, '');
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Table display */}
          {dbLoading ? (
            <div className="py-16 text-center text-xs text-[#6b6b66]">Cargando registros de la tabla…</div>
          ) : dbData ? (
            <div>
              <div className="flex justify-between items-center text-xs text-[#6b6b66] mb-3 font-mono">
                <span>
                  Mostrando tabla <strong>{dbData.table}</strong> ({dbData.total} filas totales)
                </span>
                <span>
                  Página {dbData.page} de {dbData.pages}
                </span>
              </div>

              <div className="overflow-x-auto border border-[#deded6] max-h-[500px]">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead className="bg-[#efe6d6] sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 font-mono text-[11px] font-bold text-[#0d0d0d]">#</th>
                      {dbData.columns.map((col: string) => (
                        <th key={col} className="p-2.5 font-mono text-[11px] font-bold text-[#0d0d0d] whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                      <th className="p-2.5 font-mono text-[11px] font-bold text-[#0d0d0d]">JSON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.rows.length === 0 ? (
                      <tr>
                        <td colSpan={dbData.columns.length + 2} className="p-8 text-center text-gray-500">
                          No se encontraron registros en esta tabla.
                        </td>
                      </tr>
                    ) : (
                      dbData.rows.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-[#deded6] hover:bg-neutral-50 transition-colors">
                          <td className="p-2.5 font-mono text-[10px] text-gray-400">
                            {(dbData.page - 1) * 15 + i + 1}
                          </td>
                          {dbData.columns.map((col: string) => (
                            <td key={col} className="p-2.5 text-[11px] max-w-[250px] truncate font-mono">
                              {col === 'precio' || col === 'total' || col === 'subtotal'
                                ? formatPrice(Number(row[col]))
                                : String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                          <td className="p-2.5">
                            <button
                              onClick={() => setActiveRowModal(row)}
                              className="text-[#0047ff] hover:underline flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Eye size={12} /> Ver
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {dbData.pages > 1 && (
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#deded6] text-xs">
                  <button
                    disabled={dbPage <= 1}
                    onClick={() => setDbPage((p) => Math.max(1, p - 1))}
                    className="button button-outline text-xs py-1.5 px-3 disabled:opacity-40"
                  >
                    ← Anterior
                  </button>
                  <span className="font-mono text-[#6b6b66]">
                    Página {dbPage} de {dbData.pages}
                  </span>
                  <button
                    disabled={dbPage >= dbData.pages}
                    onClick={() => setDbPage((p) => Math.min(dbData.pages, p + 1))}
                    className="button button-outline text-xs py-1.5 px-3 disabled:opacity-40"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      )}

      {/* TAB 2: CONSOLA SQL DIRECTA */}
      {activeTab === 'sql' && (
        <section className="bg-white border border-[#deded6] p-6 space-y-6">
          <div>
            <span className="text-xs font-mono text-[#0047ff] uppercase font-bold block mb-1">
              CONSOLA DE CONSULTAS SQL EN VIVO
            </span>
            <h2 className="text-xl font-bold">Ejecutar sentencias SQL contra SQLite</h2>
            <p className="text-xs text-[#6b6b66] mt-1">
              Ejecuta consultas directas (SELECT, INSERT, UPDATE, PRAGMA) en la base de datos <code>data/urbanvibe.sqlite</code>.
            </p>
          </div>

          {/* Quick SQL queries */}
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#6b6b66] block mb-2">
              Plantillas de consulta rápida:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                {
                  label: 'Ver 14 productos ordenados por precio',
                  sql: 'SELECT slug, nombre, linea, precio, stock FROM products ORDER BY precio DESC;',
                },
                {
                  label: 'Resumen de stock por línea de prenda',
                  sql: 'SELECT linea, COUNT(*) as modelos, SUM(stock) as stock_total, AVG(precio) as precio_medio FROM products GROUP BY linea;',
                },
                {
                  label: 'Listar usuarios registrados y permisos',
                  sql: 'SELECT id, email, nombre, role, created_at FROM users ORDER BY created_at DESC;',
                },
                {
                  label: 'Ventas agrupadas por método de pago',
                  sql: 'SELECT payment_method, COUNT(*) as total_pedidos, SUM(total) as ingresos FROM orders GROUP BY payment_method;',
                },
                {
                  label: 'Verificar esquema de tabla orders (PRAGMA)',
                  sql: 'PRAGMA table_info(orders);',
                },
              ].map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => {
                    setSqlQuery(template.sql);
                    handleExecuteSQL(template.sql);
                  }}
                  className="px-2.5 py-1.5 bg-[#efe6d6] hover:bg-[#0047ff] hover:text-white text-[#0d0d0d] font-mono text-[11px] transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Query input area */}
          <div className="space-y-2">
            <textarea
              rows={4}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full bg-[#faf9f6] border border-[#deded6] p-3 text-xs font-mono focus:border-[#0047ff] outline-none"
              placeholder="Escribe tu consulta SQL aquí (ej: SELECT * FROM products;)"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#6b6b66] font-mono">
                Presiona el botón para ejecutar la consulta directamente en la base de datos.
              </span>
              <button
                type="button"
                onClick={() => handleExecuteSQL()}
                disabled={sqlLoading}
                className="button text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <Play size={14} className={sqlLoading ? 'animate-spin' : ''} />
                {sqlLoading ? 'Ejecutando SQL…' : 'Ejecutar SQL'}
              </button>
            </div>
          </div>

          {/* Error display */}
          {sqlError && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 text-xs font-mono">
              <strong>Error:</strong> {sqlError}
            </div>
          )}

          {/* Query Results */}
          {sqlResult && (
            <div className="space-y-2 pt-4 border-t border-[#deded6]">
              <div className="flex justify-between items-center text-xs font-mono text-[#6b6b66]">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Consulta completada: {sqlResult.rowCount} fila(s) retornada(s)
                </span>
                <span>Tiempo de ejecución: {sqlResult.durationMs} ms</span>
              </div>

              <div className="overflow-x-auto border border-[#deded6] max-h-96">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="bg-[#efe6d6] sticky top-0">
                    <tr>
                      {sqlResult.columns.map((c: string) => (
                        <th key={c} className="p-2.5 font-mono text-[11px] font-bold text-[#0d0d0d]">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResult.rows.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-[#deded6] hover:bg-neutral-50">
                        {sqlResult.columns.map((c: string) => (
                          <td key={c} className="p-2.5 text-[11px] font-mono">
                            {typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: GESTIÓN DE INVENTARIO */}
      {activeTab === 'inventory' && (
        <section className="bg-white border border-[#deded6] p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-mono text-[#0047ff] uppercase font-bold block mb-1">
                TABLA: products (SQLITE)
              </span>
              <h2 className="text-xl font-bold">Edición Rápida de Precios y Stock</h2>
            </div>
            <span className="text-xs text-[#6b6b66]">
              Los cambios se guardan directamente en el archivo SQLite.
            </span>
          </div>

          <div className="space-y-3">
            {productsList.map((p) => (
              <form
                key={p.slug}
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleUpdateProduct(p.slug, Number(fd.get('precio')), Number(fd.get('stock')));
                }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 border border-[#deded6] bg-[#faf9f6]"
              >
                <div className="md:col-span-1 flex justify-center">
                  <img src={p.imagenes[0]} alt={p.nombre} className="w-12 h-12 object-contain bg-white p-1 border" />
                </div>

                <div className="md:col-span-5">
                  <h3 className="font-bold text-xs text-[#0d0d0d]">{p.nombre}</h3>
                  <span className="text-[10px] text-[#6b6b66] font-mono">
                    {p.linea} · {p.publico} · {p.composicion}
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#6b6b66]">Precio (S/)</label>
                  <input
                    type="number"
                    name="precio"
                    step="0.5"
                    defaultValue={p.precio}
                    required
                    className="w-full bg-white border border-[#deded6] p-1.5 text-xs font-bold font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[#6b6b66]">Stock en BD</label>
                  <input
                    type="number"
                    name="stock"
                    step="1"
                    defaultValue={p.stock}
                    required
                    className="w-full bg-white border border-[#deded6] p-1.5 text-xs font-bold font-mono"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="button button-outline text-xs py-2 px-3 flex items-center gap-1 font-bold">
                    <Save size={13} /> Guardar en BD
                  </button>
                </div>
              </form>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: GESTIÓN DE PEDIDOS */}
      {activeTab === 'orders' && (
        <section className="bg-white border border-[#deded6] p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-xs font-mono text-[#0047ff] uppercase font-bold block mb-1">
                TABLA: orders & order_items
              </span>
              <h2 className="text-xl font-bold">Órdenes de Compra Registradas</h2>
            </div>
            <span className="text-xs text-[#6b6b66]">{orders.length} pedidos en total</span>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-gray-500 py-12 text-center">No hay pedidos registrados en la base de datos.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#efe6d6]">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Distrito</th>
                    <th className="p-3">Prendas</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Pago</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-[#deded6] hover:bg-neutral-50">
                      <td className="p-3 font-mono font-bold text-[#0047ff]">{o.id}</td>
                      <td className="p-3 text-[#6b6b66] font-mono">
                        {new Date(o.createdAt).toLocaleDateString('es-PE')}
                      </td>
                      <td className="p-3">
                        <strong>{o.customer.nombre}</strong>
                        <div className="text-[10px] text-[#6b6b66] font-mono">{o.customer.whatsapp}</div>
                      </td>
                      <td className="p-3">{o.customer.distrito}</td>
                      <td className="p-3">
                        {o.items.map((i: any, idx: number) => (
                          <div key={idx} className="text-[11px]">
                            {i.cantidad}× {i.nombre} ({i.talla})
                          </div>
                        ))}
                      </td>
                      <td className="p-3 font-bold font-mono">{formatPrice(o.total)}</td>
                      <td className="p-3 uppercase text-[10px] font-bold text-[#6b6b66]">{o.paymentMethod}</td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="bg-white border border-[#deded6] text-xs p-1 font-semibold"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="preparando">Preparando</option>
                          <option value="enviado">Enviado</option>
                          <option value="completado">Completado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <a
                          href={getWhatsAppLink(
                            `¡Hola, ${o.customer.nombre}! Te escribimos de Urban Vibe Sport respecto a tu pedido ${o.id}.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0047ff] flex items-center gap-1 font-semibold text-xs"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 5: SEGURIDAD Y BACKUP */}
      {activeTab === 'backup' && (
        <section className="bg-white border border-[#deded6] p-8 space-y-6">
          <div>
            <span className="text-xs font-mono text-[#0047ff] uppercase font-bold block mb-1">
              ARQUITECTURA Y SEGURIDAD
            </span>
            <h2 className="text-2xl font-bold">Estado de la Base de Datos SQLite</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 bg-[#faf9f6] border border-[#deded6] space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-[#0d0d0d]">
                <ShieldCheck size={18} className="text-emerald-600" /> Control de Acceso Estricto
              </h3>
              <p className="text-[#6b6b66] leading-relaxed">
                El acceso a la base de datos y a las rutas <code>/api/admin/*</code> requiere un token de sesión criptográfico
                generado exclusivamente tras validar el correo <strong>j2022robles@gmail.com</strong> y su contraseña correspondiente.
              </p>
              <div className="p-3 bg-white border border-[#deded6] font-mono text-[11px] space-y-1">
                <div>Administrador activo: <strong>j2022robles@gmail.com</strong></div>
                <div>Permisos: <strong>RBAC admin (Superadmin)</strong></div>
                <div>Tokens de sesión activos: <strong>{dbData?.tables?.find((t: any) => t.name === 'admin_sessions')?.count || 1}</strong></div>
              </div>
            </div>

            <div className="p-5 bg-[#faf9f6] border border-[#deded6] space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-[#0d0d0d]">
                <Database size={18} className="text-[#0047ff]" /> Almacenamiento en Disco
              </h3>
              <p className="text-[#6b6b66] leading-relaxed">
                El archivo de base de datos reside en <code>data/urbanvibe.sqlite</code> con modo Write-Ahead Logging (WAL)
                para soportar lecturas y escrituras concurrentes de alta velocidad.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="button full justify-center text-xs py-3 font-bold mt-2 flex items-center gap-2"
              >
                <Download size={16} /> Descargar Backup Completo (JSON)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Row JSON inspector modal */}
      {activeRowModal && (
        <div className="modal-backdrop" onClick={() => setActiveRowModal(null)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle del Registro ({selectedTable})</h2>
              <button className="icon-button" onClick={() => setActiveRowModal(null)}>
                ✕
              </button>
            </div>
            <pre className="bg-[#0d0d0d] text-emerald-400 p-4 text-xs font-mono overflow-auto max-h-96 rounded-none">
              {JSON.stringify(activeRowModal, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button className="button button-outline text-xs" onClick={() => setActiveRowModal(null)}>
                Cerrar inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
