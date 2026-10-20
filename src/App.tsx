import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { LookbookPage } from './pages/LookbookPage';
import { RunClubPage } from './pages/RunClubPage';
import { StaticPage } from './pages/StaticPages';
import { ArrowRight, Check } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentPath, toast, navigate } = useStore();

  const pathname = currentPath.split('?')[0];

  // Router matching
  const renderCurrentView = () => {
    if (pathname === '/') {
      return <HomePage />;
    }

    if (pathname === '/catalogo') {
      return <CatalogPage />;
    }

    if (pathname === '/favoritos') {
      return <CatalogPage favoritesOnly />;
    }

    if (pathname.startsWith('/producto/')) {
      const slug = pathname.replace('/producto/', '');
      return <ProductDetailPage slug={slug} />;
    }

    if (pathname === '/checkout') {
      return <CheckoutPage />;
    }

    if (pathname === '/cuenta' || pathname === '/login') {
      return <AccountPage />;
    }

    if (pathname === '/admin') {
      return <AdminPage />;
    }

    if (pathname === '/lookbook') {
      return <LookbookPage />;
    }

    if (pathname === '/run-club') {
      return <RunClubPage />;
    }

    // Direct category aliases
    if (pathname === '/hombre') {
      return <CatalogPage />;
    }

    if (pathname === '/mujer') {
      return <CatalogPage />;
    }

    if (['/nosotros', '/contacto', '/guia-de-tallas', '/cuidado', '/envios', '/terminos', '/privacidad', '/reclamaciones'].includes(pathname)) {
      const pageKey = pathname.replace('/', '') as any;
      return <StaticPage page={pageKey} />;
    }

    // 404 Fallback
    return (
      <div className="container py-24 text-center">
        <h1 className="text-4xl font-extrabold mb-3">404 · Ruta no encontrada</h1>
        <p className="text-xs text-[#6b6b66] mb-8">La página que buscas no existe en nuestra tienda.</p>
        <button className="button" onClick={() => navigate('/')}>
          Volver al inicio <ArrowRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#0047ff] selection:text-white">
      <Header />

      <main className="flex-1">{renderCurrentView()}</main>

      <Footer />

      <CartDrawer />

      {/* Global Toast Notification */}
      {toast && (
        <aside className="toast fixed bottom-6 right-6 z-50 bg-[#0d0d0d] text-white px-5 py-3 shadow-2xl flex items-center gap-3 border border-white/20 animate-fade-in text-xs font-semibold">
          <span className="w-5 h-5 rounded-full bg-[#0047ff] flex items-center justify-center shrink-0">
            <Check size={13} className="text-white" />
          </span>
          <span>{toast}</span>
        </aside>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
