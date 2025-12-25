import { getOverallSummary } from './frontend_overallsummary.js';


export async function getTotalLampList(conn) {
  // Get all lamp-related columns for all devices
  const [lampRows] = await conn.query(
    'SELECT uid, ld_watt1_count, ld_watt2_count, ld_watt3_count, ld_watt4_count, ld_watt5_count, ld_watt6_count FROM `configure`'
  );

  // Get status for all devices
  const [statusRows] = await conn.query(
    'SELECT uid, CCMS_STATUS, status FROM `status` WHERE event = "periodic_status" OR event = "get_config"'
  );

  // Calculate total lamps
  let totalLamps = 0;
  lampRows.forEach(row => {
    totalLamps += (row.ld_watt1_count || 0) + (row.ld_watt2_count || 0) + (row.ld_watt3_count || 0) + (row.ld_watt4_count || 0) + (row.ld_watt5_count || 0) + (row.ld_watt6_count || 0);
  });

  // Map status by uid
  const statusMap = {};
  statusRows.forEach(row => {
    statusMap[row.uid] = row;
  });

  let onLamps = 0, offLamps = 0, notConnectedLamps = 0, faultyLamps = 0;
  lampRows.forEach(row => {
    const lampCount = (row.ld_watt1_count || 0) + (row.ld_watt2_count || 0) + (row.ld_watt3_count || 0) + (row.ld_watt4_count || 0) + (row.ld_watt5_count || 0) + (row.ld_watt6_count || 0);
    const status = statusMap[row.uid];
    if (!status) {
      notConnectedLamps += lampCount;
    } else if (status.CCMS_STATUS === 'online') {
      onLamps += lampCount;
      if (status.status === 'error') faultyLamps += lampCount;
    } else if (status.CCMS_STATUS === 'offline') {
      offLamps += lampCount;
    } else {
      notConnectedLamps += lampCount;
    }
  });

  // Calculate percentages
  const percent = v => totalLamps ? ((v / totalLamps) * 100).toFixed(2) : '0.00';

  return {
    total_lamps: totalLamps,
    on_lamps: onLamps,
    off_lamps: offLamps,
    not_connected_lamps: notConnectedLamps,
    faulty_lamps: faultyLamps,
    percent_on: percent(onLamps),
    percent_off: percent(offLamps),
    percent_not_connected: percent(notConnectedLamps),
    percent_faulty: percent(faultyLamps)
  };
}

export function setupFrontendTotalLamp(app, pool) {
  app.get('/api/total-lamp-list', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const data = await getTotalLampList(conn);
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    } finally {
      if (conn) conn.release();
    }
  });
}
