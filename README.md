# Social Trading Bot

A Web3 social trading bot that monitors and follows successful on-chain traders.

## Features
- ✅ Monitor whale traders and analyze their transactions
- ✅ Real-time trading signal generation  
- ✅ SQLite database for transaction history
- ✅ REST API with live stats
- ✅ Simple web dashboard
- ✅ Copy trading functionality (demo mode)
- 🔄 Multi-DEX support (Uniswap integrated)

## Tech Stack
- Node.js & TypeScript
- Ethers.js for blockchain interaction
- Express.js REST API
- SQLite database
- HTML/JS dashboard

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run in development**
   ```bash
   npm run dev
   ```

4. **Open dashboard**
   ```
   http://localhost:3000
   ```

## Configuration

The bot works out of the box with default settings. For advanced usage:

- `RPC_URL`: Ethereum RPC endpoint (defaults to public endpoint)
- `PRIVATE_KEY`: Wallet private key for copy trading (optional)
- `PORT`: API server port (default: 3000)
- `DB_PATH`: SQLite database file path

## Copy Trading

- Set `PRIVATE_KEY` in .env to enable copy trading
- Trades are executed in demo mode by default (for safety)
- Configure max trade amount and confidence threshold via API
- Real trading requires uncommenting Uniswap integration code

## Monitored Traders

The bot monitors a default list of successful traders. Add more via:
- Web dashboard
- API: `POST /api/traders` with `{"address": "0x..."}`

## API Endpoints

- `GET /health` - Health check
- `GET /api/stats` - Bot statistics and status
- `GET /api/traders` - List of monitored traders
- `POST /api/traders` - Add new trader to watch

## Architecture

```
src/
├── index.ts           # Main entry point
├── config.ts          # Configuration management
├── database.ts        # SQLite database layer
├── web3Provider.ts    # Ethereum connection
├── server.ts          # API server & dashboard
├── services/
│   ├── traderMonitor.ts   # Transaction monitoring
│   └── copyTrading.ts     # Copy trading logic
└── types/
    └── trader.ts      # Type definitions
```

## Development

```bash
npm run dev    # Development with ts-node
npm run build  # Compile to JavaScript
npm start      # Run compiled version
```

## Safety Notice

This is educational/demo software. For live trading:
- Review all code carefully
- Test on testnets first
- Use small amounts
- Monitor trades closely
- Understand the risks

## License

MIT