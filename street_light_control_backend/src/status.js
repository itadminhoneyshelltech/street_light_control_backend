export function setupStatus(app, pool) {
  const allowedColumns = [
    'uid', 'event', 'date', 'actual_on_time', 'actual_off_time',
    'r_volt', 'y_volt', 'b_volt', 'r_cur', 'y_cur', 'b_cur',
    'r_kw', 'y_kw', 'b_kw', 'r_pf', 'y_pf', 'b_pf',
    'battery_status', 'battery_backup_hrs', 'day_open_reading', 'day_close_reading',
    'cur_reading', 'baseline_kWh', 'adjusted_baseline_kWh', 'actual_consumption_kWh',
    'energy_saved_kWh', 'energy_saving_per', 'lamp_burning_per', 'status', 'CCMS_STATUS'
  ];

  // POST /api/status - create new status record (allows multiple records per UID with different events)
  app.post('/api/status', async (req, res) => {
    const data = req.body || {};
    const uid = data.uid;
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }
    // Verify uid exists in configure table; if not, return error
    const { checkUidExists } = await import('./util.js');
    try {
      const exists = await checkUidExists(pool, uid);
      if (!exists) {
        return res.status(404).json({ status: 'error', error_status: 'uid_not_found_in_configure' });
      }
    } catch (err) {
      return res.status(500).json({ status: 'error', error_status: 'db_configure_check_failed' });
    }

    console.log('Received status data for UID:', uid, 'Event:', data.event);
    let conn;
    try {
      conn = await pool.getConnection();
      console.log('Database connection established for status.');

      const cols = [];
      const placeholders = [];
      const values = [];

      for (const col of allowedColumns) {
        cols.push(col);
        values.push(data[col] ?? null);
        placeholders.push('?');
      }

      const quotedCols = cols.map((c) => `\`${c}\``);
      const sql = `INSERT INTO \`status\` (${quotedCols.join(',')}) VALUES (${placeholders.join(',')})`;

      const [result] = await conn.execute(sql, values);
      return res.json({ status: 'success', id: result.insertId || null, mode: 'insert' });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_insert_failed' });
    } finally {
      if (conn) conn.release();
    }
  });

  // GET /api/status - list all status records
  app.get('/api/status', async (req, res) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM `status` LIMIT 1000');
      return res.json({ status: 'success', data: rows });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_query_failed' });
    } finally {
      if (conn) conn.release();
    }
  });

  // GET /api/status/:uid - get specific status record
  app.get('/api/status/:uid', async (req, res) => {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT * FROM `status` WHERE `uid` = ? LIMIT 1', [uid]);
      if (rows.length === 0) {
        return res.status(404).json({ status: 'error', error_status: 'not_found' });
      }
      return res.json({ status: 'success', data: rows[0] });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_query_failed' });
    } finally {
      if (conn) conn.release();
    }
  });

  // PUT /api/status/:uid - update status record
  app.put('/api/status/:uid', async (req, res) => {
    const { uid } = req.params;
    const data = req.body || {};
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }

    console.log('Updating status for UID:', uid);
    let conn;
    try {
      conn = await pool.getConnection();

      const setClauses = [];
      const values = [];

      for (const col of allowedColumns) {
        if (col !== 'uid' && data.hasOwnProperty(col)) {
          setClauses.push(`\`${col}\` = ?`);
          values.push(data[col] ?? null);
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ status: 'error', error_status: 'no_fields_to_update' });
      }

      values.push(uid);
      const sql = `UPDATE \`status\` SET ${setClauses.join(', ')} WHERE \`uid\` = ?`;

      const [result] = await conn.execute(sql, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', error_status: 'not_found' });
      }
      return res.json({ status: 'success', mode: 'update', affectedRows: result.affectedRows });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_update_failed' });
    } finally {
      if (conn) conn.release();
    }
  });

  // DELETE /api/status/:uid - delete status record
  app.delete('/api/status/:uid', async (req, res) => {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ status: 'error', error_status: 'uid_required' });
    }

    console.log('Deleting status for UID:', uid);
    let conn;
    try {
      conn = await pool.getConnection();
      const [result] = await conn.execute('DELETE FROM `status` WHERE `uid` = ?', [uid]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', error_status: 'not_found' });
      }
      return res.json({ status: 'success', mode: 'delete', affectedRows: result.affectedRows });
    } catch (err) {
      console.error('DB error:', err);
      return res.status(500).json({ status: 'error', error_status: 'db_delete_failed' });
    } finally {
      if (conn) conn.release();
    }
  });
}
