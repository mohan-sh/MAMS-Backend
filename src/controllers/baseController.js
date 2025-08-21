import pool from '../config/db.js';
export async function listBases(req, res) {
  const [rows] = await pool.query('SELECT base_id, base_name, location FROM bases ORDER BY base_name');
  res.json(rows);
}
