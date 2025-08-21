import pool from '../config/db.js';

export function audit(req, res, next) {
  const send = res.json.bind(res);
  res.json = async (body) => {
    try {
      const uid = req.user?.user_id || null;
      await pool.query(
        'INSERT INTO audit_logs (user_id, action, method, path, payload) VALUES (?, ?, ?, ?, ?)',
        [uid, `${req.method} ${req.originalUrl}`, req.method, req.originalUrl, JSON.stringify(req.body || {})]
      );
    } catch (e) {
      console.error('Audit error:', e.message);
    }
    return send(body);
  };
  next();
}
