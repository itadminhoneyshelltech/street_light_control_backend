<?php
// Database configuration
$host = 'localhost';
$user = 'root';
$password = 'Honeyshell2024';
$database = 'street_light_control';

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Read the SQL file
$sql_file = __DIR__ . '/inspection-tables.sql';
if (!file_exists($sql_file)) {
    die("SQL file not found: $sql_file");
}

$sql_content = file_get_contents($sql_file);

// Execute SQL statements
$statements = array_filter(array_map('trim', explode(';', $sql_content)));
$executed = 0;
$errors = 0;

foreach ($statements as $statement) {
    if (empty($statement)) continue;
    
    if ($conn->query($statement) === TRUE) {
        echo "✓ Statement executed successfully\n";
        $executed++;
    } else {
        echo "✗ Error executing statement: " . $conn->error . "\n";
        echo "Statement: " . substr($statement, 0, 100) . "...\n";
        $errors++;
    }
}

echo "\n=== Summary ===\n";
echo "Executed: $executed\n";
echo "Errors: $errors\n";

// Verify tables were created
echo "\n=== Verifying Tables ===\n";

$tables_to_check = ['inspections', 'inspection_history'];
foreach ($tables_to_check as $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    if ($result && $result->num_rows > 0) {
        echo "✓ Table '$table' exists\n";
        
        // Show table structure
        $columns = $conn->query("DESCRIBE $table");
        echo "  Columns: ";
        $col_names = [];
        while ($row = $columns->fetch_assoc()) {
            $col_names[] = $row['Field'];
        }
        echo implode(", ", $col_names) . "\n";
    } else {
        echo "✗ Table '$table' not found\n";
    }
}

$conn->close();
echo "\n✓ Database migration completed!\n";
?>
