export interface Trader {
    address: string;
    name?: string;
    totalProfit: number;
    winRate: number;
    lastActive: Date;
    isActive: boolean;
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: number;
    timestamp: Date;
    gasPrice: string;
    gasUsed: string;
    tokenAddress?: string;
    tokenAmount?: string;
    dexName?: string;
}

export interface TradingSignal {
    trader: string;
    transaction: Transaction;
    confidence: number;
    action: 'BUY' | 'SELL' | 'SWAP';
    token: string;
    amount: string;
}