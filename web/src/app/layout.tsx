import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/layout/Header';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProviderWrapper } from '@/components/RainbowKitProviderWrapper';
import { createWagmiConfig } from '@/lib/wagmi';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={new QueryClient()}>
            <RainbowKitProviderWrapper>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Header />
                <main>
                  {children}
                </main>
              </div>
            </RainbowKitProviderWrapper>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
