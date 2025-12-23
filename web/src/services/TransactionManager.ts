import { writeContract, waitForTransactionReceipt, getTransactionCount } from '@wagmi/core';
import { config } from '@/lib/wagmi/config';

class TransactionQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private accountNonces: Map<string, number> = new Map();

  async add<T>(transactionFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await transactionFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const transaction = this.queue.shift()!;
      try {
        await transaction();
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    }

    this.processing = false;
  }

  getAccountNonce(account: string): number | undefined {
    return this.accountNonces.get(account);
  }

  setAccountNonce(account: string, nonce: number): void {
    this.accountNonces.set(account, nonce);
  }

  clearAccountNonce(account: string): void {
    this.accountNonces.delete(account);
  }
}

// Create a singleton instance
export const transactionQueue = new TransactionQueue();

// Enhanced write contract function with robust nonce management
export async function writeContractWithQueue(
  params: Parameters<typeof writeContract>[1]
) {
  // Extract account address
  const account = params.account as string;
  
  return transactionQueue.add(async () => {
    // Retry mechanism for nonce errors
    let retries = 3;

    while (retries > 0) {
      try {
        // Get the latest nonce for the account directly from the network
        const networkNonce = await getTransactionCount(config, {
          address: account as `0x${string}`,
        });
        
        // Use the higher of network nonce or stored nonce to prevent conflicts
        const storedNonce = transactionQueue.getAccountNonce(account);
        const nonce = Math.max(Number(networkNonce), storedNonce || 0);

        // Update stored nonce
        transactionQueue.setAccountNonce(account, nonce + 1);

        // Add nonce to the transaction parameters
        const transactionParams = {
          ...params,
          nonce: Number(nonce),
        };

        console.log('Sending transaction with nonce:', nonce, 'for account:', account);
        
        const hash = await writeContract(config, transactionParams);
        const receipt = await waitForTransactionReceipt(config, { hash });
        
        console.log('Transaction confirmed with nonce:', nonce, 'hash:', hash);
        return receipt;
      } catch (error: any) {
        console.error('Error in writeContractWithQueue (attempt ' + (4 - retries) + '):', error);
        
        // Handle nonce errors specifically
        if (error.message?.includes('nonce too low') && retries > 1) {
          console.log('Nonce error detected, clearing stored nonce and retrying with fresh nonce...');
          // Clear the stored nonce to force fetching a fresh one
          transactionQueue.clearAccountNonce(account);
          retries--;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
          continue;
        }
        
        // Handle user rejected transaction
        if (error.message?.includes('user rejected transaction') || 
            error.message?.includes('User rejected the request')) {
          // Clear the stored nonce as the transaction was rejected
          transactionQueue.clearAccountNonce(account);
          throw new Error('Transacción rechazada por el usuario.');
        }
        
        // For other errors, clear the stored nonce and rethrow
        transactionQueue.clearAccountNonce(account);
        throw error;
      }
    }

    throw new Error('Max retries exceeded for transaction');
  });
}
