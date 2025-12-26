// Helper function to get overall summary data
export async function getOverallSummary(conn) {
  // Get total count of devices
  const [countResult] = await conn.query(
    'SELECT COUNT(DISTINCT uid) as total_cccms_count FROM `configure`'
  );
  const total_cccms_count = countResult[0]?.total_cccms_count || 0;
  
  // Get total watts
  const [wattsResult] = await conn.query(
    'SELECT SUM(watts) as total_watts FROM `configure`'
  );
  const total_watts = wattsResult[0]?.total_watts || 0;
  
  // Get online devices count
  const [statusOnlineResult] = await conn.query(
    'SELECT COUNT(DISTINCT uid) as online_count FROM `status` WHERE CCMS_STATUS = "online"'
  );
  const online_count = statusOnlineResult[0]?.online_count || 0;
  
  // Get error devices count
  const [errorResult] = await conn.query(
    'SELECT COUNT(DISTINCT uid) as error_count FROM `status` WHERE status = "error"'
  );
  const error_count = errorResult[0]?.error_count || 0;
  
  // Calculate derived metrics
  const offline_count = total_cccms_count - online_count;
/**
 * Represents the total number of street lights that are currently turned on.
 * @type {number}
 
  const total_lights_On = online_count;
  const total_lights_Off = offline_count;
  const total_not_connected = offline_count;
  const total_faulty = error_count;
 */

    const total_ccms = 134;
    const total_ccms_on=0;
    const total_ccms_off=131;
    const total_ccms_not_comm=3;
    const total_ccms_working_per=((total_ccms_on/total_ccms)*100).toFixed(2);
    const total_ccms_faulty_per=((total_ccms_off/total_ccms)*100).toFixed(2);

    const total_energy_saved_today_per = 47.8;
    const cumulative_energy_saved = 2445609;

    const total_lamps= 6527;
    const total_lamps_on= 4393;
    const total_lamps_off= 2134;
    const total_lamps_not_connected= 0;
    const total_lamps_faulty= 123;
    const total_lamps_faulty_per = ((total_lamps_faulty/total_lamps)*100).toFixed(2);
    const total_lamps_working_per = ((total_lamps_on/total_lamps)*100).toFixed(2);

  return {
    total_ccms: total_ccms,
    total_ccms_on: total_ccms_on,
    total_ccms_off: total_ccms_off,     
    total_ccms_not_comm: total_ccms_not_comm,
    total_ccms_working_per: total_ccms_working_per,
    total_ccms_faulty_per: total_ccms_faulty_per, 

    total_energy_saved_today_per: total_energy_saved_today_per,
    cumulative_energy_saved: cumulative_energy_saved,
    
    total_lamps: total_lamps,
    total_lamps_on: total_lamps_on,
    total_lamps_off: total_lamps_off,
    total_lamps_not_connected: total_lamps_not_connected,
    total_lamps_faulty: total_lamps_faulty,
    total_lamps_faulty_per: total_lamps_faulty_per,
    total_lamps_working_per: total_lamps_working_per
  };
}

export function setupFrontendOverallSummary(app, pool) {
  
  // GET /api/overall-summary - Overall summary of all devices
  app.get('/api/overall-summary', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const responseData = await getOverallSummary(conn);
      
      return res.json({
        status: 'success',
        data: responseData
      });
      
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ 
        status: 'error', 
        error_status: 'db_query_failed',
        message: err.message 
      });
    } finally {
      if (conn) conn.release();
    }
  });
}
