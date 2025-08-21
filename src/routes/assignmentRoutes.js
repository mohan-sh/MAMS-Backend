import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { recordAssignment, recordExpenditure } from '../services/transactionService.js';
import pool from '../config/db.js';

const router = Router();

router.post('/assign', auth, authorizeRoles('Admin','BaseCommander'), audit, async (req, res) => {
  const { base_id, asset_id, quantity, remarks } = req.body;
  if (req.user.role_name !== 'Admin' && Number(req.user.base_id) !== Number(base_id)) {
    return res.status(403).json({ message: 'Not your base' });
  }
  const out = await recordAssignment({ base_id, asset_id, quantity, user_id: req.user.user_id, remarks });
  res.json(out);
});

router.post('/expend', auth, authorizeRoles('Admin','BaseCommander'), audit, async (req, res) => {
  const { base_id, asset_id, quantity, remarks } = req.body;
  if (req.user.role_name !== 'Admin' && Number(req.user.base_id) !== Number(base_id)) {
    return res.status(403).json({ message: 'Not your base' });
  }
  const out = await recordExpenditure({ base_id, asset_id, quantity, user_id: req.user.user_id, remarks });
  res.json(out);
});

router.get('/', auth, async (req, res) => {
  const scoped = (req.user.role_name === 'Admin') ? req.query.base_id : req.user.base_id;
  const [rows] = await pool.query(`
    SELECT t.*, a.asset_name, a.asset_type
    FROM transactions t
    JOIN assets a ON a.asset_id = t.asset_id
    WHERE t.transaction_type IN ('Assignment','Expenditure')
      AND (? IS NULL OR t.base_id = ?)
    ORDER BY t.created_at DESC
  `, [scoped || null, scoped || null]);
  res.json(rows);
});

export default router;
