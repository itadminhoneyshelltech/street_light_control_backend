<?php
// backend/config/Config.php
// Application configuration

define('APP_NAME', 'Street Light Control System');
define('APP_VERSION', '1.0.0');
define('APP_ENV', getenv('APP_ENV') ?: 'development');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'street_light_control');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: 'Honeyshell2024');
define('DB_PORT', getenv('DB_PORT') ?: 3306);

// JWT Configuration
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRATION', 86400); // 24 hours

// API Configuration
define('API_URL', getenv('API_URL') ?: 'http://localhost:8000/api');
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:3000');

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:3001',
    getenv('FRONTEND_URL') ?: ''
]);

// Pagination
define('ITEMS_PER_PAGE', 50);

// Error Logging
define('LOG_PATH', __DIR__ . '/../logs/');
?>
