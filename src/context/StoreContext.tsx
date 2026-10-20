import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, User } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

export const getCartItemKey = (item: { product: { slug: string }; talla: string; color: string }) => {
  return `${item.product.slug}-${item.talla}-${item.color}`;
};

interface CartCalculation {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export const calculateCartTotals = (
  items: CartItem[],
  coupon: string,
  user: User | null,
  shippingRate = 0
): CartCalculation => {
  const subtotal = items.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0);

  const hasThreeLayers = ['polo-misti', 'hoodie-heavyweight', 'casaca-cortaviento'].every((slug) =>
    items.some((i) => i.product.slug === slug)
  );

  let discountRate = 0;
  const cleanCoupon = coupon.trim().toUpperCase();

  if (cleanCoupon === 'CLUB20' && user) {
    discountRate = 0.2;
  } else if (cleanCoupon === 'ALTURA10') {
    discountRate = 0.1;
  } else if (cleanCoupon === 'CAPAS10' && hasThreeLayers) {
    discountRate = 0.1;
  }

  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const netSubtotal = subtotal - discount;
  const shipping = netSubtotal >= 299 ? 0 : shippingRate;
  const total = Math.round((netSubtotal + shipping) * 100) / 100;

  return { subtotal, discount, shipping, total };
};

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  favorites: string[];
  user: User | null;
  adminToken: string | null;
  isAdmin: boolean;
  coupon: string;
  cartOpen: boolean;
  searchOpen: boolean;
  toast: string | null;
  currentPath: string;
  navigate: (path: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  setCoupon: (c: string) => void;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  notify: (msg: string) => void;
  setUser: (u: User | null) => void;
  setAdminToken: (t: string | null) => void;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  refreshProducts: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('uv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('uv_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('uv_admin_token') || null;
    } catch {
      return null;
    }
  });

  const [coupon, setCoupon] = useState<string>('');
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname + window.location.search);

  // Sync route changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uv_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('uv_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('uv_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('uv_user');
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      if (adminToken) {
        localStorage.setItem('uv_admin_token', adminToken);
      } else {
        localStorage.removeItem('uv_admin_token');
      }
    } catch {
      // ignore
    }
  }, [adminToken]);

  // Fetch live products from backend on mount
  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch {
      // Fallback
    }
  };

  // Verify admin session if token exists
  useEffect(() => {
    refreshProducts();

    if (adminToken) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            setAdminToken(null);
            localStorage.removeItem('uv_admin_token');
          }
        })
        .catch(() => {});
    }

    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const adminLogin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Credenciales de administrador incorrectas.' };
      }

      setAdminToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error de conexión con el servidor.' };
    }
  };

  const adminLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } catch {
        // ignore
      }
    }
    setAdminToken(null);
    localStorage.removeItem('uv_admin_token');
    notify('Sesión de administrador cerrada.');
  };

  const addToCart = (newItem: CartItem) => {
    const key = getCartItemKey(newItem);
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => getCartItemKey(i) === key);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].cantidad += newItem.cantidad;
        return updated;
      }
      return [...prev, newItem];
    });
    notify(`Agregado a tu bolsa: ${newItem.product.nombre}`);
    setCartOpen(true);
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((i) => getCartItemKey(i) !== key));
  };

  const updateQuantity = (key: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(key);
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (getCartItemKey(i) === key) {
          return { ...i, cantidad: qty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon('');
  };

  const toggleFavorite = (slug: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(slug);
      if (isFav) {
        notify('Eliminado de tus favoritos.');
        return prev.filter((s) => s !== slug);
      } else {
        notify('Guardado en tus favoritos.');
        return [...prev, slug];
      }
    });
  };

  const isFavorite = (slug: string) => favorites.includes(slug);

  const isAdmin = Boolean(adminToken && user?.role === 'admin');

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        favorites,
        user,
        adminToken,
        isAdmin,
        coupon,
        cartOpen,
        searchOpen,
        toast,
        currentPath,
        navigate,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleFavorite,
        isFavorite,
        setCoupon,
        setCartOpen,
        setSearchOpen,
        notify,
        setUser,
        setAdminToken,
        adminLogin,
        adminLogout,
        refreshProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
