<?php
// run-ai-chatbot-sql.php
// Script to run AI chatbot database migration

require_once __DIR__ . '/config/Config.php';
require_once __DIR__ . '/config/Database.php';

$database = new Database();
$conn = $database->connect();

if (!$conn) {
    die("Database connection failed!");
}

echo "Running AI Chatbot database migration...\n\n";

// Read SQL file
$sql = file_get_contents(__DIR__ . '/ai-chatbot-tables.sql');

if (!$sql) {
    die("Could not read ai-chatbot-tables.sql file!");
}

// Execute multi-query
if ($conn->multi_query($sql)) {
    do {
        // Store first result set
        if ($result = $conn->store_result()) {
            while ($row = $result->fetch_assoc()) {
                print_r($row);
            }
            $result->free();
        }
        
        // Print any errors
        if ($conn->errno) {
            echo "Error: " . $conn->error . "\n";
        }
    } while ($conn->next_result());
}

echo "\n✅ AI Chatbot tables created successfully!\n";
echo "Tables created:\n";
echo "  - ai_chatbot_conversations\n";
echo "  - ai_automation_log\n";
echo "  - ai_command_patterns\n\n";

$database->close();
?>
