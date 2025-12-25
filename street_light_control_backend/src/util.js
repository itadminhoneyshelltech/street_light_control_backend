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
