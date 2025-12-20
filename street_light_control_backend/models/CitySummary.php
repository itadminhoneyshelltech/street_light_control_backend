<?php
// backend/models/CitySummary.php

class CitySummary {
    private $conn;
    private $table = 'city_summary';

    public $id;
    public $city;
    public $total_lights;
    public $lights_on;
    public $lights_off;
    public $lights_in_error;
    public $last_updated;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function getByCity($city) {
        $query = "SELECT * FROM " . $this->table . " WHERE city = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();

        return $stmt->get_result()->fetch_assoc();
    }

    public function update() {
        $query = "INSERT INTO " . $this->table . "
                  (city, total_lights, lights_on, lights_off, lights_in_error, last_updated)
                  VALUES (?, ?, ?, ?, ?, NOW())
                  ON DUPLICATE KEY UPDATE
                  total_lights = VALUES(total_lights),
                  lights_on = VALUES(lights_on),
                  lights_off = VALUES(lights_off),
                  lights_in_error = VALUES(lights_in_error),
                  last_updated = NOW()";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("siiii",
            $this->city,
            $this->total_lights,
            $this->lights_on,
            $this->lights_off,
            $this->lights_in_error
        );

        return $stmt->execute();
    }

    public static function updateCitySummary($conn, $city) {
        $query = "SELECT status, COUNT(*) as count FROM street_lights WHERE city = ? GROUP BY status";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("s", $city);
        $stmt->execute();
        $result = $stmt->get_result();

        $total = 0;
        $on = 0;
        $off = 0;
        $error = 0;

        while ($row = $result->fetch_assoc()) {
            $total += $row['count'];
            if ($row['status'] === 'on') $on = $row['count'];
            else if ($row['status'] === 'off') $off = $row['count'];
            else if ($row['status'] === 'error') $error = $row['count'];
        }

        $summary = new CitySummary($conn);
        $summary->city = $city;
        $summary->total_lights = $total;
        $summary->lights_on = $on;
        $summary->lights_off = $off;
        $summary->lights_in_error = $error;
        $summary->update();
    }
}
?>
