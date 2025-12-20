<?php
// backend/controllers/AuthController.php

class AuthController {
    private $conn;
    private $user;

    public function __construct($conn) {
        $this->conn = $conn;
        $this->user = new User($conn);
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->name, $data->email, $data->password, $data->city)) {
            Response::error('Missing required fields', 400);
        }

        // Check if user exists
        if ($this->user->findByEmail($data->email)) {
            Response::error('User already exists', 400);
        }

        $this->user->name = $data->name;
        $this->user->email = $data->email;
        $this->user->password = $data->password;
        $this->user->city = $data->city;
        $this->user->role = $data->role ?? 'viewer';
        $this->user->is_active = 1;

        if (!$this->user->create()) {
            Response::error('Registration failed', 500);
        }

        $user = $this->user->findByEmail($data->email);

        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'city' => $user['city']
        ];

        $token = JWT::encode($payload);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'city' => $user['city']
            ]
        ], 'User registered successfully', 201);
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->email, $data->password)) {
            Response::error('Email and password required', 400);
        }

        $user = $this->user->findByEmail($data->email);
        if (!$user || !$this->user->verifyPassword($data->password, $user['password'])) {
            Response::error('Invalid credentials', 401);
        }

        $payload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'city' => $user['city']
        ];

        $token = JWT::encode($payload);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'city' => $user['city']
            ]
        ], 'Login successful');
    }
}
?>
