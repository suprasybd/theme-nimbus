import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router';
import NavBar from '../components/NavBar/NavBar';
import Modals from '@/components/Modals/Modals';
import Cart from '@/components/Cart/Cart';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { getLogo, getStore, getTurnstile } from '@/api/turnstile';
import { useEffect } from 'react';
import { AuthStoreType } from '@/store/authStore';
import Footer from '@/components/Footer/Footer';

const RootComponent: React.FC = () => {
  const { data: turnstileResponse } = useQuery({
    queryKey: ['getTurnstile'],
    queryFn: getTurnstile,
  });

  const { data: logoResposne } = useQuery({
    queryKey: ['getLogo'],
    queryFn: getLogo,
  });

  const { data: storeResposne } = useQuery({
    queryKey: ['getStore'],
    queryFn: getStore,
  });

  const store = storeResposne?.Data;
  const logo = logoResposne?.Data;

  useEffect(() => {
    if (store?.StoreName) {
      document.title = store.StoreName;
    }
  }, [store]);

  useEffect(() => {
    if (logo?.FaviconLink) {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = logo.FaviconLink;
      document.querySelector('head')?.appendChild(favicon);
    }
  }, [logo]);

  useEffect(() => {
    if (turnstileResponse?.Data?.TurnstileKey) {
      localStorage.setItem(
        'turnstile-site-key',
        turnstileResponse.Data.TurnstileKey
      );
    }
  }, [turnstileResponse]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header - Removed container constraints */}
      <header className="sticky top-0 z-50 w-full">
        <NavBar />
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="premium-container py-8">
          <Cart />
          <Modals />
          <ScrollRestoration />
          <Outlet />
        </div>
      </main>

      {/* Footer - Consider removing container here too for full-width */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

interface MyRouterContext {
  hasCookie: boolean;
  auth: AuthStoreType | undefined;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <RootComponent />,
});
