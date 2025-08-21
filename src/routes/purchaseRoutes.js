import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { recordPurchase } from '../services/transactionService.js';
import pool from '../config/db.js';

const router = Router();

router.post('/', auth, authorizeRoles('Admin','BaseCommander','LogisticsOfficer'), audit, async (req, res) => {
  const { base_id, asset_id, quantity, remarks } = req.body;
  if (req.user.role_name !== 'Admin' && Number(req.user.base_id) !== Number(base_id)) {
    return res.status(403).json({ message: 'Not your base' });
  }
  const out = await recordPurchase({ base_id, asset_id, quantity, user_id: req.user.user_id, remarks });
  res.json(out);
});

router.get('/', auth, async (req, res) => {
  const { base_id, asset_type, start_date, end_date } = req.query;
  const params = [];
  let where = "WHERE t.transaction_type='Purchase'";
  const scoped = (req.user.role_name === 'Admin') ? base_id : req.user.base_id;
  if (scoped) { where += ' AND t.base_id=?'; params.push(scoped); }
  if (asset_type) { where += ' AND a.asset_type=?'; params.push(asset_type); }
  if (start_date) { where += ' AND t.created_at >= ?'; params.push(start_date); }
  if (end_date) { where += ' AND t.created_at <= ?'; params.push(end_date); }

  const [rows] = await pool.query(`
    SELECT t.*, a.asset_name, a.asset_type
    FROM transactions t
    JOIN assets a ON a.asset_id = t.asset_id
    ${where}
    ORDER BY t.created_at DESC
  `, params);
  res.json(rows);
});

export default router;
