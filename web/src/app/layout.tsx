import './globals.css';
import { Web3Providers } from '@/components/Web3Providers';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'SupplyChainTracker - Gestión de Trazabilidad de Netbooks',
  description: 'Sistema de trazabilidad para el ciclo de vida de netbooks educativas',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">
        <Web3Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </div>
        </Web3Providers>
      </body>
    </html>
  );
}

