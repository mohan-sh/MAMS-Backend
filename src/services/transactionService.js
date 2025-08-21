import pool from '../config/db.js';

export async function recordPurchase({ base_id, asset_id, quantity, user_id, remarks }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO transactions (base_id, asset_id, transaction_type, quantity, created_by, remarks) VALUES (?, ?, "Purchase", ?, ?, ?)',
      [base_id, asset_id, quantity, user_id, remarks || null]
    );
    const [inv] = await conn.query('SELECT inventory_id, closing_balance FROM inventory WHERE base_id=? AND asset_id=? FOR UPDATE', [base_id, asset_id]);
    if (inv.length) {
      await conn.query('UPDATE inventory SET closing_balance=?, last_updated=NOW() WHERE inventory_id=?', [inv[0].closing_balance + quantity, inv[0].inventory_id]);
    } else {
      await conn.query('INSERT INTO inventory (base_id, asset_id, opening_balance, closing_balance) VALUES (?, ?, 0, ?)', [base_id, asset_id, quantity]);
    }
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback(); throw e;
  } finally { conn.release(); }
}

export async function recordTransfer({ from_base_id, to_base_id, asset_id, quantity, user_id, remarks }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [src] = await conn.query('SELECT inventory_id, closing_balance FROM inventory WHERE base_id=? AND asset_id=? FOR UPDATE', [from_base_id, asset_id]);
    const srcBal = src.length ? src[0].closing_balance : 0;
    if (srcBal < quantity) throw new Error('Insufficient stock at source base');
    await conn.query('UPDATE inventory SET closing_balance=? WHERE inventory_id=?', [srcBal - quantity, src[0].inventory_id]);
    const [dst] = await conn.query('SELECT inventory_id, closing_balance FROM inventory WHERE base_id=? AND asset_id=? FOR UPDATE', [to_base_id, asset_id]);
    if (dst.length) await conn.query('UPDATE inventory SET closing_balance=? WHERE inventory_id=?', [dst[0].closing_balance + quantity, dst[0].inventory_id]);
    else await conn.query('INSERT INTO inventory (base_id, asset_id, opening_balance, closing_balance) VALUES (?, ?, 0, ?)', [to_base_id, asset_id, quantity]);
    await conn.query(
      'INSERT INTO transactions (base_id, asset_id, transaction_type, quantity, related_base, created_by, remarks) VALUES (?, ?, "TransferOut", ?, ?, ?, ?)',
      [from_base_id, asset_id, quantity, to_base_id, user_id, remarks || null]
    );
    await conn.query(
      'INSERT INTO transactions (base_id, asset_id, transaction_type, quantity, related_base, created_by, remarks) VALUES (?, ?, "TransferIn", ?, ?, ?, ?)',
      [to_base_id, asset_id, quantity, from_base_id, user_id, remarks || null]
    );
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback(); throw e;
  } finally { conn.release(); }
}

export async function recordAssignment({ base_id, asset_id, quantity, user_id, remarks }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [inv] = await conn.query('SELECT inventory_id, closing_balance FROM inventory WHERE base_id=? AND asset_id=? FOR UPDATE', [base_id, asset_id]);
    const bal = inv.length ? inv[0].closing_balance : 0;
    if (bal < quantity) throw new Error('Insufficient stock to assign');
    await conn.query('UPDATE inventory SET closing_balance=? WHERE inventory_id=?', [bal - quantity, inv[0].inventory_id]);
    await conn.query(
      'INSERT INTO transactions (base_id, asset_id, transaction_type, quantity, created_by, remarks) VALUES (?, ?, "Assignment", ?, ?, ?)',
      [base_id, asset_id, quantity, user_id, remarks || null]
    );
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback(); throw e;
  } finally { conn.release(); }
}

export async function recordExpenditure({ base_id, asset_id, quantity, user_id, remarks }) {
  await pool.query(
    'INSERT INTO transactions (base_id, asset_id, transaction_type, quantity, created_by, remarks) VALUES (?, ?, "Expenditure", ?, ?, ?)',
    [base_id, asset_id, quantity, user_id, remarks || null]
  );
  return { ok: true };
}
