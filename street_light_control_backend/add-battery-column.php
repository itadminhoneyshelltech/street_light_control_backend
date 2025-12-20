<?php
/**
 * Add battery_percentage column to street_lights table
 */

$conn = new mysqli('localhost', 'root', 'Honeyshell2024', 'street_light_control');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Add battery_percentage column if it doesn't exist
$checkSql = "SHOW COLUMNS FROM street_lights LIKE 'battery_percentage'";
$result = $conn->query($checkSql);

if ($result->num_rows == 0) {
    $sql = "ALTER TABLE street_lights ADD COLUMN battery_percentage INT DEFAULT 100";
    if ($conn->query($sql)) {
        echo "✅ Successfully added battery_percentage column\n";
    } else {
        echo "❌ Error adding battery_percentage: " . $conn->error . "\n";
    }
} else {
    echo "ℹ️  battery_percentage column already exists\n";
}

// Add battery_status column if it doesn't exist
$checkSql2 = "SHOW COLUMNS FROM street_lights LIKE 'battery_status'";
$result2 = $conn->query($checkSql2);

if ($result2->num_rows == 0) {
    $sql2 = "ALTER TABLE street_lights ADD COLUMN battery_status ENUM('good', 'low', 'critical') DEFAULT 'good'";
    if ($conn->query($sql2)) {
        echo "✅ Successfully added battery_status column\n";
    } else {
        echo "❌ Error adding battery_status: " . $conn->error . "\n";
    }
} else {
    echo "ℹ️  battery_status column already exists\n";
}

// Update existing rows with sample battery data
$updateSql = "UPDATE street_lights 
              SET battery_percentage = FLOOR(50 + RAND() * 50),
                  battery_status = CASE 
                    WHEN battery_percentage < 20 THEN 'critical'
                    WHEN battery_percentage < 50 THEN 'low'
                    ELSE 'good'
                  END";

if ($conn->query($updateSql)) {
    echo "✅ Successfully populated battery data for existing lights\n";
    echo "   Updated " . $conn->affected_rows . " lights\n";
} else {
    echo "❌ Error updating battery data: " . $conn->error . "\n";
}

$conn->close();
echo "\n✅ Migration complete!\n";
?>
