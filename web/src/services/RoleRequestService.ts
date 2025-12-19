'use server';

import { revalidateTag } from 'next/cache';
import { RoleRequest } from '@/types/role-request';
import fs from 'fs';
import path from 'path';

// Use a more stable path for the storage file
const STORAGE_FILE = path.join(process.cwd(), 'role-requests.json');

console.log('RoleRequestService initialized. Storage file:', STORAGE_FILE);

function readRequests(): RoleRequest[] {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            console.log('Storage file does not exist, creating empty list');
            return [];
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf8');
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error('CRITICAL: Error reading role requests file:', error);
        return [];
    }
}

function writeRequests(requests: RoleRequest[]) {
    try {
        const dir = path.dirname(STORAGE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(requests, null, 2));
        console.log('Successfully wrote role requests to file');
    } catch (error) {
        console.error('CRITICAL: Error writing role requests file:', error);
        throw new Error('No se pudo guardar la solicitud en el servidor.');
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
    revalidateTag('role-requests', 'max');
    return newRequest;
}

export async function getRoleRequests() {
    const requests = readRequests();
    console.log('Fetching role requests from file, count:', requests.length);
    return requests;
}

export async function updateRoleRequestStatus(id: string, status: 'approved' | 'rejected') {
    const requests = readRequests();
    const index = requests.findIndex(req => req.id === id);
    if (index !== -1) {
        requests[index].status = status;
        writeRequests(requests);
        revalidateTag('role-requests', 'max');
    }
}

export async function deleteRoleRequest(id: string) {
    let requests = readRequests();
    const initialLength = requests.length;
    requests = requests.filter(req => req.id !== id);
    if (requests.length !== initialLength) {
        writeRequests(requests);
        revalidateTag('role-requests', 'max');
    }
}
