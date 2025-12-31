"use strict";
'use client';
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
exports.submitRoleRequest = submitRoleRequest;
exports.getRoleRequests = getRoleRequests;
exports.updateRoleRequestStatus = updateRoleRequestStatus;
exports.deleteRoleRequest = deleteRoleRequest;
// Use localStorage as persistent storage
const STORAGE_KEY = 'role_requests';
// Read requests from localStorage
function readRequests() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored)
            return [];
        const requests = JSON.parse(stored);
        // Ensure all requests have required properties
        return requests.map((req) => ({
            id: req.id,
            address: req.address,
            role: req.role,
            status: req.status || 'pending',
            timestamp: req.timestamp || Date.now(),
            signature: req.signature
        }));
    }
    catch (error) {
        console.error('Error reading role requests from localStorage:', error);
        return [];
    }
}
// Write requests to localStorage
function writeRequests(requests) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        console.log('Successfully wrote role requests to localStorage');
    }
    catch (error) {
        console.error('Error writing role requests to localStorage:', error);
        throw new Error('No se pudo guardar la solicitud en el almacenamiento local.');
    }
}
function submitRoleRequest(address, role, signature) {
    return __awaiter(this, void 0, void 0, function* () {
        const newRequest = {
            id: Math.random().toString(36).substring(7),
            address,
            role,
            status: 'pending',
            timestamp: Date.now(),
            signature,
        };
        const requests = readRequests();
        requests.push(newRequest);
        writeRequests(requests);
        console.log('Role request submitted and saved:', newRequest);
        // In a real app, you might dispatch an event or use a state manager
        // to notify other parts of the app of the change
        return newRequest;
    });
}
function getRoleRequests() {
    return __awaiter(this, void 0, void 0, function* () {
        const requests = readRequests();
        console.log('Fetching role requests from localStorage, count:', requests.length);
        return requests;
    });
}
function updateRoleRequestStatus(id, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const requests = readRequests();
        const index = requests.findIndex(req => req.id === id);
        if (index !== -1) {
            requests[index].status = status;
            writeRequests(requests);
        }
    });
}
function deleteRoleRequest(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let requests = readRequests();
        const initialLength = requests.length;
        requests = requests.filter(req => req.id !== id);
        if (requests.length !== initialLength) {
            writeRequests(requests);
        }
    });
}
