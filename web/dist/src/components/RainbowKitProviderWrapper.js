"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RainbowKitProviderWrapper = RainbowKitProviderWrapper;
const rainbowkit_1 = require("@rainbow-me/rainbowkit");
function RainbowKitProviderWrapper({ children }) {
    return (<rainbowkit_1.RainbowKitProvider>
      {children}
    </rainbowkit_1.RainbowKitProvider>);
}
