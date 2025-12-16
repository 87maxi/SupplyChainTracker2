"use client";

import { useWeb3 } from '@/contexts/Web3Context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { WalletConnectButton } from '../WalletConnectButton';

export function Header() {
  const { isConnected } = useWeb3();

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl">
            SupplyChainTracker
          </Link>
          
          {isConnected && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/dashboard" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Netbooks</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-2">
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/tokens"
                        >
                          <div className="mb-2 text-lg font-medium">
                            Gestión de Netbooks
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Registra, consulta y administra el ciclo de vida de las netbooks
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link href="/tokens/create" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Registrar Netbooks
                          </NavigationMenuLink>
                        </Link>
                      </li>
                      <li>
                        <Link href="/tokens" legacyBehavior passHref>
                          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            Listado de Netbooks
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/transfers" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Transferencias
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/profile" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Perfil
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                {window.location.hostname === 'localhost' && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <Link href="/admin" legacyBehavior passHref>
                          <li>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                              Panel Admin
                            </NavigationMenuLink>
                          </li>
                        </Link>
                        <Link href="/admin/users" legacyBehavior passHref>
                          <li>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                              Gestión de Usuarios
                            </NavigationMenuLink>
                          </li>
                        </Link>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>
        
        <WalletConnectButton />
      </div>
    </header>
  );
}