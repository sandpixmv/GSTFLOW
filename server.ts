import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { 
  testNeonConnection, 
  initNeonTables, 
  syncLedgerToNeon, 
  fetchLedgerFromNeon,
  getNeonDatabaseUrl 
} from './src/db/neon.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // Neon PostgreSQL API Routes
  app.get('/api/neon/status', async (req, res) => {
    try {
      const status = await testNeonConnection();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message });
    }
  });

  app.post('/api/neon/test-connection', async (req, res) => {
    try {
      const { databaseUrl } = req.body;
      const status = await testNeonConnection(databaseUrl);
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message });
    }
  });

  app.post('/api/neon/init-tables', async (req, res) => {
    try {
      const { databaseUrl } = req.body;
      const result = await initNeonTables(databaseUrl);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/neon/sync', async (req, res) => {
    try {
      const { payload, databaseUrl } = req.body;
      if (!payload) {
        return res.status(400).json({ error: 'Payload missing' });
      }
      const result = await syncLedgerToNeon(payload, databaseUrl);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.get('/api/neon/ledger', async (req, res) => {
    try {
      const ledger = await fetchLedgerFromNeon();
      res.json(ledger);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Mount Vite development middlewares
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaxFlow Maldives server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
