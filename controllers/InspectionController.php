<?php
// backend/controllers/InspectionController.php
// Handle street light field inspections

class InspectionController {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Start inspection - Create new inspection record
     */
    public function startInspection() {
        try {
            $data = json_decode(file_get_contents("php://input"));
            
            if (!isset($data->light_id)) {
                Response::error('Light ID required', 400);
                return;
            }

            $inspector = AuthMiddleware::authenticate();

            $sql = "INSERT INTO inspections (light_id, inspector_id, light_status, ward_number, notes) 
                    VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "sisss",
                $data->light_id,
                $inspector['id'],
                $data->light_status ?? 'off',
                $data->ward_number ?? null,
                $data->notes ?? null
            );

            if ($stmt->execute()) {
                $inspection_id = $stmt->insert_id;
                Response::success([
                    'inspection_id' => $inspection_id,
                    'light_id' => $data->light_id,
                    'status' => 'started'
                ], 'Inspection started', 201);
            } else {
                Response::error('Failed to start inspection', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Upload inspection photo
     */
    public function uploadPhoto() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->inspection_id, $data->photo_base64)) {
                Response::error('Inspection ID and photo required', 400);
                return;
            }

            // Decode base64 photo
            $photoData = base64_decode($data->photo_base64);
            if (!$photoData) {
                Response::error('Invalid photo data', 400);
                return;
            }

            // Save photo to file system
            $photoDir = __DIR__ . '/../uploads/inspections/';
            if (!is_dir($photoDir)) {
                mkdir($photoDir, 0755, true);
            }

            $fileName = 'inspection_' . $data->inspection_id . '_' . time() . '.jpg';
            $filePath = $photoDir . $fileName;
            
            file_put_contents($filePath, $photoData);

            // Update inspection record
            $sql = "UPDATE inspections SET photo_path = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $filePath, $data->inspection_id);
            $stmt->execute();

            Response::success([
                'photo_path' => $filePath,
                'photo_url' => '/uploads/inspections/' . $fileName
            ], 'Photo uploaded successfully', 200);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Record GPS coordinates
     */
    public function recordGPS() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->inspection_id, $data->latitude, $data->longitude)) {
                Response::error('Inspection ID, latitude, and longitude required', 400);
                return;
            }

            $sql = "UPDATE inspections SET gps_latitude = ?, gps_longitude = ? WHERE id = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "ddi",
                $data->latitude,
                $data->longitude,
                $data->inspection_id
            );

            if ($stmt->execute()) {
                Response::success([
                    'latitude' => $data->latitude,
                    'longitude' => $data->longitude
                ], 'GPS recorded', 200);
            } else {
                Response::error('Failed to record GPS', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Complete inspection with final status
     */
    public function completeInspection() {
        try {
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->inspection_id, $data->light_status)) {
                Response::error('Inspection ID and light status required', 400);
                return;
            }

            $inspector = AuthMiddleware::authenticate();

            // Update inspection
            $sql = "UPDATE inspections SET 
                    light_status = ?, 
                    ward_number = ?, 
                    brightness_level = ?, 
                    temperature = ?,
                    notes = ?,
                    updated_at = NOW()
                    WHERE id = ?";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "siiidsi",
                $data->light_status,
                $data->ward_number ?? 0,
                $data->brightness_level ?? 0,
                $data->temperature ?? 0,
                $data->notes ?? '',
                $data->inspection_id
            );

            if ($stmt->execute()) {
                // Update street light status if different
                if (isset($data->light_id)) {
                    $updateLight = "UPDATE street_lights SET status = ?, last_status_change = NOW() WHERE light_id = ?";
                    $updateStmt = $this->conn->prepare($updateLight);
                    $updateStmt->bind_param("ss", $data->light_status, $data->light_id);
                    $updateStmt->execute();
                }

                Response::success([
                    'inspection_id' => $data->inspection_id,
                    'status' => 'completed'
                ], 'Inspection completed', 200);
            } else {
                Response::error('Failed to complete inspection', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Get inspection history for a light
     */
    public function getInspectionHistory() {
        try {
            $light_id = $_GET['light_id'] ?? null;

            if (!$light_id) {
                Response::error('Light ID required', 400);
                return;
            }

            $sql = "SELECT i.*, u.name as inspector_name 
                    FROM inspections i
                    LEFT JOIN users u ON i.inspector_id = u.id
                    WHERE i.light_id = ?
                    ORDER BY i.inspection_date DESC
                    LIMIT 50";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("s", $light_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $inspections = [];
            while ($row = $result->fetch_assoc()) {
                $inspections[] = $row;
            }

            Response::success($inspections, 'Inspection history retrieved', 200);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Get pending inspections for ward
     */
    public function getPendingInspections() {
        try {
            $ward_number = $_GET['ward_number'] ?? null;

            $sql = "SELECT sl.*, 
                    (SELECT COUNT(*) FROM inspections WHERE light_id = sl.light_id AND DATE(inspection_date) = CURDATE()) as inspected_today
                    FROM street_lights sl
                    WHERE (? IS NULL OR sl.ward_number = ?)
                    ORDER BY sl.light_id ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $ward_number, $ward_number);
            $stmt->execute();
            $result = $stmt->get_result();

            $lights = [];
            while ($row = $result->fetch_assoc()) {
                $lights[] = $row;
            }

            Response::success($lights, 'Pending inspections retrieved', 200);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Get inspection stats for dashboard
     */
    public function getInspectionStats() {
        try {
            $inspector = AuthMiddleware::authenticate();

            // Today's inspections
            $today = date('Y-m-d');
            $sql = "SELECT 
                    COUNT(*) as total_inspections,
                    SUM(CASE WHEN light_status = 'on' THEN 1 ELSE 0 END) as lights_on,
                    SUM(CASE WHEN light_status = 'off' THEN 1 ELSE 0 END) as lights_off,
                    SUM(CASE WHEN light_status = 'error' THEN 1 ELSE 0 END) as lights_error
                    FROM inspections
                    WHERE DATE(inspection_date) = ? AND inspector_id = ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("si", $today, $inspector['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $stats = $result->fetch_assoc();

            Response::success($stats, 'Inspection stats retrieved', 200);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
}
?>
