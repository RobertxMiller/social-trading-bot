#!/usr/bin/env node

import { Web3Provider } from './web3Provider';

async function main() {
    console.log('🚀 Social Trading Bot starting...');
    
    try {
        const web3 = new Web3Provider();
        const latestBlock = await web3.getLatestBlock();
        console.log(`Connected to Ethereum. Latest block: ${latestBlock}`);
        
        // TODO: Initialize bot components
        // TODO: Start monitoring traders
        
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