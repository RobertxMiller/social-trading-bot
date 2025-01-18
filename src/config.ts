export interface Config {
    rpcUrl: string;
    privateKey?: string;
    etherscanApiKey?: string;
    port: number;
}

export const config: Config = {
    rpcUrl: process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    privateKey: process.env.PRIVATE_KEY,
    etherscanApiKey: process.env.ETHERSCAN_API_KEY,
    port: parseInt(process.env.PORT || '3000')
};