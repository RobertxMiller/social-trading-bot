#!/usr/bin/env node

import { Web3Provider } from './web3Provider';
import { TraderMonitor } from './services/traderMonitor';

async function main() {
    console.log('🚀 Social Trading Bot starting...');
    
    try {
        const web3 = new Web3Provider();
        const latestBlock = await web3.getLatestBlock();
        console.log(`Connected to Ethereum. Latest block: ${latestBlock}`);
        
        // Initialize trader monitoring
        const monitor = new TraderMonitor(web3.getProvider());
        await monitor.startMonitoring();
        
        console.log('✅ Bot initialized successfully');
        console.log('Monitoring traders:', monitor.getWatchedTraders().length);
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        process.exit(1);
    }
}

main().catch(console.error);

process.on('SIGINT', () => {
    console.log('Bot shutting down...');
    process.exit(0);
});