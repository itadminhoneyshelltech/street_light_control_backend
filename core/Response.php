<?php
// backend/core/Response.php
// Standardized API Response handler

class Response {
    private $statusCode;
    private $data;
    private $message;
    private $error;

    public function __construct($statusCode = 200) {
        $this->statusCode = $statusCode;
    }

    public function setData($data) {
        $this->data = $data;
        return $this;
    }

    public function setMessage($message) {
        $this->message = $message;
        return $this;
    }

    public function setError($error) {
        $this->error = $error;
        return $this;
    }

    public function send() {
        http_response_code($this->statusCode);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'status' => $this->statusCode,
            'message' => $this->message,
        ];

        if ($this->data !== null) {
            $response['data'] = $this->data;
        }

        if ($this->error !== null) {
            $response['error'] = $this->error;
        }

        echo json_encode($response);
        exit;
    }

    public static function success($data = null, $message = 'Success', $statusCode = 200) {
        $response = new self($statusCode);
        if ($data) $response->setData($data);
        $response->setMessage($message);
        $response->send();
    }

    public static function error($error, $statusCode = 400) {
        $response = new self($statusCode);
        $response->setError($error);
        $response->send();
    }
}
?>
