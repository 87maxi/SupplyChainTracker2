"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContract = exports.getSigner = exports.getProvider = void 0;
const ethers_1 = require("ethers");
// Initialize provider from window.ethereum
const getProvider = () => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof window !== 'undefined' && window.ethereum) {
        return new ethers_1.ethers.BrowserProvider(window.ethereum);
    }
    throw new Error('No Ethereum provider found');
});
exports.getProvider = getProvider;
// Get signer from provider
const getSigner = () => __awaiter(void 0, void 0, void 0, function* () {
    const provider = yield (0, exports.getProvider)();
    return yield provider.getSigner();
});
exports.getSigner = getSigner;
// Load contract instance
const getContract = (abi, address) => __awaiter(void 0, void 0, void 0, function* () {
    const signer = yield (0, exports.getSigner)();
    return new ethers_1.ethers.Contract(address, abi, signer);
});
exports.getContract = getContract;
