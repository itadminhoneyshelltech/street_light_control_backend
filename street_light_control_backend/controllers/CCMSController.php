<?php
// backend/controllers/CCMSController.php
// CCMS (Central Control and Monitoring System) Features

class CCMSController {
    private $conn;
    private $streetLight;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->streetLight = new StreetLight($conn);
    }

    // Get smart meter data for a light
    public function getMeterData() {
        $user = AuthMiddleware::authenticate();
        $lightId = $_GET['lightId'] ?? null;

        if (!$lightId) {
            Response::error('Light ID required', 400);
        }

        $query = "SELECT m.*, ep.* FROM smart_meters m
                  LEFT JOIN energy_parameters ep ON m.light_id = ep.light_id
                  WHERE m.light_id = ?
                  ORDER BY ep.timestamp DESC LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $lightId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if (!$result) {
            Response::error('Meter data not found', 404);
        }

        Response::success($result, 'Meter data retrieved');
    }

    // Get energy parameters with filters
    public function getEnergyParameters() {
        $user = AuthMiddleware::authenticate();
        $lightId = $_GET['lightId'] ?? null;
        $hours = $_GET['hours'] ?? 24; // Default last 24 hours

        if (!$lightId) {
            Response::error('Light ID required', 400);
        }

        $query = "SELECT * FROM energy_parameters 
                  WHERE light_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                  ORDER BY timestamp DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $lightId, $hours);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        Response::success($result, 'Energy parameters retrieved');
    }

    // Create/Update schedule
    public function setSchedule() {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireRole($user, ['admin', 'operator']);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->lightId, $data->scheduleType)) {
            Response::error('Light ID and schedule type required', 400);
        }

        $query = "INSERT INTO schedules 
                  (light_id, enabled, schedule_type, start_time, end_time, action, brightness_level)
                  VALUES (?, ?, ?, ?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  schedule_type = VALUES(schedule_type),
                  start_time = VALUES(start_time),
                  end_time = VALUES(end_time),
                  action = VALUES(action),
                  brightness_level = VALUES(brightness_level),
                  enabled = VALUES(enabled)";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssssssi",
            $data->lightId,
            $data->enabled,
            $data->scheduleType,
            $data->startTime ?? null,
            $data->endTime ?? null,
            $data->action ?? 'on',
            $data->brightnessLevel ?? 100
        );

        if (!$stmt->execute()) {
            Response::error('Failed to set schedule', 500);
        }

        Response::success(['message' => 'Schedule updated'], 'Schedule saved successfully', 201);
    }

    // Get battery status
    public function getBatteryStatus() {
        $user = AuthMiddleware::authenticate();
        $lightId = $_GET['lightId'] ?? null;

        if (!$lightId) {
            Response::error('Light ID required', 400);
        }

        $query = "SELECT * FROM battery_status WHERE light_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $lightId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if (!$result) {
            $result = [
                'light_id' => $lightId,
                'backup_hours_available' => 12,
                'current_charge_percentage' => 100,
                'status' => 'full'
            ];
        }

        Response::success($result, 'Battery status retrieved');
    }

    // Update battery status
    public function updateBatteryStatus() {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireRole($user, ['admin', 'system']);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->lightId)) {
            Response::error('Light ID required', 400);
        }

        $query = "INSERT INTO battery_status 
                  (light_id, backup_hours_available, current_charge_percentage, status)
                  VALUES (?, ?, ?, ?)
                  ON DUPLICATE KEY UPDATE
                  backup_hours_available = VALUES(backup_hours_available),
                  current_charge_percentage = VALUES(current_charge_percentage),
                  status = VALUES(status),
                  updated_at = NOW()";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("siii",
            $data->lightId,
            $data->backupHoursAvailable ?? 12,
            $data->currentChargePercentage ?? 100,
            $data->status ?? 'good'
        );

        if (!$stmt->execute()) {
            Response::error('Failed to update battery status', 500);
        }

        Response::success(['message' => 'Battery status updated'], 'Battery status updated successfully');
    }

    // Record energy parameters (for IoT devices)
    public function recordEnergyParameters() {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->lightId)) {
            Response::error('Light ID required', 400);
        }

        $query = "INSERT INTO energy_parameters 
                  (light_id, meter_id, phase_a_voltage, phase_b_voltage, phase_c_voltage,
                   phase_a_current, phase_b_current, phase_c_current,
                   phase_a_power_factor, phase_b_power_factor, phase_c_power_factor,
                   frequency, total_active_power, total_apparent_power,
                   cumulative_kwh, cumulative_kvah, power_unavailable_hours)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ssdddddddddddddii",
            $data->lightId,
            $data->meterId ?? null,
            $data->phaseAVoltage ?? 0,
            $data->phaseBVoltage ?? 0,
            $data->phaseCVoltage ?? 0,
            $data->phaseACurrent ?? 0,
            $data->phaseBCurrent ?? 0,
            $data->phaseCCurrent ?? 0,
            $data->phaseAPowerFactor ?? 0,
            $data->phaseBPowerFactor ?? 0,
            $data->phaseCPowerFactor ?? 0,
            $data->frequency ?? 50,
            $data->totalActivePower ?? 0,
            $data->totalApparentPower ?? 0,
            $data->cumulativeKwh ?? 0,
            $data->cumulativeKvah ?? 0,
            $data->powerUnavailableHours ?? 0
        );

        if (!$stmt->execute()) {
            Response::error('Failed to record parameters', 500);
        }

        Response::success(['id' => $this->conn->insert_id], 'Energy parameters recorded');
    }

    // Get alerts
    public function getAlerts() {
        $user = AuthMiddleware::authenticate();
        $lightId = $_GET['lightId'] ?? null;
        $unreadOnly = $_GET['unreadOnly'] ?? false;

        $query = "SELECT * FROM alerts WHERE 1=1";
        
        if ($lightId) {
            $query .= " AND light_id = ?";
        }
        if ($unreadOnly) {
            $query .= " AND is_resolved = FALSE";
        }

        $query .= " ORDER BY severity DESC, created_at DESC LIMIT 100";

        if ($lightId) {
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("s", $lightId);
        } else {
            $stmt = $this->conn->prepare($query);
        }

        $stmt->execute();
        $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        Response::success($result, 'Alerts retrieved');
    }

    // Resolve alert
    public function resolveAlert() {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireRole($user, ['admin', 'operator']);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->alertId)) {
            Response::error('Alert ID required', 400);
        }

        $query = "UPDATE alerts SET is_resolved = TRUE, resolved_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $data->alertId);

        if (!$stmt->execute()) {
            Response::error('Failed to resolve alert', 500);
        }

        Response::success(['message' => 'Alert resolved'], 'Alert marked as resolved');
    }

    // Get dashboard summary
    public function getDashboardSummary() {
        $user = AuthMiddleware::authenticate();
        $city = $_GET['city'] ?? $user['city'];

        $summary = [];

        // Total lights
        $query = "SELECT COUNT(*) as count FROM street_lights WHERE city = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $summary['total_lights'] = $stmt->get_result()->fetch_assoc()['count'];

        // Battery status summary
        $query = "SELECT status, COUNT(*) as count FROM battery_status 
                  WHERE light_id IN (SELECT light_id FROM street_lights WHERE city = ?)
                  GROUP BY status";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $batteryStats = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $summary['battery_status'] = $batteryStats;

        // Unresolved alerts
        $query = "SELECT COUNT(*) as count FROM alerts 
                  WHERE is_resolved = FALSE 
                  AND light_id IN (SELECT light_id FROM street_lights WHERE city = ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $summary['unresolved_alerts'] = $stmt->get_result()->fetch_assoc()['count'];

        // Average power consumption
        $query = "SELECT AVG(total_active_power) as avg_power FROM energy_parameters
                  WHERE light_id IN (SELECT light_id FROM street_lights WHERE city = ?)
                  AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $summary['avg_power_consumption'] = $stmt->get_result()->fetch_assoc()['avg_power'] ?? 0;

        Response::success($summary, 'Dashboard summary retrieved');
    }
}
?>
