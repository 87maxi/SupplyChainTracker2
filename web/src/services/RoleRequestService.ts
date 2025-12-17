export interface RoleRequest {
    address: string;
    role: string;
    roleName: string;
    timestamp: number;
    status: 'pending' | 'approved' | 'rejected';
}

const STORAGE_KEY = 'supply_chain_role_requests';

export class RoleRequestService {
    static getRequests(): RoleRequest[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static addRequest(address: string, role: string, roleName: string): void {
        const requests = this.getRequests();
        // Remove existing request for this address if any (allow updating request)
        const filtered = requests.filter(r => r.address.toLowerCase() !== address.toLowerCase());

        const newRequest: RoleRequest = {
            address,
            role,
            roleName,
            timestamp: Date.now(),
            status: 'pending'
        };

        filtered.push(newRequest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    static updateRequestStatus(address: string, status: 'pending' | 'approved' | 'rejected'): void {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.address.toLowerCase() === address.toLowerCase());

        if (index !== -1) {
            requests[index].status = status;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        }
    }

    static removeRequest(address: string): void {
        const requests = this.getRequests();
        const filtered = requests.filter(r => r.address.toLowerCase() !== address.toLowerCase());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }

    static getRequestByAddress(address: string): RoleRequest | undefined {
        const requests = this.getRequests();
        return requests.find(r => r.address.toLowerCase() === address.toLowerCase());
    }
}
