import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProviderWrapper } from '@/components/RainbowKitProviderWrapper';
import { createWagmiConfig } from '@/lib/wagmi';
import { WagmiProvider } from 'wagmi';

export const metadata: Metadata = {
  title: "Supply Chain Tracker",
  description: "Sistema de trazabilidad de netbooks educativas",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Create wagmi config
const config = createWagmiConfig();

// Client-side component to wrap WagmiProvider
function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProviderWrapper>
          {children}
        </RainbowKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ClientProviders>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main>
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
