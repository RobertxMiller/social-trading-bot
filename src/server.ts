import express from 'express';
import { TraderMonitor } from './services/traderMonitor';
import { config } from './config';

export class ApiServer {
    private app: express.Application;
    private monitor: TraderMonitor;

    constructor(monitor: TraderMonitor) {
        this.app = express();
        this.monitor = monitor;
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        // Basic CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    private setupRoutes(): void {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        // Get monitoring stats
        this.app.get('/api/stats', async (req, res) => {
            try {
                const stats = await this.monitor.getStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: 'Failed to get stats' });
            }
        });

        // Get watched traders
        this.app.get('/api/traders', (req, res) => {
            const traders = this.monitor.getWatchedTraders();
            res.json({ traders, count: traders.length });
        });

        // Add trader to watch list
        this.app.post('/api/traders', (req, res) => {
            const { address } = req.body;
            if (!address) {
                return res.status(400).json({ error: 'Address required' });
            }
            
            this.monitor.addTrader(address);
            res.json({ message: 'Trader added', address });
        });

        // Simple dashboard
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Social Trading Bot</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                        .online { background-color: #d4edda; border: 1px solid #c3e6cb; }
                        .offline { background-color: #f8d7da; border: 1px solid #f5c6cb; }
                        .stats { display: flex; gap: 20px; margin: 20px 0; }
                        .stat-box { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>🚀 Social Trading Bot</h1>
                    <div id="status" class="status">Loading...</div>
                    <div class="stats" id="stats">Loading stats...</div>
                    
                    <h3>Watched Traders</h3>
                    <div id="traders">Loading...</div>
                    
                    <script>
                        async function loadStats() {
                            try {
                                const res = await fetch('/api/stats');
                                const stats = await res.json();
                                
                                document.getElementById('status').innerHTML = 
                                    stats.isMonitoring 
                                        ? '<span class="online">🟢 Bot is running</span>'
                                        : '<span class="offline">🔴 Bot is offline</span>';
                                
                                document.getElementById('stats').innerHTML = 
                                    '<div class="stat-box"><strong>' + stats.watchedTraders + '</strong><br>Traders</div>' +
                                    '<div class="stat-box"><strong>' + stats.recentTransactions + '</strong><br>Recent TXs</div>';
                            } catch (e) {
                                document.getElementById('status').innerHTML = '<span class="offline">🔴 API Error</span>';
                            }
                        }
                        
                        async function loadTraders() {
                            try {
                                const res = await fetch('/api/traders');
                                const data = await res.json();
                                
                                document.getElementById('traders').innerHTML = 
                                    data.traders.map(addr => '<code>' + addr + '</code>').join('<br>');
                            } catch (e) {
                                document.getElementById('traders').innerHTML = 'Error loading traders';
                            }
                        }
                        
                        loadStats();
                        loadTraders();
                        setInterval(loadStats, 5000);
                    </script>
                </body>
                </html>
            `);
        });
    }

    start(): void {
        this.app.listen(config.port, () => {
            console.log(`🌐 API server running on http://localhost:${config.port}`);
        });
    }
}