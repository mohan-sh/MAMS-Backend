import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import pool from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import baseRoutes from './routes/baseRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.locals.db = pool;


app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await req.app.locals.db.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/health', (req, res)=> res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/bases', baseRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/audit', auditRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Backend listening on http://localhost:${PORT}`));
