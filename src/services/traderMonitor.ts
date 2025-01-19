import { JsonRpcProvider } from 'ethers';
import { Trader, Transaction, TradingSignal } from '../types/trader';

export class TraderMonitor {
    private provider: JsonRpcProvider;
    private watchedTraders: Set<string> = new Set();
    private isMonitoring: boolean = false;

    // Some known successful traders (examples)
    private DEFAULT_TRADERS = [
        '0x8eb8a3b98659cce290402893d0123abb75e3ab28', // Example whale
        '0x73bceb1cd57c711feac4224d062b0f6ff338501e', // Another example
    ];

    constructor(provider: JsonRpcProvider) {
        this.provider = provider;
        this.loadDefaultTraders();
    }

    private loadDefaultTraders() {
        this.DEFAULT_TRADERS.forEach(address => {
            this.addTrader(address);
        });
    }

    addTrader(address: string): void {
        this.watchedTraders.add(address.toLowerCase());
        console.log(`Now monitoring trader: ${address}`);
    }

    removeTrader(address: string): void {
        this.watchedTraders.delete(address.toLowerCase());
    }

    async startMonitoring(): Promise<void> {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log(`Monitoring ${this.watchedTraders.size} traders...`);

        // Monitor new blocks
        this.provider.on('block', async (blockNumber) => {
            await this.processBlock(blockNumber);
        });
    }

    stopMonitoring(): void {
        this.isMonitoring = false;
        this.provider.removeAllListeners('block');
    }

    private async processBlock(blockNumber: number): Promise<void> {
        try {
            const block = await this.provider.getBlock(blockNumber, true);
            if (!block || !block.transactions) return;

            for (const tx of block.transactions) {
                if (typeof tx === 'string') continue;
                
                const fromAddr = tx.from?.toLowerCase();
                if (fromAddr && this.watchedTraders.has(fromAddr)) {
                    await this.analyzTransaction(tx, blockNumber);
                }
            }
        } catch (error) {
            console.error('Error processing block:', error);
        }
    }

    private async analyzTransaction(tx: any, blockNumber: number): Promise<void> {
        // Simple analysis - more sophisticated logic would go here
        const transaction: Transaction = {
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: tx.value.toString(),
            blockNumber,
            timestamp: new Date(),
            gasPrice: tx.gasPrice?.toString() || '0',
            gasUsed: '0', // Would need receipt for actual gas used
        };

        // Check if this looks like a DEX transaction
        if (this.isDexTransaction(transaction)) {
            const signal = this.generateTradingSignal(transaction);
            this.emitSignal(signal);
        }
    }

    private isDexTransaction(tx: Transaction): boolean {
        // Simple heuristic - check if to address is a known DEX
        const knownDexes = [
            '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
            '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 Router
        ];
        
        return knownDexes.some(dex => 
            tx.to.toLowerCase() === dex.toLowerCase()
        );
    }

    private generateTradingSignal(tx: Transaction): TradingSignal {
        return {
            trader: tx.from,
            transaction: tx,
            confidence: 0.7, // Simple confidence score
            action: 'BUY', // Would analyze tx data to determine
            token: '0xETH', // Would parse from tx data
            amount: tx.value
        };
    }

    private emitSignal(signal: TradingSignal): void {
        console.log('🚨 Trading Signal:', {
            trader: signal.trader.slice(0, 8) + '...',
            action: signal.action,
            confidence: signal.confidence
        });
        
        // TODO: Save to database
        // TODO: Emit to subscribers
    }

    getWatchedTraders(): string[] {
        return Array.from(this.watchedTraders);
    }
}