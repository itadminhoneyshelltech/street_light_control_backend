<?php
// backend/controllers/DeviceController.php
// Device communication and command management

class DeviceController {
    private $conn;
    private $table = 'street_lights';

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Device Configuration Endpoint
     * POST /device/{deviceId}/configure
     * Register a new device or update existing configuration
     */
    public function configureDevice() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            // Validate required fields
            if (!isset($data->device_id) || !isset($data->latitude) || !isset($data->longitude)) {
                Response::error('Missing required fields', 400);
                return;
            }

            // Check if device already exists
            $query = "SELECT id FROM {$this->table} WHERE light_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("s", $data->device_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();

            if ($existing) {
                // Update existing device
                $this->updateDevice($data);
            } else {
                // Create new device
                $this->createDevice($data);
            }

            Response::success([
                'message' => 'Device configured successfully',
                'light_id' => $data->device_id,
                'config' => [
                    'schedule_enabled' => true,
                    'sunrise_time' => '06:00:00',
                    'sunset_time' => '18:30:00',
                    'brightness_level' => 100,
                    'auto_dimming' => true
                ]
            ]);

        } catch (Exception $e) {
            Response::error('Configuration failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Create new device record
     */
    private function createDevice($data) {
        $query = "INSERT INTO {$this->table} (
            light_id, name, city, latitude, longitude, address,
            status, battery_backup_hours, gsm_imei, gsm_signal_strength,
            communication_type, is_automatic
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        
        $light_id = $data->device_id ?? 'UNKNOWN';
        $name = $data->name ?? 'Device ' . substr($data->device_id, -4);
        $city = $data->city ?? 'Unknown';
        $latitude = $data->latitude;
        $longitude = $data->longitude;
        $address = $data->address ?? 'Address pending';
        $status = $data->status ?? 'off';
        $battery_hours = $data->battery_backup_hours ?? 12;
        $gsm_imei = $data->gsm_imei ?? null;
        $gsm_signal = $data->gsm_signal_strength ?? 0;
        $comm_type = $data->communication_type ?? 'GSM';
        $is_auto = 1;
        
        $stmt->bind_param("sssddssisssi", $light_id, $name, $city, $latitude, $longitude, 
                         $address, $status, $battery_hours, $gsm_imei, $gsm_signal, $comm_type, $is_auto);
        $stmt->execute();

        return $stmt->affected_rows > 0;
    }

    /**
     * Update existing device
     */
    private function updateDevice($data) {
        $updates = [];
        $params = [];
        $types = "";

        if (isset($data->name)) {
            $updates[] = "name = ?";
            $params[] = $data->name;
            $types .= "s";
        }
        if (isset($data->city)) {
            $updates[] = "city = ?";
            $params[] = $data->city;
            $types .= "s";
        }
        if (isset($data->gsm_signal_strength)) {
            $updates[] = "gsm_signal_strength = ?";
            $params[] = $data->gsm_signal_strength;
            $types .= "i";
        }
        if (isset($data->status)) {
            $updates[] = "status = ?";
            $params[] = $data->status;
            $types .= "s";
        }

        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $data->device_id;
        $types .= "s";

        $query = "UPDATE {$this->table} SET " . implode(", ", $updates) . " WHERE light_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();

        return $stmt->affected_rows > 0;
    }

    /**
     * Periodic Status Update Endpoint
     * POST /device/{deviceId}/status
     * Store device status and energy readings
     */
    public function updateStatus() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->device_id)) {
                Response::error('Device ID required', 400);
                return;
            }

            // Update street light status
            $this->updateLightStatus($data);

            // Store energy parameters if provided
            if (isset($data->energy)) {
                $this->storeEnergyParameters($data);
            }

            // Update battery status if provided
            if (isset($data->status->battery_percentage)) {
                $this->updateBatteryStatus($data);
            }

            Response::success([
                'message' => 'Status recorded',
                'next_update_seconds' => 30
            ]);

        } catch (Exception $e) {
            Response::error('Status update failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update light status in street_lights table
     */
    private function updateLightStatus($data) {
        $light_id = $data->device_id;
        $status = $data->status->power_state ?? 'off';
        $brightness = $data->status->brightness ?? 100;

        $query = "UPDATE {$this->table} SET 
            status = ?, 
            brightness = ?,
            last_status_change = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
            WHERE light_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sis", $status, $brightness, $light_id);
        $stmt->execute();
    }

    /**
     * Store energy readings
     */
    private function storeEnergyParameters($data) {
        $query = "INSERT INTO energy_parameters (
            light_id, timestamp, phase_a_voltage, phase_a_current,
            total_active_power, frequency, cumulative_kwh, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

        $stmt = $this->conn->prepare($query);
        
        $light_id = $data->device_id;
        $timestamp = $data->timestamp ?? date('Y-m-d H:i:s');
        $voltage = $data->energy->voltage ?? 0;
        $current = $data->energy->current ?? 0;
        $power = $data->energy->power_watts ?? 0;
        $frequency = $data->energy->frequency ?? 50;
        $kwh = $data->energy->cumulative_kwh ?? 0;
        
        $stmt->bind_param("ssddddd", $light_id, $timestamp, $voltage, $current, $power, $frequency, $kwh);
        $stmt->execute();
    }

    /**
     * Update battery status
     */
    private function updateBatteryStatus($data) {
        $light_id = $data->device_id;
        $charge = $data->status->battery_percentage ?? 100;
        
        // Determine battery status level
        $status = 'full';
        if ($charge < 10) $status = 'critical';
        elseif ($charge < 20) $status = 'warning';
        elseif ($charge < 50) $status = 'good';

        $query = "INSERT INTO battery_status (light_id, current_charge_percentage, status, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE 
            current_charge_percentage = VALUES(current_charge_percentage),
            status = VALUES(status),
            updated_at = CURRENT_TIMESTAMP";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sis", $light_id, $charge, $status);
        $stmt->execute();
    }

    /**
     * Get Pending Commands Endpoint
     * GET /device/{deviceId}/commands
     * Retrieve pending commands for this device
     */
    public function getCommands() {
        try {
            $device_id = $_GET['device_id'] ?? null;

            if (!$device_id) {
                Response::error('Device ID required', 400);
                return;
            }

            // Check for pending commands in a command queue table
            $commands = $this->getPendingCommands($device_id);

            Response::success([
                'commands' => $commands
            ]);

        } catch (Exception $e) {
            Response::error('Failed to fetch commands: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Fetch pending commands from database
     */
    private function getPendingCommands($device_id) {
        // Note: Requires a 'device_commands' table to be created
        $query = "SELECT id, command_type, action, brightness_level, schedule,
                  requested_at FROM device_commands 
                  WHERE light_id = ? AND executed = 0
                  ORDER BY priority DESC, requested_at ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $device_id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $commands = [];
        while ($row = $result->fetch_assoc()) {
            $commands[] = [
                'command_id' => 'CMD_' . str_pad($row['id'], 3, '0', STR_PAD_LEFT),
                'command_type' => $row['command_type'],
                'action' => $row['action'] ?? null,
                'brightness_level' => $row['brightness_level'] ?? null,
                'schedule' => json_decode($row['schedule'] ?? '{}'),
                'priority' => 'normal',
                'requested_at' => $row['requested_at']
            ];
        }

        return $commands;
    }

    /**
     * Command Acknowledgment Endpoint
     * POST /device/{deviceId}/command-ack
     * Confirm command execution
     */
    public function acknowledgeCommand() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->device_id) || !isset($data->command_id)) {
                Response::error('Device ID and Command ID required', 400);
                return;
            }

            // Mark command as executed
            $this->markCommandExecuted($data->command_id);

            // Log execution
            $this->logCommandExecution($data);

            Response::success([
                'message' => 'Command acknowledged'
            ]);

        } catch (Exception $e) {
            Response::error('Acknowledgment failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mark command as executed
     */
    private function markCommandExecuted($command_id) {
        $cmd_num = intval(str_replace('CMD_', '', $command_id));
        
        $query = "UPDATE device_commands SET executed = 1, executed_at = CURRENT_TIMESTAMP
                  WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $cmd_num);
        $stmt->execute();
    }

    /**
     * Log command execution
     */
    private function logCommandExecution($data) {
        $query = "INSERT INTO control_logs (light_id, action, performed_by, control_type, 
                  previous_status, new_status, reason, created_at)
                  VALUES (?, ?, 'device_auto', 'automatic', 'unknown', ?, 
                  'Command execution', CURRENT_TIMESTAMP)";

        $stmt = $this->conn->prepare($query);
        
        $light_id = $data->device_id;
        $action = $data->result->new_state ?? 'unknown';
        $new_status = $data->result->new_state ?? 'unknown';
        
        $stmt->bind_param("sss", $light_id, $action, $new_status);
        $stmt->execute();
    }

    /**
     * Send Alert Endpoint
     * POST /device/{deviceId}/alert
     * Device sends critical alert
     */
    public function sendAlert() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->device_id) || !isset($data->alert_type)) {
                Response::error('Missing required fields', 400);
                return;
            }

            $query = "INSERT INTO alerts (light_id, alert_type, severity, message, created_at)
                      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";

            $stmt = $this->conn->prepare($query);
            
            $light_id = $data->device_id;
            $alert_type = $data->alert_type;
            $severity = $data->severity ?? 'medium';
            $message = $data->message ?? 'Device alert';
            
            $stmt->bind_param("ssss", $light_id, $alert_type, $severity, $message);
            $stmt->execute();

            Response::success([
                'message' => 'Alert received'
            ]);

        } catch (Exception $e) {
            Response::error('Alert submission failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Device Health Check Endpoint
     * GET /device/{deviceId}/health
     * Verify device connectivity
     */
    public function getHealth() {
        try {
            $device_id = $_GET['device_id'] ?? null;

            if (!$device_id) {
                Response::error('Device ID required', 400);
                return;
            }

            $query = "SELECT light_id, status, last_status_change, gsm_signal_strength,
                     battery_status FROM {$this->table} WHERE light_id = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("s", $device_id);
            $stmt->execute();
            $device = $stmt->get_result()->fetch_assoc();

            if (!$device) {
                Response::error('Device not found', 404);
                return;
            }

            $last_update = strtotime($device['last_status_change']);
            $minutes_ago = (time() - $last_update) / 60;

            $health_status = 'healthy';
            if ($minutes_ago > 2) $health_status = 'offline';
            elseif ($minutes_ago > 1) $health_status = 'degraded';

            Response::success([
                'device_id' => $device['light_id'],
                'health_status' => $health_status,
                'current_status' => $device['status'],
                'last_update_minutes_ago' => round($minutes_ago, 1),
                'signal_strength' => $device['gsm_signal_strength'],
                'battery_status' => $device['battery_status'] ?? 'unknown',
                'server_time' => date('Y-m-d H:i:s')
            ]);

        } catch (Exception $e) {
            Response::error('Health check failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Firmware Update Check Endpoint
     * GET /device/{deviceId}/firmware
     * Check if firmware update available
     */
    public function checkFirmwareUpdate() {
        try {
            $device_id = $_GET['device_id'] ?? null;
            $current_version = $_GET['version'] ?? null;

            if (!$device_id) {
                Response::error('Device ID required', 400);
                return;
            }

            // In production, check firmware table
            $latest_version = '2.2.0';
            $update_available = version_compare($current_version ?? '0.0.0', $latest_version) < 0;

            Response::success([
                'update_available' => $update_available,
                'current_version' => $current_version,
                'latest_version' => $latest_version,
                'download_url' => $update_available ? '/firmware/v2.2.0/device-fw.bin' : null,
                'changelog' => $update_available ? 'Bug fixes and performance improvements' : null
            ]);

        } catch (Exception $e) {
            Response::error('Firmware check failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get Device Logs Endpoint
     * POST /device/{deviceId}/logs
     * Upload device logs to server
     */
    public function uploadLogs() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->device_id)) {
                Response::error('Device ID required', 400);
                return;
            }

            // Store logs in database or file
            $log_entry = [
                'light_id' => $data->device_id,
                'log_data' => json_encode($data->logs ?? []),
                'uploaded_at' => date('Y-m-d H:i:s')
            ];

            // In production: INSERT INTO device_logs table
            error_log('Device logs received from ' . $data->device_id . ': ' . json_encode($data->logs));

            Response::success([
                'message' => 'Logs received',
                'stored_entries' => count($data->logs ?? [])
            ]);

        } catch (Exception $e) {
            Response::error('Log upload failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Bulk Data Sync Endpoint
     * POST /device/{deviceId}/sync
     * For offline data sync when device comes online
     */
    public function syncOfflineData() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->device_id) || !isset($data->data)) {
                Response::error('Device ID and data required', 400);
                return;
            }

            $synced_count = 0;

            // Process status updates
            if (isset($data->data->status_updates)) {
                foreach ($data->data->status_updates as $update) {
                    $this->storeOfflineStatusUpdate($update);
                    $synced_count++;
                }
            }

            // Process energy readings
            if (isset($data->data->energy_readings)) {
                foreach ($data->data->energy_readings as $reading) {
                    $this->storeOfflineEnergyReading($reading);
                    $synced_count++;
                }
            }

            Response::success([
                'message' => 'Offline data synced',
                'synced_entries' => $synced_count
            ]);

        } catch (Exception $e) {
            Response::error('Sync failed: ' . $e->getMessage(), 500);
        }
    }

    private function storeOfflineStatusUpdate($update) {
        // Insert with timestamp from device
    }

    private function storeOfflineEnergyReading($reading) {
        // Insert energy parameter with historical timestamp
    }
}
?>
