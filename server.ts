import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db, initDatabase, normalizeEmail } from './src/server/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize SQLite database
initDatabase();

// In-memory customer session mapping (for standard client session)
let currentCustomerSession: any = null;

// --- ADMIN AUTHENTICATION MIDDLEWARE ---
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Acceso no autorizado: Solo el administrador con las credenciales designadas tiene acceso a la base de datos.',
      requiresAdminLogin: true,
    });
  }

  const sessionRow = db
    .prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ?')
    .get(token, new Date().toISOString()) as { token: string; user_id: string; email: string } | undefined;

  if (!sessionRow) {
    return res.status(401).json({
      error: 'Sesión de administrador inválida o expirada. Por favor ingresa nuevamente con correo y contraseña.',
      requiresAdminLogin: true,
    });
  }

  const user = db.prepare('SELECT id, email, nombre, role FROM users WHERE id = ?').get(sessionRow.user_id) as any;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acceso restringido: Esta cuenta no posee permisos de administrador de base de datos.',
    });
  }

  (req as any).adminUser = user;
  next();
}

// --- PUBLIC & CUSTOMER API ROUTES ---

// 1. Products (from SQLite)
app.get('/api/products', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM products ORDER BY rowid ASC').all() as any[];
    const products = rows.map((r) => ({
      ...r,
      precio: Number(r.precio),
      stock: Number(r.stock),
      colores: JSON.parse(r.colores || '[]'),
      tallas: JSON.parse(r.tallas || '[]'),
      imagenes: JSON.parse(r.imagenes || '[]'),
      etiquetas: JSON.parse(r.etiquetas || '[]'),
    }));
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:slug', (req: Request, res: Response) => {
  try {
    const r = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug) as any;
    if (!r) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({
      ...r,
      precio: Number(r.precio),
      stock: Number(r.stock),
      colores: JSON.parse(r.colores || '[]'),
      tallas: JSON.parse(r.tallas || '[]'),
      imagenes: JSON.parse(r.imagenes || '[]'),
      etiquetas: JSON.parse(r.etiquetas || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. User Authentication (Customer & General)
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalized = normalizeEmail(email);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalized) as any;
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  }

  // If user is admin, generate an admin session token as well
  let adminToken: string | undefined = undefined;
  if (user.role === 'admin') {
    adminToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days
    db.prepare('INSERT INTO admin_sessions (token, user_id, email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)').run(
      adminToken,
      user.id,
      user.email,
      new Date().toISOString(),
      expiresAt
    );
  }

  currentCustomerSession = user;
  const { password: _, ...cleanUser } = user;
  res.json({ user: cleanUser, adminToken });
});

// Dedicated Admin Login Endpoint with strict verification
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalized = normalizeEmail(email);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalized) as any;

  if (!user || user.password !== password || user.role !== 'admin') {
    return res.status(401).json({
      error: 'Acceso denegado. Solo el administrador con correo autorizado (j2022robles@gmail.com) y contraseña correcta puede ingresar a la base de datos.',
    });
  }

  // Generate unique token
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  db.prepare('INSERT INTO admin_sessions (token, user_id, email, created_at, expires_at) VALUES (?, ?, ?, ?, ?)').run(
    token,
    user.id,
    user.email,
    now,
    expiresAt
  );

  const { password: _, ...cleanUser } = user;
  res.json({
    success: true,
    message: 'Acceso concedido a la base de datos SQLite de Urban Vibe Sport',
    token,
    user: cleanUser,
  });
});

app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
  const token = authHeader?.replace('Bearer ', '').trim();
  if (token) {
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  }
  res.json({ success: true, message: 'Sesión de base de datos cerrada.' });
});

app.get('/api/admin/verify', requireAdmin, (req: Request, res: Response) => {
  res.json({ valid: true, admin: (req as any).adminUser });
});

