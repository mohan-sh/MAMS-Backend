import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { scopeToBase } from '../middleware/rbac.js';
import pool from '../config/db.js';
import { getDashboardMetrics } from '../services/dashboardService.js';

const router = Router();

router.get('/', auth, scopeToBase, async (req, res) => {
  const { asset_type, start_date, end_date } = req.query;
  const base_id = req.scopedBaseId || null;
  const data = await getDashboardMetrics({ base_id, asset_type, start_date, end_date });
  console.log('Data being sent from backend:', data, 'Type of closing_balance:', typeof data.closing_balance);
  res.json(data);
});

router.get('/net-movement-detail', auth, scopeToBase, async (req, res) => {
  const { asset_type, start_date, end_date } = req.query;
  const params = [];
  let where = 'WHERE 1=1';
  if (req.scopedBaseId) { where += ' AND t.base_id=?'; params.push(req.scopedBaseId); }
  if (asset_type) { where += ' AND a.asset_type=?'; params.push(asset_type); }
  if (start_date) { where += ' AND t.created_at >= ?'; params.push(start_date); }
  if (end_date) { where += ' AND t.created_at <= ?'; params.push(end_date); }

  const [rows] = await pool.query(`
    SELECT t.transaction_id, t.transaction_type, t.quantity, t.created_at, t.related_base,
           a.asset_name, a.asset_type
    FROM transactions t
    JOIN assets a ON a.asset_id = t.asset_id
    ${where}
    AND t.transaction_type IN ('Purchase','TransferIn','TransferOut')
    ORDER BY t.created_at DESC
  `, params);
  res.json(rows);
});

export default router;
