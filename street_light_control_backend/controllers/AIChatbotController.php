<?php
// controllers/AIChatbotController.php
// AI-powered chatbot with full admin control capabilities

class AIChatbotController {
    private $conn;
    private $aiService;
    
    public function __construct($conn) {
        $this->conn = $conn;
        require_once __DIR__ . '/../services/AIService.php';
        $this->aiService = new AIService();
    }
    
    /**
     * Process user message and execute admin commands
     */
    public function processMessage() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->message)) {
            Response::error('Message is required', 400);
        }
        
        $message = trim($data->message);
        $userId = $data->userId ?? null;
        
        try {
            // Analyze message with AI to extract intent
            $intent = $this->aiService->analyzeIntent($message);
            
            // Execute command based on intent
            $result = $this->executeCommand($intent);
            
            // Generate natural language response
            $response = $this->aiService->generateResponse($intent, $result);
            
            // Log conversation
            $this->logConversation($userId, $message, $intent, $response, $result);
            
            Response::success([
                'message' => $response,
                'intent' => $intent['type'],
                'executed_action' => $intent['action'] ?? null,
                'result' => $result,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            
        } catch (Exception $e) {
            error_log("AI Chatbot Error: " . $e->getMessage());
            Response::success([
                'message' => "I encountered an issue: " . $e->getMessage() . ". Please try rephrasing your command.",
                'error' => true
            ]);
        }
    }
    
    /**
     * Execute command based on AI-detected intent
     */
    private function executeCommand($intent) {
        switch($intent['type']) {
            case 'LIGHT_CONTROL':
                return $this->controlLights($intent);
            
            case 'STATUS_QUERY':
                return $this->getStatus($intent);
            
            case 'SCHEDULE_MANAGEMENT':
                return $this->manageSchedule($intent);
            
            case 'ALERT_MANAGEMENT':
                return $this->manageAlerts($intent);
            
            case 'INSPECTION_MANAGEMENT':
                return $this->manageInspections($intent);
            
            case 'ENERGY_QUERY':
                return $this->getEnergyData($intent);
            
            case 'GREETING':
                return ['message' => 'Ready to assist!'];
            
            default:
                return ['message' => 'Command understood but not implemented yet.'];
        }
    }
    
    /**
     * Control lights (ON/OFF/Brightness)
     */
    private function controlLights($intent) {
        $entities = $intent['entities'];
        $action = $entities['action'] ?? 'status';
        $brightness = $entities['brightness'] ?? 100;
        $lightId = $entities['light_id'] ?? null;
        $city = $entities['city'] ?? null;
        $ward = $entities['ward'] ?? null;
        
        // Build WHERE clause
        $where = [];
        $params = [];
        $types = '';
        
        if ($lightId) {
            $where[] = "light_id = ?";
            $params[] = $lightId;
            $types .= 's';
        } elseif ($city) {
            $where[] = "city = ?";
            $params[] = $city;
            $types .= 's';
        }
        
        if ($ward) {
            $where[] = "ward_number = ?";
            $params[] = $ward;
            $types .= 'i';
        }
        
        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";
        
        // Get affected lights
        $sql = "SELECT light_id, name, status, city FROM street_lights $whereClause";
        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $lights = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        if (empty($lights)) {
            return ['error' => 'No lights found matching criteria'];
        }
        
        // Execute action
        $updated = 0;
        $citiesAffected = [];
        if ($action === 'on' || $action === 'off') {
            foreach ($lights as $light) {
                $updateSql = "UPDATE street_lights SET status = ?, brightness = ?, updated_at = NOW() WHERE light_id = ?";
                $updateStmt = $this->conn->prepare($updateSql);
                $updateStmt->bind_param('sis', $action, $brightness, $light['light_id']);
                if ($updateStmt->execute()) {
                    $updated++;
                    // Track which cities were affected
                    if ($light['city'] && !in_array($light['city'], $citiesAffected)) {
                        $citiesAffected[] = $light['city'];
                    }
                    
                    // Log control action
                    $logSql = "INSERT INTO control_logs (light_id, action, user_id, performed_by, control_type, previous_status, new_status, reason, created_at) 
                               VALUES (?, ?, ?, 'AI_CHATBOT', 'automatic', ?, ?, 'AI Chatbot Command', NOW())";
                    $logStmt = $this->conn->prepare($logSql);
                    $userId = 1; // AI user ID
                    $previousStatus = $light['status'];
                    $newStatus = $action;
                    $logStmt->bind_param('ssiss', $light['light_id'], $action, $userId, $previousStatus, $newStatus);
                    $logStmt->execute();
                }
            }
            
            // Update city summary for all affected cities
            if ($updated > 0) {
                require_once __DIR__ . '/../models/CitySummary.php';
                foreach ($citiesAffected as $affectedCity) {
                    error_log("🔄 Updating CitySummary for city: " . $affectedCity);
                    CitySummary::updateCitySummary($this->conn, $affectedCity);
                }
            }
        }
        
        return [
            'lights_found' => count($lights),
            'lights_updated' => $updated,
            'action' => $action,
            'brightness' => $brightness,
            'lights' => array_map(fn($l) => $l['light_id'], $lights)
        ];
    }
    
    /**
     * Get status information
     */
    private function getStatus($intent) {
        $entities = $intent['entities'];
        $lightId = $entities['light_id'] ?? null;
        $city = $entities['city'] ?? null;
        $filter = $entities['filter'] ?? null; // e.g., 'low_battery', 'offline'
        
        // Build query
        $where = [];
        $params = [];
        $types = '';
        
        if ($lightId) {
            $where[] = "light_id = ?";
            $params[] = $lightId;
            $types .= 's';
        } elseif ($city) {
            $where[] = "city = ?";
            $params[] = $city;
            $types .= 's';
        }
        
        if ($filter === 'low_battery') {
            $where[] = "battery_percentage < 20";
        } elseif ($filter === 'offline') {
            $where[] = "TIMESTAMPDIFF(MINUTE, last_update, NOW()) > 5";
        } elseif ($filter === 'maintenance') {
            $where[] = "maintenance_required = 1";
        }
        
        $whereClause = !empty($where) ? "WHERE " . implode(' AND ', $where) : "";
        
        $sql = "SELECT light_id, name, status, brightness, battery_percentage,
                latitude, longitude, created_at as last_update, maintenance_required 
                FROM street_lights $whereClause LIMIT 50";
        
        $stmt = $this->conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $lights = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        // Get summary statistics
        $statsSql = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'on' THEN 1 ELSE 0 END) as on_count,
            SUM(CASE WHEN status = 'off' THEN 1 ELSE 0 END) as off_count,
            AVG(brightness) as avg_brightness,
            SUM(CASE WHEN battery_status IN ('low', 'critical') THEN 1 ELSE 0 END) as low_battery_count,
            AVG(battery_percentage) as avg_battery,
            SUM(CASE WHEN maintenance_required = 1 THEN 1 ELSE 0 END) as maintenance_count
            FROM street_lights $whereClause";
        
        $statsStmt = $this->conn->prepare($statsSql);
        if (!empty($params)) {
            $statsStmt->bind_param($types, ...$params);
        }
        $statsStmt->execute();
        $stats = $statsStmt->get_result()->fetch_assoc();
        
        return [
            'lights' => $lights,
            'summary' => $stats,
            'filter_applied' => $filter
        ];
    }
    
    /**
     * Manage schedules
     */
    private function manageSchedule($intent) {
        $entities = $intent['entities'];
        $action = $entities['schedule_action'] ?? 'create';
        $lightId = $entities['light_id'] ?? null;
        $time = $entities['time'] ?? null;
        $scheduleType = $entities['schedule_type'] ?? 'fixed';
        
        if ($action === 'create' || $action === 'enable') {
            // Enable automatic scheduling
            $sql = "UPDATE street_lights SET schedule_enabled = 1";
            $params = [];
            $types = '';
            
            if ($lightId) {
                $sql .= " WHERE light_id = ?";
                $params[] = $lightId;
                $types .= 's';
            }
            
            $stmt = $this->conn->prepare($sql);
            if (!empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            
            return [
                'action' => 'schedule_enabled',
                'schedule_type' => $scheduleType,
                'affected_lights' => $stmt->affected_rows
            ];
        } elseif ($action === 'disable') {
            $sql = "UPDATE street_lights SET schedule_enabled = 0";
            if ($lightId) {
                $sql .= " WHERE light_id = ?";
                $stmt = $this->conn->prepare($sql);
                $stmt->bind_param('s', $lightId);
            } else {
                $stmt = $this->conn->prepare($sql);
            }
            $stmt->execute();
            
            return [
                'action' => 'schedule_disabled',
                'affected_lights' => $stmt->affected_rows
            ];
        }
        
        return ['message' => 'Schedule action completed'];
    }
    
    /**
     * Manage alerts
     */
    private function manageAlerts($intent) {
        $entities = $intent['entities'];
        $action = $entities['alert_action'] ?? 'list';
        $alertId = $entities['alert_id'] ?? null;
        
        if ($action === 'list') {
            $sql = "SELECT id, light_id, alert_type, severity, message, is_resolved, created_at 
                    FROM alerts WHERE is_resolved = 0 ORDER BY created_at DESC LIMIT 20";
            $result = $this->conn->query($sql);
            $alerts = $result->fetch_all(MYSQLI_ASSOC);
            
            return [
                'alerts' => $alerts,
                'count' => count($alerts)
            ];
        } elseif ($action === 'resolve' && $alertId) {
            $sql = "UPDATE alerts SET is_resolved = 1, resolved_at = NOW() WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param('i', $alertId);
            $stmt->execute();
            
            return [
                'action' => 'resolved',
                'alert_id' => $alertId
            ];
        }
        
        return ['message' => 'Alert action completed'];
    }
    
    /**
     * Manage inspections
     */
    private function manageInspections($intent) {
        $entities = $intent['entities'];
        $action = $entities['inspection_action'] ?? 'list';
        
        if ($action === 'list' || $action === 'pending') {
            $sql = "SELECT id, light_id, inspector_id, inspection_date, light_status, 
                    ward_number, notes FROM inspections 
                    WHERE inspection_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                    ORDER BY inspection_date DESC LIMIT 20";
            $result = $this->conn->query($sql);
            $inspections = $result->fetch_all(MYSQLI_ASSOC);
            
            return [
                'inspections' => $inspections,
                'count' => count($inspections)
            ];
        }
        
        return ['message' => 'Inspection query completed'];
    }
    
    /**
     * Get energy data
     */
    private function getEnergyData($intent) {
        $entities = $intent['entities'];
        $lightId = $entities['light_id'] ?? null;
        
        $sql = "SELECT ep.light_id, ep.voltage, ep.current, ep.power_factor, 
                ep.total_active_power, ep.cumulative_kwh, ep.recorded_at,
                sl.name, sl.city
                FROM energy_parameters ep
                JOIN street_lights sl ON ep.light_id = sl.light_id";
        
        if ($lightId) {
            $sql .= " WHERE ep.light_id = ?";
        }
        
        $sql .= " ORDER BY ep.recorded_at DESC LIMIT 10";
        
        $stmt = $this->conn->prepare($sql);
        if ($lightId) {
            $stmt->bind_param('s', $lightId);
        }
        $stmt->execute();
        $energyData = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        return [
            'energy_data' => $energyData,
            'count' => count($energyData)
        ];
    }
    
    /**
     * Log conversation to database
     */
    private function logConversation($userId, $message, $intent, $response, $result) {
        $sql = "INSERT INTO ai_chatbot_conversations 
                (user_id, message, intent_type, response, executed_action, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->conn->prepare($sql);
        $intentType = $intent['type'];
        $executedAction = json_encode($result);
        
        $stmt->bind_param('issss', $userId, $message, $intentType, $response, $executedAction);
        $stmt->execute();
    }
    
    /**
     * Get conversation history
     */
    public function getConversationHistory() {
        $userId = $_GET['userId'] ?? null;
        $limit = $_GET['limit'] ?? 50;
        
        $sql = "SELECT id, message, intent_type, response, executed_action, created_at 
                FROM ai_chatbot_conversations";
        
        if ($userId) {
            $sql .= " WHERE user_id = ?";
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ?";
        
        $stmt = $this->conn->prepare($sql);
        if ($userId) {
            $stmt->bind_param('ii', $userId, $limit);
        } else {
            $stmt->bind_param('i', $limit);
        }
        
        $stmt->execute();
        $history = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        Response::success([
            'conversations' => $history,
            'count' => count($history)
        ]);
    }
    
    /**
     * Submit feedback on AI response
     */
    public function submitFeedback() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->conversationId, $data->rating)) {
            Response::error('Conversation ID and rating required', 400);
        }
        
        $sql = "UPDATE ai_chatbot_conversations SET user_rating = ? WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param('ii', $data->rating, $data->conversationId);
        $stmt->execute();
        
        Response::success(['message' => 'Feedback recorded']);
    }
}
?>
