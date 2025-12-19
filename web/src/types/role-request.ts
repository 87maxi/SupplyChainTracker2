export interface RoleRequest {
    id: string;
    address: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: number;
    signature?: string;
}
