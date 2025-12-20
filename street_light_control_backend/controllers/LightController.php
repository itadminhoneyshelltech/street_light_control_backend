<?php
// backend/controllers/LightController.php

class LightController {
    private $conn;
    private $streetLight;
    private $controlLog;
    private $citySummary;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->streetLight = new StreetLight($conn);
        $this->controlLog = new ControlLog($conn);
        $this->citySummary = new CitySummary($conn);
    }

    public function getLights() {
        $user = AuthMiddleware::authenticate();
        $filters = [
            'city' => $_GET['city'] ?? $user['city'] ?? null,
            'state' => $_GET['state'] ?? null,
            'district' => $_GET['district'] ?? null,
            'taluk' => $_GET['taluk'] ?? null,
            'ward' => $_GET['ward'] ?? null,
            'status' => $_GET['status'] ?? null,
        ];

        $lights = $this->streetLight->search($filters, false);
        Response::success($lights, 'Lights retrieved successfully');
    }

    public function getLightDetail() {
        $user = AuthMiddleware::authenticate();
        $lightId = $_GET['lightId'] ?? null;

        if (!$lightId) {
            Response::error('Light ID required', 400);
        }

        $light = $this->streetLight->getById($lightId);
        if (!$light) {
            Response::error('Light not found', 404);
        }

        $logs = $this->controlLog->getByLightId($lightId, 10);

        Response::success([
            'light' => $light,
            'recentLogs' => $logs
        ], 'Light details retrieved');
    }

    public function getCitySummary() {
        $user = AuthMiddleware::authenticate();
        $city = $_GET['city'] ?? $user['city'];

        $summary = $this->citySummary->getByCity($city);
        if (!$summary) {
            // Auto-generate summary if not found
            CitySummary::updateCitySummary($this->conn, $city);
            $summary = $this->citySummary->getByCity($city);
            
            if (!$summary) {
                // Still not found, return empty summary
                $summary = [
                    'city' => $city,
                    'total_lights' => 0,
                    'lights_on' => 0,
                    'lights_off' => 0,
                    'lights_in_error' => 0
                ];
            }
        }

        Response::success($summary, 'City summary retrieved');
    }

    public function controlLight() {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireRole($user, ['admin', 'operator']);

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->lightId, $data->action)) {
            Response::error('Light ID and action required', 400);
        }

        $light = $this->streetLight->getById($data->lightId);
        if (!$light) {
            Response::error('Light not found', 404);
        }

        $previousStatus = $light['status'];
        $newStatus = ($data->action === 'on') ? 'on' : 'off';

        // Update light status
        $this->streetLight->updateStatus($data->lightId, $newStatus, null);

        // Log the action
        $this->controlLog->light_id = $data->lightId;
        $this->controlLog->action = $data->action;
        $this->controlLog->performed_by = $user['email'];
        $this->controlLog->user_id = $user['id'];
        $this->controlLog->control_type = 'manual';
        $this->controlLog->previous_status = $previousStatus;
        $this->controlLog->new_status = $newStatus;
        $this->controlLog->reason = 'Manual control';
        $this->controlLog->create();

        // Update city summary
        CitySummary::updateCitySummary($this->conn, $light['city']);

        // Get updated light
        $updatedLight = $this->streetLight->getById($data->lightId);

        Response::success($updatedLight, 'Light turned ' . $data->action);
    }

    public function updateLightStatus() {
        $user = AuthMiddleware::authenticate();

        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->lightId, $data->status)) {
            Response::error('Light ID and status required', 400);
        }

        $light = $this->streetLight->getById($data->lightId);
        if (!$light) {
            Response::error('Light not found', 404);
        }

        $previousStatus = $light['status'];
        $errorDetails = $data->errorDetails ?? null;

        $this->streetLight->updateStatus($data->lightId, $data->status, $errorDetails);

        if ($previousStatus !== $data->status) {
            $this->controlLog->light_id = $data->lightId;
            $this->controlLog->action = $data->status;
            $this->controlLog->performed_by = 'System';
            $this->controlLog->user_id = null;
            $this->controlLog->control_type = 'automatic';
            $this->controlLog->previous_status = $previousStatus;
            $this->controlLog->new_status = $data->status;
            $this->controlLog->reason = $errorDetails ?? 'Automated status update';
            $this->controlLog->create();

            CitySummary::updateCitySummary($this->conn, $light['city']);
        }

        $updatedLight = $this->streetLight->getById($data->lightId);
        Response::success($updatedLight, 'Light status updated');
    }

    public function getLightsForMap() {
        $user = AuthMiddleware::authenticate();
        $filters = [
            'city' => $_GET['city'] ?? $user['city'] ?? null,
            'state' => $_GET['state'] ?? null,
            'district' => $_GET['district'] ?? null,
            'taluk' => $_GET['taluk'] ?? null,
            'ward' => $_GET['ward'] ?? null,
            'status' => $_GET['status'] ?? null,
        ];
        $lights = $this->streetLight->search($filters, true);
        Response::success($lights, 'Map data retrieved');
    }

    public function getLightFilters() {
        $user = AuthMiddleware::authenticate();
        $city = $_GET['city'] ?? $user['city'] ?? null;
        $options = $this->streetLight->getFilterOptions($city);
        Response::success($options, 'Filter options');
    }
}
?>
