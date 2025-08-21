import pool from '../config/db.js';

export async function getDashboardMetrics({ base_id, asset_type, start_date, end_date }) {
  const params = [];
  let where = 'WHERE 1=1';
  if (base_id) { where += ' AND t.base_id=?'; params.push(base_id); }
  if (asset_type) { where += ' AND a.asset_type=?'; params.push(asset_type); }
  if (start_date) { where += ' AND t.created_at >= ?'; params.push(start_date); }
  if (end_date) { where += ' AND t.created_at <= ?'; params.push(end_date); }

  const [rows] = await pool.query(`
    SELECT
      SUM(CASE WHEN t.transaction_type='Purchase'   THEN t.quantity ELSE 0 END) AS purchases,
      SUM(CASE WHEN t.transaction_type='TransferIn' THEN t.quantity ELSE 0 END) AS transfer_in,
      SUM(CASE WHEN t.transaction_type='TransferOut'THEN t.quantity ELSE 0 END) AS transfer_out,
      SUM(CASE WHEN t.transaction_type='Assignment' THEN t.quantity ELSE 0 END) AS assigned,
      SUM(CASE WHEN t.transaction_type='Expenditure'THEN t.quantity ELSE 0 END) AS expended
    FROM transactions t
    JOIN assets a ON a.asset_id = t.asset_id
    ${where}
  `, params);

  const agg = rows[0] || {};
  const net_movement = Number(agg.purchases || 0) + Number(agg.transfer_in || 0) - Number(agg.transfer_out || 0) - Number(agg.assigned || 0) - Number(agg.expended || 0);

  let opening = 0;
  if (start_date) {
    const beforeParams = [start_date];
    let beforeWhere = 'WHERE t.created_at < ?';
    if (base_id) { beforeWhere += ' AND t.base_id=?'; beforeParams.push(base_id); }
    if (asset_type) { beforeWhere += ' AND a.asset_type=?'; beforeParams.push(asset_type); }
    const [before] = await pool.query(`
      SELECT
        SUM(CASE WHEN t.transaction_type IN ('Purchase','TransferIn') THEN t.quantity
                 WHEN t.transaction_type IN ('TransferOut','Assignment') THEN -t.quantity
                 ELSE 0 END) AS delta
      FROM transactions t
      JOIN assets a ON a.asset_id = t.asset_id
      ${beforeWhere}
    `, beforeParams);
    const delta = before[0]?.delta || 0;
    const [invStart] = await pool.query(
      base_id ? 'SELECT SUM(opening_balance) AS opening_seed FROM inventory WHERE base_id=?' :
                'SELECT SUM(opening_balance) AS opening_seed FROM inventory'
      , base_id ? [base_id] : []
    );
    const seed = invStart[0]?.opening_seed || 0;
    opening = seed + delta;
  } else {
    const [cur] = await pool.query(
      base_id ? 'SELECT SUM(closing_balance) AS closing FROM inventory WHERE base_id=?' :
                'SELECT SUM(closing_balance) AS closing FROM inventory',
      base_id ? [base_id] : []
    );
    // Raw closing balance from DB: 1060
    opening = Number(cur[0]?.closing) || 0;
  }

  const closing = opening + net_movement;

  console.log('Aggregated transaction data:', agg);
  console.log('Calculated net_movement:', net_movement);

  return {
    opening_balance: opening,
    closing_balance: closing,
    net_movement,
    breakdown: {
      purchases: agg.purchases || 0,
      transfer_in: agg.transfer_in || 0,
      transfer_out: agg.transfer_out || 0,
      assigned: agg.assigned || 0,
      expended: agg.expended || 0
    }
  };
}
