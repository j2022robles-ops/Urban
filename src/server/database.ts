import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data folder exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'urbanvibe.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Helper to normalize admin email (handling 'j2022robles gmail.com' or 'j2022robles@gmail.com')
export function normalizeEmail(email: string): string {
  if (!email) return '';
  let cleaned = email.trim().toLowerCase();
  if (cleaned.includes(' ') && !cleaned.includes('@')) {
    cleaned = cleaned.replace(/\s+/, '@');
  }
  return cleaned;
}

export function initDatabase() {
  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      whatsapp TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL
    );
  `);

  // 2. Products Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      slug TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      linea TEXT NOT NULL,
      composicion TEXT NOT NULL,
      publico TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL,
      colores TEXT NOT NULL,
      tallas TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      imagenes TEXT NOT NULL,
      etiquetas TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      customer_nombre TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_whatsapp TEXT NOT NULL,
      customer_direccion TEXT NOT NULL,
      customer_distrito TEXT NOT NULL,
      customer_nota TEXT,
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      shipping REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      coupon TEXT,
      status TEXT NOT NULL DEFAULT 'pendiente',
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 4. Order Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      talla TEXT NOT NULL,
      color TEXT NOT NULL,
      cantidad INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // 5. Leads Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      nombre TEXT,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 6. Reclamaciones Table (INDECOPI Perú)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reclamaciones (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      documento TEXT NOT NULL,
      tipo TEXT NOT NULL,
      detalle TEXT NOT NULL,
      pedido TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 7. Admin Sessions Table (strict database access control)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  // 8. SQL Query Audit Logs
  db.exec(`
    CREATE TABLE IF NOT EXISTS sql_query_logs (
      id TEXT PRIMARY KEY,
      admin_email TEXT NOT NULL,
      query TEXT NOT NULL,
      executed_at TEXT NOT NULL
    );
  `);

  // Seed / Upsert the Administrator account as requested by user
  const adminEmail = 'j2022robles@gmail.com';
  const adminPass = 'ijuhyHgtGgb1';
  const now = new Date().toISOString();

  const upsertAdmin = db.prepare(`
    INSERT INTO users (id, email, password, nombre, whatsapp, role, created_at)
    VALUES ('usr_admin_j2022robles', ?, ?, 'Administrador Principal (j2022robles)', '+51 925 147 306', 'admin', ?)
    ON CONFLICT(email) DO UPDATE SET
      password = excluded.password,
      role = 'admin',
      nombre = 'Administrador Principal (j2022robles)';
  `);
  upsertAdmin.run(adminEmail, adminPass, now);

  // Also seed a demo customer account for regular user testing
  const seedCustomer = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password, nombre, whatsapp, role, created_at)
    VALUES ('usr_cliente_arequipa', 'cliente@urbanvibe.pe', 'cliente123', 'Camila Zúñiga', '+51 984 123 456', 'customer', ?);
  `);
  seedCustomer.run(now);

  // Seed Products if table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (countRow.count === 0) {
    try {
      const productsFile = path.resolve(process.cwd(), 'src/data/products.json');
      if (fs.existsSync(productsFile)) {
        const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
        const insertProduct = db.prepare(`
          INSERT INTO products (slug, nombre, linea, composicion, publico, precio, stock, colores, tallas, descripcion, imagenes, etiquetas, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const p of productsData) {
          insertProduct.run(
            p.slug,
            p.nombre,
            p.linea,
            p.composicion,
            p.publico,
            Number(p.precio),
            Number(p.stock || 24),
            JSON.stringify(p.colores || ['Negro']),
            JSON.stringify(p.tallas || ['S', 'M', 'L', 'XL']),
            p.descripcion || '',
            JSON.stringify(p.imagenes || []),
            JSON.stringify(p.etiquetas || []),
            now
          );
        }
        console.log(`Seeded ${productsData.length} products into SQLite database.`);
      }
    } catch (err) {
      console.error('Error seeding products:', err);
    }
  }

  // Seed sample initial order if orders table is empty
  const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
  if (orderCount.count === 0) {
    const insertOrder = db.prepare(`
      INSERT INTO orders (id, user_id, customer_nombre, customer_email, customer_whatsapp, customer_direccion, customer_distrito, customer_nota, subtotal, discount, shipping, total, coupon, status, payment_method, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(
      'UV-82941',
      'usr_cliente_arequipa',
      'Camila Zúñiga',
      'cliente@urbanvibe.pe',
      '+51 984 123 456',
      'Av. Bolognesi 304, Yanahuara',
      'Yanahuara, Arequipa',
      'Dejar en recepción de 9am a 5pm',
      208,
      20.8,
      10,
      197.2,
      'ALTURA10',
      'enviado',
      'yape_plin',
      new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    );

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (id, order_id, slug, nombre, precio, talla, color, cantidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrderItem.run(
      'item_1',
      'UV-82941',
      'polo-misti',
      'Polo manga larga Misti',
      129,
      'M',
      'Crudo',
      1
    );

    insertOrderItem.run(
      'item_2',
      'UV-82941',
      'top-deportivo',
      'Top deportivo',
      79,
      'M',
      'Terracota',
      1
    );
  }

  console.log('SQLite Database initialized successfully at:', DB_PATH);
}
