import { Wallet, parseEther, Contract } from 'ethers';
import { TradingSignal } from '../types/trader';

// Basic ERC20 ABI for token transfers
const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address owner) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)'
];

// Uniswap V2 Router ABI (simplified)
const UNISWAP_ROUTER_ABI = [
    'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)',
    'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)'
];

export class CopyTradingService {
    private wallet?: Wallet;
    private isEnabled: boolean = false;
    private maxTradeAmount: bigint = parseEther('0.1'); // Max 0.1 ETH per trade
    private confidenceThreshold: number = 0.8;

    constructor(wallet?: Wallet) {
        this.wallet = wallet;
        this.isEnabled = !!wallet;
    }

    setMaxTradeAmount(amount: string): void {
        this.maxTradeAmount = parseEther(amount);
    }

    setConfidenceThreshold(threshold: number): void {
        this.confidenceThreshold = threshold;
    }

    async processTradingSignal(signal: TradingSignal): Promise<boolean> {
        if (!this.isEnabled || !this.wallet) {
            console.log('Copy trading disabled - no wallet configured');
            return false;
        }

        if (signal.confidence < this.confidenceThreshold) {
            console.log(`Signal confidence ${signal.confidence} below threshold ${this.confidenceThreshold}`);
            return false;
        }

        try {
            console.log(`🔄 Processing copy trade signal for ${signal.action}`);
            
            switch (signal.action) {
                case 'BUY':
                    return await this.executeBuyOrder(signal);
                case 'SELL':
                    return await this.executeSellOrder(signal);
                default:
                    console.log('Unsupported trading action:', signal.action);
                    return false;
            }
        } catch (error) {
            console.error('Copy trading error:', error);
            return false;
        }
    }

    private async executeBuyOrder(signal: TradingSignal): Promise<boolean> {
        if (!this.wallet) return false;

        // Calculate trade amount (percentage of signal amount)
        const signalAmount = BigInt(signal.amount);
        const tradeAmount = signalAmount > this.maxTradeAmount 
            ? this.maxTradeAmount 
            : signalAmount;

        console.log(`Executing BUY order: ${tradeAmount.toString()} wei`);

        // For demo, we'll just log the trade
        // In production, this would interact with Uniswap
        console.log('🚨 DEMO: Would buy token', signal.token, 'for', tradeAmount.toString());
        
        // Example Uniswap interaction (commented out for safety)
        /*
        const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
        const router = new Contract(routerAddress, UNISWAP_ROUTER_ABI, this.wallet);
        
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min
        const path = ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', signal.token]; // WETH to token
        
        const tx = await router.swapExactETHForTokens(
            0, // Accept any amount of tokens
            path,
            this.wallet.address,
            deadline,
            { value: tradeAmount }
        );
        
        console.log('Buy transaction sent:', tx.hash);
        */

        return true;
    }

    private async executeSellOrder(signal: TradingSignal): Promise<boolean> {
        if (!this.wallet) return false;

        console.log(`Executing SELL order for token: ${signal.token}`);
        
        // Demo sell order
        console.log('🚨 DEMO: Would sell token', signal.token);
        
        return true;
    }

    async getBalance(): Promise<string> {
        if (!this.wallet) return '0';
        
        const balance = await this.wallet.provider?.getBalance(this.wallet.address);
        return balance?.toString() || '0';
    }

    isActive(): boolean {
        return this.isEnabled && !!this.wallet;
    }

    getSettings() {
        return {
            enabled: this.isEnabled,
            maxTradeAmount: this.maxTradeAmount.toString(),
            confidenceThreshold: this.confidenceThreshold,
            hasWallet: !!this.wallet
        };
    }
}