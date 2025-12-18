<?php
// backend/models/StreetLight.php

class StreetLight {
    private $conn;
    private $table = 'street_lights';

    public $id;
    public $light_id;
    public $name;
    public $city;
    public $latitude;
    public $longitude;
    public $address;
    public $status;
    public $is_automatic;
    public $last_status_change;
    public $error_details;
    public $brightness;
    public $energy_consumption;
    public $installation_date;
    public $maintenance_schedule;
    public $created_at;
    public $updated_at;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getAll($city = null) {
        $query = "SELECT * FROM " . $this->table;
        if ($city) {
            $query .= " WHERE city = ?";
        }
        $query .= " ORDER BY name ASC";

        $stmt = $this->conn->prepare($query);
        if ($city) {
            $stmt->bind_param("s", $city);
        }
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function getById($lightId) {
        $query = "SELECT * FROM " . $this->table . " WHERE light_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $lightId);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    public function updateStatus($lightId, $status, $errorDetails = null) {
        $query = "UPDATE " . $this->table . "
                  SET status = ?, last_status_change = NOW(), error_details = ?, updated_at = NOW()
                  WHERE light_id = ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sss", $status, $errorDetails, $lightId);

        return $stmt->execute();
    }

    public function getByCity($city) {
        $query = "SELECT id, light_id, name, latitude, longitude, address, status
                  FROM " . $this->table . "
                  WHERE city = ?
                  ORDER BY name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
?>
