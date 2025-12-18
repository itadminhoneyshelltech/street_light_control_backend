<?php
// backend/index.php
// Main entry point for API

// Load configuration first
require_once __DIR__ . '/config/Config.php';

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', APP_ENV === 'development' ? 1 : 0);

// CORS headers - Allow any of the configured origins
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load core classes
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/JWT.php';
require_once __DIR__ . '/core/Router.php';

// Load middleware
require_once __DIR__ . '/middleware/Auth.php';

// Load models
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/StreetLight.php';
require_once __DIR__ . '/models/ControlLog.php';
require_once __DIR__ . '/models/CitySummary.php';

// Load controllers
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/LightController.php';
require_once __DIR__ . '/controllers/CCMSController.php';
require_once __DIR__ . '/controllers/DeviceController.php';
require_once __DIR__ . '/controllers/InspectionController.php';

// Initialize database
$database = new Database();
$conn = $database->connect();

// Initialize router
$router = new Router();

// Authentication routes
$router->post('/auth/register', function() use ($conn) {
    $controller = new AuthController($conn);
    $controller->register();
});

$router->post('/auth/login', function() use ($conn) {
    $controller = new AuthController($conn);
    $controller->login();
});

// Light routes
$router->get('/lights/list', function() use ($conn) {
    $controller = new LightController($conn);
    $controller->getLights();
});

$router->get('/lights/detail', function() use ($conn) {
    $controller = new LightController($conn);
    $controller->getLightDetail();
});

$router->get('/lights/summary', function() use ($conn) {
    $controller = new LightController($conn);
    $controller->getCitySummary();
});

$router->get('/lights/map', function() use ($conn) {
    $controller = new LightController($conn);
    $controller->getLightsForMap();
});

$router->post('/lights/control', function() use ($conn) {
    $controller = new LightController($conn);
    $controller->controlLight();
});

$router->post('/lights/update-status', function() use ($conn) {
    $controller = new LightController($conn);
    $controller->updateLightStatus();
});

// CCMS Routes
$router->get('/ccms/meter-data', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->getMeterData();
});

$router->get('/ccms/energy-parameters', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->getEnergyParameters();
});

$router->post('/ccms/schedule', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->setSchedule();
});

$router->get('/ccms/battery-status', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->getBatteryStatus();
});

$router->post('/ccms/battery-status', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->updateBatteryStatus();
});

$router->post('/ccms/energy-parameters', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->recordEnergyParameters();
});

$router->get('/ccms/alerts', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->getAlerts();
});

$router->post('/ccms/alerts/resolve', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->resolveAlert();
});

$router->get('/ccms/dashboard-summary', function() use ($conn) {
    $controller = new CCMSController($conn);
    $controller->getDashboardSummary();
});

// Device Communication Routes (NEW)
$router->post('/device/configure', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->configureDevice();
});

$router->post('/device/status', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->updateStatus();
});

$router->get('/device/commands', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->getCommands();
});

$router->post('/device/command-ack', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->acknowledgeCommand();
});

$router->post('/device/alert', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->sendAlert();
});

$router->get('/device/health', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->getHealth();
});

$router->get('/device/firmware', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->checkFirmwareUpdate();
});

$router->post('/device/logs', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->uploadLogs();
});

$router->post('/device/sync', function() use ($conn) {
    $controller = new DeviceController($conn);
    $controller->syncOfflineData();
});

// Inspection Routes (Field Inspection)
$router->post('/inspection/start', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->startInspection();
});

$router->post('/inspection/photo', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->uploadPhoto();
});

$router->post('/inspection/gps', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->recordGPS();
});

$router->post('/inspection/complete', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->completeInspection();
});

$router->get('/inspection/history', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->getInspectionHistory();
});

$router->get('/inspection/pending', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->getPendingInspections();
});

$router->get('/inspection/stats', function() use ($conn) {
    $controller = new InspectionController($conn);
    $controller->getInspectionStats();
});

// Health check
$router->get('/health', function() {
    Response::success(['status' => 'Backend server is running']);
});

// Base API route
$router->get('/', function() {
    Response::success(['message' => 'Street Light Control API', 'version' => '1.0.0', 'endpoints' => [
        'auth' => '/auth/login, /auth/register',
        'lights' => '/lights/list, /lights/detail, /lights/summary, /lights/map',
        'device' => '/device/configure, /device/status, /device/commands, /device/command-ack, /device/alert, /device/health, /device/firmware, /device/logs, /device/sync',
        'ccms' => '/ccms/meter-data, /ccms/energy-parameters, /ccms/schedule, /ccms/battery-status, /ccms/alerts, /ccms/dashboard-summary',
        'inspection' => '/inspection/start, /inspection/photo, /inspection/gps, /inspection/complete, /inspection/history, /inspection/pending, /inspection/stats',
        'health' => '/health'
    ]]);
});

// Dispatch the request
$router->dispatch();

$database->close();
?>
