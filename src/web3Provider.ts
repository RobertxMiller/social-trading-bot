import { JsonRpcProvider, Wallet } from 'ethers';
import { config } from './config';

export class Web3Provider {
    private provider: JsonRpcProvider;
    private wallet?: Wallet;

    constructor() {
        this.provider = new JsonRpcProvider(config.rpcUrl);
        
        if (config.privateKey) {
            this.wallet = new Wallet(config.privateKey, this.provider);
        }
    }

    getProvider(): JsonRpcProvider {
        return this.provider;
    }

    getWallet(): Wallet | undefined {
        return this.wallet;
    }

    async getLatestBlock() {
        return await this.provider.getBlockNumber();
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.provider.getBalance(address);
        return balance.toString();
    }
}