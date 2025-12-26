export async function checkUidExists(pool, uid) {
  let conn;
  try {
    conn = await pool.getConnection();
    const [configureRows] = await conn.query('SELECT 1 FROM `configure` WHERE `uid` = ? LIMIT 1', [uid]);
    if (configureRows.length === 0) {
      if (conn) conn.release();
      return false;
    }
    if (conn) conn.release();
    return true;
  } catch (err) {
    if (conn) conn.release();
    throw err;
  }
}

// Fetches the latest configure row per UID, merges all ld_details arrays, and returns the merged JSON array string
export async function getMergedLdDetailsJson(pool) {
  let conn;
  try {
    conn = await pool.getConnection();
    // Get only the latest configure row for each UID
    const [rows] = await conn.query(`
      SELECT c.*
      FROM configure c
      WHERE c.date = (
        SELECT MAX(c2.date)
        FROM configure c2
        WHERE c2.uid = c.uid
      )
    `);

    // Merge ld_details from all rows
    const wattMap = {};
    for (const row of rows) {
      let ldDetails = [];
      try {
        if (typeof row.ld_details === 'string') {
          ldDetails = JSON.parse(row.ld_details);
        } else if (Array.isArray(row.ld_details)) {
          ldDetails = row.ld_details;
        }
      } catch (e) {
        // skip invalid JSON
        continue;
      }
      for (const item of ldDetails) {
        if (!item || typeof item.ld_watt === 'undefined' || typeof item.ld_count === 'undefined') continue;
        const watt = String(item.ld_watt);
        const count = Number(item.ld_count) || 0;
        if (!wattMap[watt]) {
          wattMap[watt] = 0;
        }
        wattMap[watt] += count;
      }
    }

    // Build the merged array
    const merged = Object.entries(wattMap).map(([ld_watt, ld_count]) => ({ ld_watt, ld_count }));
    return JSON.stringify(merged);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}
