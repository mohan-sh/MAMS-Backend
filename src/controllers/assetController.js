import pool from '../config/db.js';
export async function listAssets(req, res) {
  const [rows] = await pool.query('SELECT asset_id, asset_name, asset_type, unit FROM assets ORDER BY asset_name');
  res.json(rows);
}
