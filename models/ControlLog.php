<?php
// backend/models/ControlLog.php

class ControlLog {
    private $conn;
    private $table = 'control_logs';

    public $id;
    public $light_id;
    public $action;
    public $performed_by;
    public $user_id;
    public $control_type;
    public $previous_status;
    public $new_status;
    public $reason;
    public $created_at;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table . "
                  (light_id, action, performed_by, user_id, control_type, previous_status, new_status, reason, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sssissss", 
            $this->light_id,
            $this->action,
            $this->performed_by,
            $this->user_id,
            $this->control_type,
            $this->previous_status,
            $this->new_status,
            $this->reason
        );

        return $stmt->execute();
    }

    public function getByLightId($lightId, $limit = 10) {
        $query = "SELECT * FROM " . $this->table . "
                  WHERE light_id = ?
                  ORDER BY created_at DESC
                  LIMIT ?";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $lightId, $limit);
        $stmt->execute();

        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
?>
