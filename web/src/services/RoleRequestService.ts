'use client';

import { RoleRequest } from '@/types/role-request';

// Use localStorage as persistent storage
const STORAGE_KEY = 'role_requests';

// Read requests from localStorage
function readRequests(): RoleRequest[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        
        const requests = JSON.parse(stored);
        // Ensure all requests have required properties
        return requests.map((req: any) => ({
            id: req.id,
            address: req.address,
            role: req.role,
            status: req.status || 'pending',
            timestamp: req.timestamp || Date.now(),
            signature: req.signature
        }));
    } catch (error) {
        console.error('Error reading role requests from localStorage:', error);
        return [];
    }
}

// Write requests to localStorage
function writeRequests(requests: RoleRequest[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        console.log('Successfully wrote role requests to localStorage');
    } catch (error) {
        console.error('Error writing role requests to localStorage:', error);
        throw new Error('No se pudo guardar la solicitud en el almacenamiento local.');
    }
}

export async function submitRoleRequest(address: string, role: string, signature?: string) {
    const newRequest: RoleRequest = {
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
}

export async function getRoleRequests() {
    const requests = readRequests();
    console.log('Fetching role requests from localStorage, count:', requests.length);
    return requests;
}

export async function updateRoleRequestStatus(id: string, status: 'approved' | 'rejected') {
    const requests = readRequests();
    const index = requests.findIndex(req => req.id === id);
    if (index !== -1) {
        requests[index].status = status;
        writeRequests(requests);
    }
}

export async function deleteRoleRequest(id: string) {
    let requests = readRequests();
    const initialLength = requests.length;
    requests = requests.filter(req => req.id !== id);
    if (requests.length !== initialLength) {
        writeRequests(requests);
    }
}
