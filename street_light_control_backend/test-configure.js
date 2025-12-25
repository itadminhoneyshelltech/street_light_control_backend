/*
cd "c:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\street_light_control_backend"; 
node .\test-configure.js configure SL-SEQ-RUN; 
node .\test-configure.js reconfigure SL-SEQ-RUN; 
node .\test-configure.js delete SL-SEQ-RUN
 */
const DEFAULT_PORT = 9001;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || DEFAULT_PORT;
const BASE_URL = `http://${HOST}:${PORT}`;

const basePayload = {
  uid: "", // placeholder; runtime uid will overwrite
  rr_no: "RR-45890",
  constituency: "Central",
  zone_ulb: "Zone-3",
  ward: "Ward-12",
  pole: 145,
  conn_pole: 142,
  arm: "single",
  lamp_type: "LED",
  Board_no: "BRD-77",
  watts: 120,
  location_address: "42 Market St, Central City",
  service_type: "night",
  mode: "auto",
  phone_no: "9876543210",
  imei_no: "867530900123456",
  sim_no: "8991012345678901234",
  langtiude: "12.9716",
  longitude: "77.5946",
  phase: "R",
  configured_on_time: "2025-12-24",
  configured_off_time: "2025-12-24",
  time_zone: "Asia/Kolkata",
  ld_details: "6-lamp string",
  ld_watt1: 20,
  ld_watt1_count: 1,
  ld_watt2: 30,
  ld_watt2_count: 1,
  ld_watt3: 40,
  ld_watt3_count: 1,
  ld_watt4: 50,
  ld_watt4_count: 1,
  ld_watt5: 60,
  ld_watt5_count: 1,
  ld_watt6: 70,
  ld_watt6_count: 1,
  event: "commissioned",
  date: "2025-12-24"
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
  if (!cmd || !uidArg) {
    console.log('Usage: node test-configure.js <configure|reconfigure|delete> <uid>');
    process.exit(1);
  }

  const uid = uidArg;

  if (cmd === 'configure') {
    // User-provided uid overrides placeholder in basePayload
    const payload = { ...basePayload, uid };
    await callApi('/api/configure', 'POST', payload);
    return;
  }

  if (cmd === 'reconfigure') {
    // Example reconfigure payload: tweak mode and watts
    const reconfigPayload = { uid, mode: 'manual', watts: 150 };
    await callApi('/api/reconfigure', 'POST', reconfigPayload);
    return;
  }

  if (cmd === 'delete') {
    await callApi(`/api/configure/${encodeURIComponent(uid)}`, 'DELETE');
    return;
  }

  console.log('Unknown command. Use one of: configure | reconfigure | delete');
  process.exit(1);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
