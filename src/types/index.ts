export interface Product {
  slug: string;
  nombre: string;
  linea: 'Running' | 'Training' | 'Altura';
  composicion: string;
  publico: 'Hombre' | 'Mujer' | 'Unisex';
  precio: number;
  stock: number;
  colores: string[];
  tallas: string[];
  descripcion: string;
  imagenes: string[];
  etiquetas: string[];
}

export interface CartItem {
  product: Product;
  talla: string;
  color: string;
  cantidad: number;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  whatsapp: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface CustomerData {
  nombre: string;
  email: string;
  whatsapp: string;
  direccion: string;
  distrito: string;
  ciudad?: string;
  nota?: string;
}

export interface OrderItem {
  slug: string;
  nombre: string;
  precio: number;
  talla: string;
  color: string;
  cantidad: number;
}

export interface Order {
  id: string;
  userId?: string;
  createdAt: string;
  customer: CustomerData;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  status: 'pendiente' | 'preparando' | 'enviado' | 'completado' | 'cancelado';
  paymentMethod: 'yape_plin' | 'whatsapp' | 'card' | 'transfer';
}

export interface Lead {
  id: string;
  email: string;
  type: 'run-club' | 'guide';
  createdAt: string;
}

export interface Reclamacion {
  id: string;
  nombre: string;
  email: string;
  whatsapp: string;
  documento: string;
  tipo: 'reclamo' | 'queja';
  detalle: string;
  pedido?: string;
  createdAt: string;
}
