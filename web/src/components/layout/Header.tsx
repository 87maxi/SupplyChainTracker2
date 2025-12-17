"use client";

import { useWeb3 } from '@/lib/web3';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { WalletConnectButton } from '../WalletConnectButton';

import { useState } from 'react';

export function Header() {
  const { isConnected } = useWeb3();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl">
            SupplyChainTracker
          </Link>

          {isConnected && (
            <>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/tokens"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Netbooks
                </Link>
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <WalletConnectButton />
          </div>

          {/* Mobile Menu Trigger */}
          {isConnected && (
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isConnected && isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b p-4 flex flex-col gap-4 shadow-lg z-50">
          <Link href="/dashboard" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <div className="p-2 font-medium">Netbooks</div>
          <div className="pl-4 flex flex-col gap-2">
            <Link href="/tokens" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
              Gestión de Netbooks
            </Link>
            <Link href="/tokens/create" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
              Registrar Netbooks
            </Link>
          </div>
          <Link href="/transfers" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            Transferencias
          </Link>
          <Link href="/profile" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
            Perfil
          </Link>
          {window.location.hostname === 'localhost' && (
            <>
              <div className="p-2 font-medium">Admin</div>
              <div className="pl-4 flex flex-col gap-2">
                <Link href="/admin" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                  Panel Admin
                </Link>
                <Link href="/admin/users" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                  Gestión de Usuarios
                </Link>
              </div>
            </>
          )}
          <div className="pt-4 border-t">
            <WalletConnectButton />
          </div>
        </div>
      )}
    </header>
  );
}