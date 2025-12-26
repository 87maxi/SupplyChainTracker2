// web/src/app/layout.tsx
import './globals.css';
import { Web3Provider } from '@/contexts/Web3Context';
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
    <html lang="es">
      <body>
        <Web3Provider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}