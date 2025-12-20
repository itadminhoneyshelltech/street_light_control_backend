<?php

// CCMS FeederPanelController (PHP stack)
// Aligns with existing router + Response helper
class FeederPanelController
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Get all feeder panels with filters
     * GET /api/feeder-panels/list
     */
    public function list()
    {
        $user = AuthMiddleware::authenticate();

        $cityId = isset($_GET['city_id']) ? intval($_GET['city_id']) : null;
        $zoneId = isset($_GET['zone_id']) ? intval($_GET['zone_id']) : null;
        $wardId = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
        $status = $_GET['status'] ?? null;

        $query = "SELECT fp.*, z.zone_name, w.ward_name, c.city_name,
                         COUNT(ll.id) as total_lights,
                         SUM(CASE WHEN ll.status = 'on' THEN 1 ELSE 0 END) as lights_on,
                         SUM(CASE WHEN ll.status = 'faulty' THEN 1 ELSE 0 END) as lights_faulty
                  FROM feeder_panels fp
                  JOIN zones z ON fp.zone_id = z.id
                  JOIN wards w ON fp.ward_id = w.id
                  JOIN cities c ON fp.city_id = c.id
                  LEFT JOIN led_luminaires ll ON fp.id = ll.feeder_panel_id
                  WHERE 1=1";

        $conditions = [];
        $params = [];
        $types = '';

        if ($cityId) {
            $conditions[] = 'fp.city_id = ?';
            $params[] = $cityId;
            $types .= 'i';
        }
        if ($zoneId) {
            $conditions[] = 'fp.zone_id = ?';
            $params[] = $zoneId;
            $types .= 'i';
        }
        if ($wardId) {
            $conditions[] = 'fp.ward_id = ?';
            $params[] = $wardId;
            $types .= 'i';
        }
        if ($status) {
            $conditions[] = 'fp.connection_status = ?';
            $params[] = $status;
            $types .= 's';
        }

        if (!empty($conditions)) {
            $query .= ' AND ' . implode(' AND ', $conditions);
        }

        $query .= ' GROUP BY fp.id ORDER BY fp.panel_name';

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            Response::error('Failed to prepare query', 500);
        }

        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        $panels = $result->fetch_all(MYSQLI_ASSOC);

        Response::success($panels, 'Feeder panels retrieved');
    }

    /**
     * Get single feeder panel with detailed status
     * GET /api/feeder-panels/{id}/status
     */
    public function getStatus($id = null)
    {
        $user = AuthMiddleware::authenticate();
        $panelId = $id ?? ($_GET['id'] ?? null);

        if (!$panelId) {
            Response::error('Panel ID required', 400);
        }

        $query = "SELECT fp.*, 
                         z.zone_name, w.ward_name, c.city_name,
                         sm.meter_id, sm.gsm_connectivity,
                         COUNT(ll.id) as total_lights,
                         SUM(CASE WHEN ll.status = 'on' THEN 1 ELSE 0 END) as lights_on,
                         SUM(CASE WHEN ll.status = 'faulty' THEN 1 ELSE 0 END) as lights_faulty,
                         AVG(ll.battery_percentage) as avg_battery,
                         SUM(CASE WHEN ll.battery_percentage < 20 THEN 1 ELSE 0 END) as low_battery_lights
                  FROM feeder_panels fp
                  JOIN zones z ON fp.zone_id = z.id
                  JOIN wards w ON fp.ward_id = w.id
                  JOIN cities c ON fp.city_id = c.id
                  LEFT JOIN smart_meters sm ON fp.id = sm.feeder_panel_id
                  LEFT JOIN led_luminaires ll ON fp.id = ll.feeder_panel_id
                  WHERE fp.id = ?
                  GROUP BY fp.id";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            Response::error('Failed to prepare query', 500);
        }

        $stmt->bind_param('i', $panelId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            Response::error('Feeder panel not found', 404);
        }

        $panel = $result->fetch_assoc();

        $faultQuery = "SELECT * FROM fault_logs
                       WHERE feeder_panel_id = ? AND fault_active = 1
                       ORDER BY created_at DESC LIMIT 5";
        $faultStmt = $this->conn->prepare($faultQuery);
        $faultStmt->bind_param('i', $panelId);
        $faultStmt->execute();
        $faultResult = $faultStmt->get_result();

        $panel['active_faults'] = $faultResult->fetch_all(MYSQLI_ASSOC);

        Response::success($panel, 'Panel status retrieved');
    }

    /**
     * Control feeder panel (ON/OFF/Schedule)
     * POST /api/feeder-panels/{id}/control
     */
    public function control($id = null)
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireRole($user, ['admin', 'operator']);

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $panelId = $id ?? ($input['id'] ?? null);

        if (!$panelId) {
            Response::error('Panel ID required', 400);
        }

        $action = $input['action'] ?? null; // on, off, dim, schedule
        $brightness = isset($input['brightness']) ? intval($input['brightness']) : 100;

        if (!$action) {
            Response::error('Action required (on/off/dim/schedule)', 400);
        }

        $operationQuery = "INSERT INTO control_operations 
                           (feeder_panel_id, operation_type, action_value, initiated_by, initiated_timestamp, status)
                           VALUES (?, ?, ?, ?, NOW(), 'pending')";
        $stmt = $this->conn->prepare($operationQuery);
        if (!$stmt) {
            Response::error('Failed to prepare control operation', 500);
        }

        $initiatedBy = $user['id'] ?? null;
        $stmt->bind_param('issi', $panelId, $action, $brightness, $initiatedBy);

        if (!$stmt->execute()) {
            Response::error('Failed to create control operation', 500);
        }

        $operationId = $stmt->insert_id ?? $this->conn->insert_id;

        $this->sendGSMCommand($panelId, $action, $brightness);

        $update = $this->conn->prepare("UPDATE control_operations SET status = 'success', status_message = 'Command queued' WHERE id = ?");
        $update->bind_param('i', $operationId);
        $update->execute();

        $this->logAuditTrail($initiatedBy, 'control_panel', 'feeder_panel', $panelId, json_encode([
            'action' => $action,
            'brightness' => $brightness
        ]));

        $this->triggerSystemEvent('panel_control', $panelId);

        Response::success([
            'operation_id' => $operationId,
            'status' => 'executing'
        ], 'Control command sent successfully');
    }

    /**
     * Get real-time energy data for feeder panel
     * GET /api/feeder-panels/{id}/energy
     */
    public function getEnergyData($id = null)
    {
        $user = AuthMiddleware::authenticate();
        $panelId = $id ?? ($_GET['id'] ?? null);

        if (!$panelId) {
            Response::error('Panel ID required', 400);
        }

        $latestQuery = "SELECT ep.* FROM energy_parameters ep
                        WHERE ep.feeder_panel_id = ?
                        ORDER BY ep.reading_timestamp DESC
                        LIMIT 1";
        $stmt = $this->conn->prepare($latestQuery);
        if (!$stmt) {
            Response::error('Failed to prepare query', 500);
        }
        $stmt->bind_param('i', $panelId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            Response::error('No energy data available', 404);
        }

        $data = $result->fetch_assoc();

        $historyQuery = "SELECT reading_timestamp, active_power_kw, voltage_avg, current_total, pf_total
                          FROM energy_parameters
                          WHERE feeder_panel_id = ?
                          AND reading_timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                          ORDER BY reading_timestamp";
        $historyStmt = $this->conn->prepare($historyQuery);
        $historyStmt->bind_param('i', $panelId);
        $historyStmt->execute();
        $historyResult = $historyStmt->get_result();
        $data['history'] = $historyResult->fetch_all(MYSQLI_ASSOC);

        Response::success($data, 'Energy data retrieved');
    }

    /**
     * Get faults for a feeder panel
     * GET /api/feeder-panels/{id}/faults
     */
    public function getFaults($id = null)
    {
        $user = AuthMiddleware::authenticate();
        $panelId = $id ?? ($_GET['id'] ?? null);
        $activeOnly = isset($_GET['active_only']) ? intval($_GET['active_only']) : 1;

        if (!$panelId) {
            Response::error('Panel ID required', 400);
        }

        $query = "SELECT * FROM fault_logs WHERE feeder_panel_id = ?";
        if ($activeOnly) {
            $query .= " AND fault_active = 1";
        }
        $query .= " ORDER BY created_at DESC LIMIT 100";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $panelId);
        $stmt->execute();
        $faults = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        Response::success($faults, 'Faults retrieved');
    }

    /**
     * Create a maintenance request
     * POST /api/feeder-panels/{id}/maintenance
     */
    public function createMaintenanceRequest($id = null)
    {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireRole($user, ['admin', 'operator', 'maintenance']);

        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $panelId = $id ?? ($input['id'] ?? null);

        if (!$panelId) {
            Response::error('Panel ID required', 400);
        }

        $description = $input['description'] ?? null;
        $priority = $input['priority'] ?? 'medium';
        $requestType = $input['request_type'] ?? 'corrective';

        if (!$description) {
            Response::error('Description required', 400);
        }

        $query = "INSERT INTO maintenance_requests
                  (feeder_panel_id, request_type, description, priority, status, assigned_date)
                  VALUES (?, ?, ?, ?, 'open', NOW())";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            Response::error('Failed to prepare maintenance query', 500);
        }

        $stmt->bind_param('isss', $panelId, $requestType, $description, $priority);

        if (!$stmt->execute()) {
            Response::error('Failed to create maintenance request', 500);
        }

        Response::success([
            'request_id' => $stmt->insert_id ?? $this->conn->insert_id
        ], 'Maintenance request created', 201);
    }

    private function sendGSMCommand($panelId, $action, $brightness = 100)
    {
        $query = "SELECT gsm_modem_id, gsm_signal_strength FROM feeder_panels WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('i', $panelId);
        $stmt->execute();
        $panel = $stmt->get_result()->fetch_assoc();

        if (!$panel || empty($panel['gsm_modem_id'])) {
            error_log('No GSM modem for panel ' . $panelId);
            return false;
        }

        $logQuery = "INSERT INTO gsm_communication_log 
                      (feeder_panel_id, gsm_modem_id, message_type, message_direction, message_content, delivery_status, delivery_timestamp, signal_strength)
                      VALUES (?, ?, ?, 'send', ?, 'sent', NOW(), ?)";

        $logStmt = $this->conn->prepare($logQuery);
        $messageType = 'command';
        $message = json_encode(['action' => $action, 'brightness' => $brightness]);
        $signalStrength = $panel['gsm_signal_strength'] ?? null;

        $logStmt->bind_param('isssi', $panelId, $panel['gsm_modem_id'], $messageType, $message, $signalStrength);
        $logStmt->execute();

        return true;
    }

    private function logAuditTrail($userId, $action, $resourceType, $resourceId, $details = null, $status = 'success', $statusMessage = null)
    {
        $query = "INSERT INTO access_audit_log 
                  (user_id, action, resource_type, resource_id, action_details, ip_address, user_agent, status, status_message)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

        $stmt->bind_param('ississsss', $userId, $action, $resourceType, $resourceId, $details, $ip, $agent, $status, $statusMessage);
        $stmt->execute();
    }

    private function triggerSystemEvent($eventType, $data = null)
    {
        // Hook for websocket/event queue integrations
        error_log('System Event: ' . $eventType . ' - ' . json_encode($data));
    }
}
?>
