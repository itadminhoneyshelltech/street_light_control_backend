import { getOverallSummary } from './frontend_overallsummary.js';

export async function getCCMSList(conn) {
  // Example: Get all CCMS device fields
  const [rows] = await conn.query(
    'SELECT uid, zone_ulb, ward, pole, ld_watt1, ld_watt1_count, ld_watt2, ld_watt2_count, ld_watt3, ld_watt3_count, ld_watt4, ld_watt4_count, ld_watt5, ld_watt5_count, ld_watt6, ld_watt6_count FROM `configure`'
  );
  return rows;
}

export function setupFrontendCCMS(app, pool) {
  app.get('/api/ccms_get_detailed_latest_status', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const data = await getCCMSList(conn);
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    } finally {
      if (conn) conn.release();
    }
  });
}
