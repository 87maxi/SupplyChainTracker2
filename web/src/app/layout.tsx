import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Web3Providers } from '@/components/Web3Providers';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import DiagnosticRunner from '@/components/diagnostics/DiagnosticRunner';
import DebugComponent from '@/components/diagnostics/DebugComponent';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Supply Chain Tracker",
  description: "Plataforma para rastrear la cadena de suministro de netbooks",
};

// Importar el módulo de diagnóstico
import '@/lib/diagnostics/service-debug';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Web3Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
              {children}
            </div>
            <Navigation />
          </div>
          <DiagnosticRunner />
          <DebugComponent />
        </Web3Providers>
      </body>
    </html>
  );
}
