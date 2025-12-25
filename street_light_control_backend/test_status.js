/*
Testing status API endpoints
Usage:
  node test_status.js create <uid>
  node test_status.js update <uid>
  node test_status.js get <uid>
  node test_status.js list
 */

const DEFAULT_PORT = 9001;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || DEFAULT_PORT;
const BASE_URL = `http://${HOST}:${PORT}`;

const basePayload = {
  uid: "", // placeholder; runtime uid will overwrite
  event: "periodic_status",
  date: "2025-12-24",
  actual_on_time: "18:00:00",
  actual_off_time: "06:00:00",
  r_volt: 230.5,
  y_volt: 229.9,
  b_volt: 231.2,
  r_cur: 2.1,
  y_cur: 2.0,
  b_cur: 2.2,
  r_kw: 0.45,
  y_kw: 0.44,
  b_kw: 0.46,
  r_pf: 0.98,
  y_pf: 0.97,
  b_pf: 0.99,
  battery_status: 94.2,
  battery_backup_hrs: 6.5,
  day_open_reading: 1234.5,
  day_close_reading: 1240.7,
  cur_reading: 1240.7,
  baseline_kWh: 1200.0,
  adjusted_baseline_kWh: 1195.0,
  actual_consumption_kWh: 5.8,
  energy_saved_kWh: 0.3,
  energy_saving_per: 5.17,
  lamp_burning_per: 98.0,
  status: "ok",
  CCMS_STATUS: "online"
};

async function callApi(path, method, body) {
  if (body) {
    console.log('Payload:', JSON.stringify(body, null, 2));
  }
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await resp.json().catch(() => ({}));
  console.log(`[${method}] ${path} ->`, resp.status, JSON.stringify(json, null, 2));
  return { status: resp.status, json };
}

async function run() {
  const [cmd, uidArg] = process.argv.slice(2);
  if (!cmd) {
    console.log('Usage: node test_status.js <create|update|get|list|delete> [uid] [event]');
    process.exit(1);
  }

  if (cmd === 'create') {
    if (!uidArg) {
      console.log('Usage: node test_status.js create <uid> [event]');
      process.exit(1);
    }
    const eventArg = process.argv[4] || 'periodic_status';
    const payload = { ...basePayload, uid: uidArg, event: eventArg };
    await callApi('/api/status', 'POST', payload);
    return;
  }

  if (cmd === 'get') {
    if (!uidArg) {
      console.log('Usage: node test_status.js get <uid>');
      process.exit(1);
    }
    await callApi(`/api/status/${encodeURIComponent(uidArg)}`, 'GET');
    return;
  }

  if (cmd === 'list') {
    await callApi('/api/status', 'GET');
    return;
  }

  if (cmd === 'update') {
    if (!uidArg) {
      console.log('Usage: node test_status.js update <uid> [event]');
      process.exit(1);
    }
    const eventArg = process.argv[4] || 'periodic_status';
    const payload = { ...basePayload, uid: uidArg, event: eventArg };
    await callApi(`/api/status/${encodeURIComponent(uidArg)}`, 'PUT', payload);
    return;
  }

  if (cmd === 'delete') {
    if (!uidArg) {
      console.log('Usage: node test_status.js delete <uid>');
      process.exit(1);
    }
    await callApi(`/api/status/${encodeURIComponent(uidArg)}`, 'DELETE');
    return;
  }

  console.log('Unknown command. Use one of: create | update | get | list | delete');
  process.exit(1);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
