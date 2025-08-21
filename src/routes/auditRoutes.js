import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import pool from '../config/db.js';

const router = Router();
router.get('/', auth, authorizeRoles('Admin'), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
  res.json(rows);
});

export default router;
