import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Trader, Transaction } from './types/trader';
import { config } from './config';

export class Database {
    private db: sqlite3.Database;

    constructor(dbPath?: string) {
        const path = dbPath || config.dbPath;
        this.db = new sqlite3.Database(path);
        this.init();
    }

    private async init(): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        
        await run(`
            CREATE TABLE IF NOT EXISTS traders (
                address TEXT PRIMARY KEY,
                name TEXT,
                total_profit REAL DEFAULT 0,
                win_rate REAL DEFAULT 0,
                last_active TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS transactions (
                hash TEXT PRIMARY KEY,
                from_address TEXT,
                to_address TEXT,
                value TEXT,
                block_number INTEGER,
                timestamp TEXT,
                gas_price TEXT,
                gas_used TEXT,
                token_address TEXT,
                token_amount TEXT,
                dex_name TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS trading_signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trader TEXT,
                transaction_hash TEXT,
                confidence REAL,
                action TEXT,
                token TEXT,
                amount TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    async addTrader(trader: Trader): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        
        await run(`
            INSERT OR REPLACE INTO traders 
            (address, name, total_profit, win_rate, last_active, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            trader.address,
            trader.name,
            trader.totalProfit,
            trader.winRate,
            trader.lastActive.toISOString(),
            trader.isActive ? 1 : 0
        ]);
    }

    async getTrader(address: string): Promise<Trader | null> {
        const get = promisify(this.db.get.bind(this.db));
        
        const row: any = await get(
            'SELECT * FROM traders WHERE address = ?',
            [address]
        );

        if (!row) return null;

        return {
            address: row.address,
            name: row.name,
            totalProfit: row.total_profit,
            winRate: row.win_rate,
            lastActive: new Date(row.last_active),
            isActive: row.is_active === 1
        };
    }

    async saveTransaction(tx: Transaction): Promise<void> {
        const run = promisify(this.db.run.bind(this.db));
        
        await run(`
            INSERT OR REPLACE INTO transactions
            (hash, from_address, to_address, value, block_number, timestamp, 
             gas_price, gas_used, token_address, token_amount, dex_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            tx.hash,
            tx.from,
            tx.to,
            tx.value,
            tx.blockNumber,
            tx.timestamp.toISOString(),
            tx.gasPrice,
            tx.gasUsed,
            tx.tokenAddress,
            tx.tokenAmount,
            tx.dexName
        ]);
    }

    async getRecentTransactions(limit: number = 50): Promise<Transaction[]> {
        const all = promisify(this.db.all.bind(this.db));
        
        const rows: any[] = await all(`
            SELECT * FROM transactions 
            ORDER BY block_number DESC 
            LIMIT ?
        `, [limit]);

        return rows.map(row => ({
            hash: row.hash,
            from: row.from_address,
            to: row.to_address,
            value: row.value,
            blockNumber: row.block_number,
            timestamp: new Date(row.timestamp),
            gasPrice: row.gas_price,
            gasUsed: row.gas_used,
            tokenAddress: row.token_address,
            tokenAmount: row.token_amount,
            dexName: row.dex_name
        }));
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}