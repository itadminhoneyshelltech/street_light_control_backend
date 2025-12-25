import { getOverallSummary } from './frontend_overallsummary.js';

export async function getEnergyReport(conn) {
  // Example: Sum of watts and count per watt type
  const [rows] = await conn.query(
    'SELECT SUM(ld_watt1 * ld_watt1_count) as watt1_energy, SUM(ld_watt2 * ld_watt2_count) as watt2_energy, SUM(ld_watt3 * ld_watt3_count) as watt3_energy, SUM(ld_watt4 * ld_watt4_count) as watt4_energy, SUM(ld_watt5 * ld_watt5_count) as watt5_energy, SUM(ld_watt6 * ld_watt6_count) as watt6_energy FROM `configure`'
  );
  return rows[0];
}

export function setupFrontendEnergyReport(app, pool) {
  app.get('/api/energy-report', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const data = await getEnergyReport(conn);
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    } finally {
      if (conn) conn.release();
    }
  });
}
