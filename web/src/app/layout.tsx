import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Header } from '@/components/layout/Header';
import { Web3Providers } from '@/components/Web3Providers';


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



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Web3Providers>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main>
              {children}
            </main>
          </div>
        </Web3Providers>
      </body>
    </html>
  );
}
