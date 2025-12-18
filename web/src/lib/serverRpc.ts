// Using native fetch (available in Node.js 18+)

// Get the base URL based on the environment
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment - use relative URL
    return '';
  }
  
  // Server environment - use absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Default to localhost for development
  return 'http://localhost:3000';
};

const RPC_ENDPOINT = `${getBaseUrl()}/api/rpc`;

interface RpcRequest {
  method: string;
  params: Record<string, any>;
}

interface RpcResponse<T = any> {
  data: T | null;
  error: string | null;
}

async function rpcCall<T>(method: string, params: Record<string, any>): Promise<T> {
  try {
    const response = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method, params }),
    });

    // Check if response is successful and content-type is JSON
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      throw new Error(`Expected JSON response but got: ${contentType}. Response: ${errorText.substring(0, 200)}`);
    }

    const result = await response.json() as RpcResponse<T>;
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result.data as T;
  } catch (error) {
    console.error(`RPC call failed for method ${method}:`, error);
    throw error;
  }
}

export const serverRpc = {
  async getNetbookState(serial: string): Promise<string> {
    return rpcCall<string>('getNetbookState', { serial });
  },
  
  async getNetbookReport(serial: string): Promise<any> {
    return rpcCall<any>('getNetbookReport', { serial });
  },
  
  async getAllSerialNumbers(): Promise<string[]> {
    return rpcCall<string[]>('getAllSerialNumbers', {});
  },
  
  async hasRole(roleHash: string, address: string): Promise<boolean> {
    return rpcCall<boolean>('hasRole', { roleHash, address });
  }
};