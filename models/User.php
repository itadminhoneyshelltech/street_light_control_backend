<?php
// backend/models/User.php

class User {
    private $conn;
    private $table = 'users';

    public $id;
    public $name;
    public $email;
    public $password;
    public $role;
    public $city;
    public $is_active;
    public $created_at;
    public $updated_at;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . "
                  (name, email, password, role, city, is_active, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return false;
        }

        $hashedPassword = password_hash($this->password, PASSWORD_BCRYPT);
        $stmt->bind_param("sssssi", $this->name, $this->email, $hashedPassword, $this->role, $this->city, $this->is_active);

        return $stmt->execute();
    }

    public function findByEmail($email) {
        $query = "SELECT * FROM " . $this->table . " WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    public function findById($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
?>
