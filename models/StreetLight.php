<?php
// backend/models/StreetLight.php

class StreetLight {
    private $conn;
    private $table = 'street_lights';

    public $id;
    public $light_id;
    public $name;
    public $city;
    public $state;
    public $district;
    public $taluk;
    public $ward_number;
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

    public function search($filters = [], $forMap = false) {
        $select = $forMap
            ? "SELECT id, light_id, name, latitude, longitude, address, status"
            : "SELECT *";
        $query = $select . " FROM " . $this->table . " WHERE 1=1";

        $params = [];
        $types = "";

        if (!empty($filters['city'])) { $query .= " AND city = ?"; $params[] = $filters['city']; $types .= 's'; }
        if (!empty($filters['state'])) { $query .= " AND state = ?"; $params[] = $filters['state']; $types .= 's'; }
        if (!empty($filters['district'])) { $query .= " AND district = ?"; $params[] = $filters['district']; $types .= 's'; }
        if (!empty($filters['taluk'])) { $query .= " AND taluk = ?"; $params[] = $filters['taluk']; $types .= 's'; }
        if (!empty($filters['ward'])) { $query .= " AND ward_number = ?"; $params[] = $filters['ward']; $types .= 's'; }
        if (!empty($filters['status'])) { $query .= " AND status = ?"; $params[] = $filters['status']; $types .= 's'; }

        $query .= " ORDER BY name ASC";

        $stmt = $this->conn->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
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

    public function getFilterOptions($city = null) {
        $options = [
            'states' => [],
            'districts' => [],
            'taluks' => [],
            'wards' => [],
            'statuses' => [],
        ];

        $base = "FROM " . $this->table . " WHERE 1=1";
        $types = '';
        $params = [];
        if ($city) { $base .= " AND city = ?"; $types .= 's'; $params[] = $city; }

        $options['states'] = $this->distinct("state", $base, $types, $params);
        $options['districts'] = $this->distinct("district", $base, $types, $params);
        $options['taluks'] = $this->distinct("taluk", $base, $types, $params);
        $options['wards'] = $this->distinct("ward_number", $base, $types, $params);
        $options['statuses'] = $this->distinct("status", $base, $types, $params);

        return $options;
    }

    private function distinct($column, $base, $types, $params) {
        $query = "SELECT DISTINCT $column as value " . $base . " AND $column IS NOT NULL AND $column <> '' ORDER BY $column ASC";
        $stmt = $this->conn->prepare($query);
        if (!empty($params)) { $stmt->bind_param($types, ...$params); }
        $stmt->execute();
        $res = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        return array_map(function($row){ return $row['value']; }, $res);
    }
}
?>
