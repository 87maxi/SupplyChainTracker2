"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.truncateAddress = truncateAddress;
exports.formatNumber = formatNumber;
exports.formatCurrency = formatCurrency;
exports.getEtherscanUrl = getEtherscanUrl;
exports.getAddressExplorerUrl = getAddressExplorerUrl;
exports.calculateGasCost = calculateGasCost;
exports.formatDate = formatDate;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
// Helper function to truncate wallet addresses
function truncateAddress(address) {
    if (!address)
        return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
// Helper function to format large numbers with commas
function formatNumber(num) {
    return num.toLocaleString();
}
// Helper function to format currency
function formatCurrency(amount, decimals = 2) {
    return amount.toFixed(decimals);
}
// Helper function to get Etherscan URL for a transaction hash
function getEtherscanUrl(hash, network = 'ethereum') {
    const baseUrl = network === 'ethereum' ? 'https://etherscan.io' :
        network === 'polygon' ? 'https://polygonscan.com' :
            network === 'sepolia' ? 'https://sepolianscan.io' : 'https://etherscan.io';
    return `${baseUrl}/tx/${hash}`;
}
// Helper function to get block explorer URL for an address
function getAddressExplorerUrl(address, network = 'ethereum') {
    const baseUrl = network === 'ethereum' ? 'https://etherscan.io' :
        network === 'polygon' ? 'https://polygonscan.com' :
            network === 'sepolia' ? 'https://sepolianscan.io' : 'https://etherscan.io';
    return `${baseUrl}/address/${address}`;
}
// Helper function to calculate gas cost in ETH
function calculateGasCost(gasUsed, gasPrice) {
    return (gasUsed * gasPrice) / 1e18; // Convert from wei to ETH
}
// Helper function to format date to local string
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
