import { ethers } from 'ethers';

interface ContractConfig {
  address: string;
  abi: any[];
}

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractConfig: ContractConfig | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      console.warn('Ethereum provider not detected');
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }

    try {
      const accounts = await this.provider.send('eth_requestAccounts', []);
      this.signer = await this.provider.getSigner();
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  setContract(config: ContractConfig) {
    this.contractConfig = config;
    
    if (this.signer && this.contractConfig) {
      this.contract = new ethers.Contract(
        this.contractConfig.address,
        this.contractConfig.abi,
        this.signer
      );
    }
  }

  getSigner(): ethers.Signer {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }
    return this.provider;
  }

  getContract(): ethers.Contract {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return this.contract;
  }

  isWalletConnected(): boolean {
    return this.signer !== null;
  }

  async getNetwork() {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }
    return await this.provider.getNetwork();
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Web3 provider not available');
    }
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

// Export a singleton instance
export default new Web3Service();