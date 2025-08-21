// import pool from '../config/db.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// export async function login(req, res) {
//   const { username, password } = req.body;
//   const [rows] = await pool.query(
//     `SELECT u.user_id, u.username, u.password_hash, r.role_name, u.base_id
//      FROM users u JOIN roles r ON r.role_id = u.role_id
//      WHERE u.username=?`, [username]
//   );
//   if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
//   const u = rows[0];
//   const ok = await bcrypt.compare(password, u.password_hash);
//   if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
//   const token = jwt.sign({ user_id: u.user_id, role_name: u.role_name, base_id: u.base_id }, process.env.JWT_SECRET, { expiresIn: '8h' });
//   res.json({ token, user_id: u.user_id, role_name: u.role_name, base_id: u.base_id, username: u.username });
// }


import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.password_hash, r.role_name, u.base_id
       FROM users u JOIN roles r ON r.role_id = u.role_id
       WHERE u.username=?`, [username]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign(
      { user_id: u.user_id, role_name: u.role_name, base_id: u.base_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user_id: u.user_id,
      role_name: u.role_name,
      base_id: u.base_id,
      username: u.username
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
