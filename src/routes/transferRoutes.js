import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { recordTransfer } from '../services/transactionService.js';
import pool from '../config/db.js';

const router = Router();

router.post('/', auth, authorizeRoles('Admin','BaseCommander','LogisticsOfficer'), audit, async (req, res) => {
  const { from_base_id, to_base_id, asset_id, quantity, remarks } = req.body;
  if (req.user.role_name !== 'Admin' && Number(req.user.base_id) !== Number(from_base_id)) {
    return res.status(403).json({ message: 'Not your base (from)' });
  }
  const out = await recordTransfer({ from_base_id, to_base_id, asset_id, quantity, user_id: req.user.user_id, remarks });
  res.json(out);
});

router.get('/', auth, async (req, res) => {
  const scoped = (req.user.role_name === 'Admin') ? req.query.base_id : req.user.base_id;
  const [rows] = await pool.query(`
    SELECT t.transaction_id, t.transaction_type, t.quantity, t.created_at,
           t.base_id, t.related_base, a.asset_name, a.asset_type
    FROM transactions t
    JOIN assets a ON a.asset_id = t.asset_id
    WHERE t.transaction_type IN ('TransferIn','TransferOut')
      AND (? IS NULL OR t.base_id = ?)
    ORDER BY t.created_at DESC
  `, [scoped || null, scoped || null])
  res.json(rows);
});

export default router;