app.post('/api/register', (req: Request, res: Response) => {
  const { email, password, nombre, whatsapp } = req.body;
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  const normalized = normalizeEmail(email);
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalized);
  if (existing) {
    return res.status(400).json({ error: 'Ya existe una cuenta con este correo.' });
  }

  const id = `usr_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password, nombre, whatsapp, role, created_at)
    VALUES (?, ?, ?, ?, ?, 'customer', ?)
  `).run(id, normalized, password, nombre, whatsapp || '', now);

  const newUser = { id, email: normalized, nombre, whatsapp: whatsapp || '', role: 'customer', createdAt: now };
  currentCustomerSession = newUser;
  res.json({ user: newUser });
});

app.post('/api/logout', (_req: Request, res: Response) => {
  currentCustomerSession = null;
  res.json({ ok: true });
});

app.get('/api/me', (_req: Request, res: Response) => {
  if (!currentCustomerSession) return res.json({ user: null });
  const { password: _, ...cleanUser } = currentCustomerSession;
  res.json({ user: cleanUser });
});

app.patch('/api/profile', (req: Request, res: Response) => {
  if (!currentCustomerSession) return res.status(401).json({ error: 'No autenticado' });

  const { nombre, whatsapp } = req.body;
  db.prepare('UPDATE users SET nombre = ?, whatsapp = ? WHERE id = ?').run(
    nombre,
    whatsapp,
    currentCustomerSession.id
  );

  currentCustomerSession.nombre = nombre;
  currentCustomerSession.whatsapp = whatsapp;
  const { password: _, ...cleanUser } = currentCustomerSession;
  res.json({ user: cleanUser });
});

// 3. Orders (SQLite)
app.get('/api/orders', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || (req.headers['x-admin-token'] as string);
    const token = authHeader?.replace('Bearer ', '').trim();
    const isAdmin = token
      ? Boolean(db.prepare('SELECT token FROM admin_sessions WHERE token = ?').get(token))
      : false;

    let orders: any[] = [];
    if (isAdmin) {
      orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
    } else if (currentCustomerSession) {
      orders = db
        .prepare('SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC')
        .all(currentCustomerSession.id, currentCustomerSession.email) as any[];
    } else {
      return res.json([]);
    }

    const fullOrders = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id) as any[];
      return {
        id: o.id,
        userId: o.user_id,
        createdAt: o.created_at,
        customer: {
          nombre: o.customer_nombre,
          email: o.customer_email,
          whatsapp: o.customer_whatsapp,
          direccion: o.customer_direccion,
          distrito: o.customer_distrito,
          nota: o.customer_nota,
        },
        items: items.map((i) => ({
          slug: i.slug,
          nombre: i.nombre,
          precio: Number(i.precio),
          talla: i.talla,
          color: i.color,
          cantidad: Number(i.cantidad),
        })),
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        shipping: Number(o.shipping),
        total: Number(o.total),
        coupon: o.coupon,
        status: o.status,
        paymentMethod: o.payment_method,
      };
    });

    res.json(fullOrders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, subtotal, discount, shipping, total, coupon, paymentMethod } = req.body;

  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: 'Información del pedido incompleta.' });
  }

  const orderId = `UV-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  // Insert Order into SQLite
  db.prepare(`
    INSERT INTO orders (id, user_id, customer_nombre, customer_email, customer_whatsapp, customer_direccion, customer_distrito, customer_nota, subtotal, discount, shipping, total, coupon, status, payment_method, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
  `).run(
    orderId,
    currentCustomerSession?.id || null,
    customer.nombre,
    customer.email,
    customer.whatsapp,
    customer.direccion,
    customer.distrito,
    customer.nota || null,
    subtotal,
    discount || 0,
    shipping || 0,
    total,
    coupon || null,
    paymentMethod || 'yape_plin',
    now
  );

  // Insert Order Items and decrement product stock in SQLite
  const insertItem = db.prepare(`
    INSERT INTO order_items (id, order_id, slug, nombre, precio, talla, color, cantidad)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateStock = db.prepare('UPDATE products SET stock = MAX(0, stock - ?) WHERE slug = ?');

  items.forEach((item: any, idx: number) => {
    insertItem.run(
      `${orderId}_${idx}`,
      orderId,
      item.slug,
      item.nombre,
      item.precio,
      item.talla,
      item.color,
      item.cantidad
    );
    updateStock.run(item.cantidad, item.slug);
  });

  const fullOrder = {
    id: orderId,
    userId: currentCustomerSession?.id,
    createdAt: now,
    customer,
    items,
    subtotal,
    discount: discount || 0,
    shipping: shipping || 0,
    total,
    coupon,
    status: 'pendiente',
    paymentMethod: paymentMethod || 'yape_plin',
  };

  res.status(201).json(fullOrder);
});

