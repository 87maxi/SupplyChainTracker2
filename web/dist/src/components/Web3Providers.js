"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3Providers = Web3Providers;
const react_query_1 = require("@tanstack/react-query");
const rainbowkit_1 = require("@rainbow-me/rainbowkit");
const wagmi_1 = require("wagmi");
const react_1 = require("react");
const config_1 = require("@/lib/wagmi/config");
function Web3Providers({ children }) {
    const [queryClient] = (0, react_1.useState)(() => new react_query_1.QueryClient());
    return (<wagmi_1.WagmiProvider config={config_1.config}>
      <react_query_1.QueryClientProvider client={queryClient}>
        <rainbowkit_1.RainbowKitProvider>
          {children}
        </rainbowkit_1.RainbowKitProvider>
      </react_query_1.QueryClientProvider>
    </wagmi_1.WagmiProvider>);
}
