"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require("./globals.css");
require("@rainbow-me/rainbowkit/styles.css");
const Web3Providers_1 = require("@/components/Web3Providers");
const Header_1 = require("@/components/layout/Header");
const toaster_1 = require("@/components/ui/toaster");
const NotificationContainer_1 = require("@/components/ui/NotificationContainer");
const RequireWallet_1 = require("@/components/auth/RequireWallet");
exports.metadata = {
    title: 'SupplyChainTracker - Gestión de Trazabilidad de Netbooks',
    description: 'Sistema de trazabilidad para el ciclo de vida de netbooks educativas',
};
function RootLayout({ children }) {
    return (<html lang="es" className="dark">
      <body className="antialiased">
        <Web3Providers_1.Web3Providers>
          <div className="flex flex-col min-h-screen">
            <Header_1.Header />
            <main className="flex-1">
              <RequireWallet_1.RequireWallet>
                {children}
              </RequireWallet_1.RequireWallet>
            </main>
            <toaster_1.Toaster />
            <NotificationContainer_1.NotificationContainer />
          </div>
        </Web3Providers_1.Web3Providers>
      </body>
    </html>);
}