// 4. Leads & Run Club (SQLite)
app.post('/api/leads', (req: Request, res: Response) => {
  const { email, nombre, type } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido.' });

  const id = `lead_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare('INSERT INTO leads (id, email, nombre, type, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id,
    email,
    nombre || '',
    type || 'guide',
    now
  );

  res.status(201).json({ id, email, nombre, type, createdAt: now });
});

// 5. Libro de Reclamaciones (SQLite)
app.post('/api/reclamaciones', (req: Request, res: Response) => {
  const { nombre, email, whatsapp, documento, tipo, detalle, pedido } = req.body;
  const id = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reclamaciones (id, nombre, email, whatsapp, documento, tipo, detalle, pedido, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, nombre, email, whatsapp, documento, tipo, detalle, pedido || null, now);

  res.status(201).json({ id, createdAt: now });
});

// --- STRICT ADMIN DATABASE ENDPOINTS (PROTECTED BY requireAdmin) ---

// 1. Database Table Explorer & Viewer
app.get('/api/admin/database', requireAdmin, (req: Request, res: Response) => {
  try {
    const table = (req.query.table as string) || 'products';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const pageSize = 15;
    const search = ((req.query.search as string) || '').trim();

    // Whitelist allowed tables to prevent SQL injection
    const allowedTables = ['products', 'orders', 'order_items', 'users', 'leads', 'reclamaciones', 'admin_sessions', 'sql_query_logs'];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: `Tabla ${table} no existe en la base de datos.` });
    }

    // Get table counts
    const tables = allowedTables.map((t) => {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get() as { count: number };
      return {
        name: t,
        count: row.count,
        label:
          t === 'products'
            ? 'Productos (Prendas)'
            : t === 'orders'
            ? 'Pedidos (Ventas)'
            : t === 'order_items'
            ? 'Detalle de Pedidos'
            : t === 'users'
            ? 'Usuarios Registrados'
            : t === 'leads'
            ? 'Inscripciones Run Club & Guías'
            : t === 'reclamaciones'
            ? 'Libro de Reclamaciones'
            : t === 'admin_sessions'
            ? 'Sesiones de Administrador'
            : 'Registro de Consultas SQL',
      };
    });

    // Query rows
    let countQuery = `SELECT COUNT(*) as total FROM ${table}`;
    let selectQuery = `SELECT * FROM ${table}`;
    let params: any[] = [];

    if (search) {
      if (table === 'products') {
        countQuery += ' WHERE nombre LIKE ? OR slug LIKE ? OR linea LIKE ?';
        selectQuery += ' WHERE nombre LIKE ? OR slug LIKE ? OR linea LIKE ?';
        params = [`%${search}%`, `%${search}%`, `%${search}%`];
      } else if (table === 'orders') {
        countQuery += ' WHERE id LIKE ? OR customer_nombre LIKE ? OR customer_email LIKE ?';
        selectQuery += ' WHERE id LIKE ? OR customer_nombre LIKE ? OR customer_email LIKE ?';
        params = [`%${search}%`, `%${search}%`, `%${search}%`];
      } else if (table === 'users') {
        countQuery += ' WHERE email LIKE ? OR nombre LIKE ?';
        selectQuery += ' WHERE email LIKE ? OR nombre LIKE ?';
        params = [`%${search}%`, `%${search}%`];
      } else if (table === 'leads') {
        countQuery += ' WHERE email LIKE ? OR nombre LIKE ?';
        selectQuery += ' WHERE email LIKE ? OR nombre LIKE ?';
        params = [`%${search}%`, `%${search}%`];
      }
    }

    const totalRow = (params.length ? db.prepare(countQuery).get(...params) : db.prepare(countQuery).get()) as { total: number };
    const total = totalRow.total;
    const pages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;

    selectQuery += ' LIMIT ? OFFSET ?';
    const queryParams = [...params, pageSize, offset];
    const rows = db.prepare(selectQuery).all(...queryParams) as any[];

    // Column names
    let columns: string[] = [];
    if (rows.length > 0) {
      columns = Object.keys(rows[0]);
    } else {
      const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      columns = tableInfo.map((c) => c.name);
    }

    res.json({
      engine: 'SQLite 3 (WAL Mode)',
      dbFile: 'data/urbanvibe.sqlite',
      table,
      total,
      page,
      pages,
      columns,
      rows,
      tables,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Direct Raw SQL Console for the Administrator
app.post('/api/admin/sql', requireAdmin, (req: Request, res: Response) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'Debes proporcionar una sentencia SQL.' });
  }

  const trimmed = sql.trim();
  const startTime = performance.now();

  try {
    const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN)\b/i.test(trimmed);

    let rows: any[] = [];
    let changes = 0;

    if (isSelect) {
      rows = db.prepare(trimmed).all() as any[];
    } else {
      const result = db.exec(trimmed);
      // Log query
      db.prepare('INSERT INTO sql_query_logs (id, admin_email, query, executed_at) VALUES (?, ?, ?, ?)').run(
        `log_${Date.now()}`,
        (req as any).adminUser.email,
        trimmed,
        new Date().toISOString()
      );
      rows = [{ status: 'Sentencia ejecutada con éxito', query: trimmed }];
    }

    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    res.json({
      success: true,
      query: trimmed,
      isSelect,
      durationMs,
      rowCount: rows.length,
      columns,
      rows,
    });
  } catch (err: any) {
    res.status(400).json({
      error: `Error de ejecución SQL: ${err.message}`,
      query: trimmed,
    });
  }
});

// 3. Admin product stock and price update
app.patch('/api/admin/products/:slug', requireAdmin, (req: Request, res: Response) => {
  const { precio, stock } = req.body;
  const product = db.prepare('SELECT slug FROM products WHERE slug = ?').get(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  db.prepare('UPDATE products SET precio = ?, stock = ? WHERE slug = ?').run(
    Number(precio),
    Number(stock),
    req.params.slug
  );

  const updated = db.prepare('SELECT * FROM products WHERE slug = ?').get(req.params.slug) as any;
  res.json({
    ...updated,
    precio: Number(updated.precio),
    stock: Number(updated.stock),
    colores: JSON.parse(updated.colores || '[]'),
    tallas: JSON.parse(updated.tallas || '[]'),
    imagenes: JSON.parse(updated.imagenes || '[]'),
    etiquetas: JSON.parse(updated.etiquetas || '[]'),
  });
});

// 4. Admin order status update
app.patch('/api/admin/orders/:id', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const order = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ id: req.params.id, status });
});

// 5. Admin users list
app.get('/api/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const users = db.prepare('SELECT id, email, nombre, whatsapp, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

// 6. Admin leads list
app.get('/api/admin/leads', requireAdmin, (_req: Request, res: Response) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(leads);
});

// 7. Admin database backup export
app.get('/api/admin/export', requireAdmin, (req: Request, res: Response) => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      engine: 'SQLite 3',
      admin: (req as any).adminUser.email,
      tables: {
        users: db.prepare('SELECT id, email, nombre, whatsapp, role, created_at FROM users').all(),
        products: db.prepare('SELECT * FROM products').all(),
        orders: db.prepare('SELECT * FROM orders').all(),
        order_items: db.prepare('SELECT * FROM order_items').all(),
        leads: db.prepare('SELECT * FROM leads').all(),
        reclamaciones: db.prepare('SELECT * FROM reclamaciones').all(),
      },
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="urbanvibe_database_backup.json"');
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VITE MIDDLEWARE / STATIC FILES ---
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Urban Vibe Sport SQLite server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
