export function setupConfigure(app, pool) {
  const allowedColumns = [
    'uid', 'rr_no', 'constituency', 'zone_ulb', 'ward', 'pole', 'conn_pole', 'arm', 'lamp_type', 'Board_no', 'watts',
    'location_address', 'service_type', 'mode', 'phone_no', 'imei_no', 'sim_no', 'latitude', 'longitude', 'phase',
    'configured_on_time', 'configured_off_time', 'time_zone', 'event', 'date',
    'ld_watt1', 'ld_watt1_count', 'ld_watt2', 'ld_watt2_count', 'ld_watt3', 'ld_watt3_count',
    'ld_watt4', 'ld_watt4_count', 'ld_watt5', 'ld_watt5_count', 'ld_watt6', 'ld_watt6_count'
  ];

  app.post('/api/configure', async (req, res) => {
    const data = req.body || {};
    const uid = data.uid;
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }   
    console.log('Received configure data for UID:', uid);
    let conn;
    try {
      conn = await pool.getConnection();
      console.log('Database connection established for configure.');
      // Check for existing UID; block duplicates
      const [existing] = await conn.query('SELECT 1 FROM `configure` WHERE `uid` = ? LIMIT 1', [uid]);
      console.log('Existing rows for UID', uid, ':', existing.length);
      if (existing.length > 0) {
        return res.status(409).json({ status: 'error', error_status: 'already_configured' });
      }

      const cols = [];
      const placeholders = [];
      const values = [];

      for (const col of allowedColumns) {
        cols.push(col);
        values.push(data[col] ?? null);
        placeholders.push('?');
      }

      const updateAssignments = allowedColumns
        .filter((c) => c !== 'uid')
        .map((c) => `\`${c}\`=VALUES(\`${c}\`)`)
        .join(',');

      const quotedCols = cols.map((c) => `\`${c}\``);
      const sql = `INSERT INTO \`configure\` (${quotedCols.join(',')}) VALUES (${placeholders.join(',')}) ON DUPLICATE KEY UPDATE ${updateAssignments}`;

      const [result] = await conn.execute(sql, values);
      const mode = result.affectedRows === 1 ? 'insert' : 'update';
      return res.json({ status: 'success', id: result.insertId || null, mode });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_insert_failed' });
    } finally {
      if (conn) conn.release();
    }
  });

  // Reconfigure: insert a new row (no update). Duplicate uid returns already_configured.
  app.post('/api/reconfigure', async (req, res) => {
    const data = req.body || {};
    const uid = data.uid;
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }

    const cols = [];
    const placeholders = [];
    const values = [];
    for (const col of allowedColumns) {
      cols.push(col);
      values.push(data[col] ?? null);
      placeholders.push('?');
    }

    const quotedCols = cols.map((c) => `\`${c}\``);
    const sql = `INSERT INTO \`configure\` (${quotedCols.join(',')}) VALUES (${placeholders.join(',')})`;

    let conn;
    try {
      conn = await pool.getConnection();
      const [result] = await conn.execute(sql, values);
      return res.json({ status: 'success', id: result.insertId || null, mode: 'insert' });
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ status: 'error', error_status: 'already_configured' });
      }
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_insert_failed' });
    } finally {
      if (conn) conn.release();
    }
  });

  // Delete configuration by UID
  app.post('/api/delete_configure/:uid', async (req, res) => {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      const [result] = await conn.execute('DELETE FROM `configure` WHERE `uid` = ?', [uid]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', error_status: 'not_found' });
      }
      return res.json({ status: 'success', deleted: result.affectedRows });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_delete_failed' });
    } finally {
      if (conn) conn.release();
    }
  });
}
