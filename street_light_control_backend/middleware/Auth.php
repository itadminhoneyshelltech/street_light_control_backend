<?php
// backend/middleware/Auth.php
// Authentication middleware

class AuthMiddleware {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public static function getToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    public static function authenticate() {
        $token = self::getToken();
        if (!$token) {
            Response::error('No token provided', 401);
        }

        $user = JWT::decode($token);
        if (!$user) {
            Response::error('Invalid or expired token', 401);
        }

        return $user;
    }

    public static function requireRole($user, $allowedRoles) {
        if (!in_array($user['role'], $allowedRoles)) {
            Response::error('Insufficient permissions', 403);
        }
    }
}
?>
