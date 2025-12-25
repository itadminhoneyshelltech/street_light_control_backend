import { getOverallSummary } from './frontend_overallsummary.js';

// Setup /api/home endpoint for homepage summary
export function setupFrontendHome(app, pool) {
  app.get('/api/home', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const data = await getOverallSummary(conn);
      return res.json({ status: 'success', data });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({
        status: 'error',
        error_status: 'db_query_failed',
        message: err.message,
      });
    } finally {
      if (conn) conn.release();
    }
  });
}
