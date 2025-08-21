import pool from '../src/config/db.js';

async function updateAdminPassword() {
  try {
    await pool.query('USE military_assets'); // select the database first

    const sql = `
      UPDATE users
      SET password_hash = '$2b$10$ux06wt4A/Nk1E7GJygr7eu47Z0IgCOkJXzfbfsNp4DLZTx9LiGwHC'
      WHERE username = 'log_alpha';
    `;
    
    const [result] = await pool.query(sql);
    console.log('Rows affected:', result.affectedRows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

updateAdminPassword();
