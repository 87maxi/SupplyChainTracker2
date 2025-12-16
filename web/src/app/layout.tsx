"use client";

import { Web3Provider } from '@/lib/web3';
import { Header } from '@/components/layout/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <Header />
          <main>{children}</main>
        </Web3Provider>
      </body>
    </html>
  );
}