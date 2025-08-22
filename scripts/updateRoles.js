import pool from '../src/config/db.js';

async function updateAdminPassword() {
  try {
    // await pool.query(`USE ${process.env.DB_NAME}`); // select the database first

    const sql = `
      UPDATE users
      SET password_hash = '$2b$10$sSd8.et0rPTFxnlsd3tSdelg4nSBh83BuWGRyvMw7KF7Oy7wtJDaq'
      WHERE username = 'admin';
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
