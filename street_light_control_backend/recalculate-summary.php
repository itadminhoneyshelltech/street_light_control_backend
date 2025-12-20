<?php
$conn = new mysqli('localhost', 'root', 'Honeyshell2024', 'street_light_control');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// First check current street_lights data
echo "📊 Current street_lights data:\n";
$result = $conn->query('SELECT COUNT(*) as total, 
                               SUM(CASE WHEN status = "on" THEN 1 ELSE 0 END) as on_count,
                               SUM(CASE WHEN status = "off" THEN 1 ELSE 0 END) as off_count,
                               SUM(CASE WHEN status = "error" THEN 1 ELSE 0 END) as error_count
                        FROM street_lights');
$row = $result->fetch_assoc();
echo "Total: " . $row['total'] . "\n";
echo "ON: " . $row['on_count'] . "\n";
echo "OFF: " . $row['off_count'] . "\n";
echo "ERROR: " . $row['error_count'] . "\n";

// Check current city_summary
echo "\n📊 Current city_summary table:\n";
$result2 = $conn->query('SELECT * FROM city_summary');
while($row = $result2->fetch_assoc()) {
    echo "City: " . $row['city'] . "\n";
    echo "  Total: " . $row['total_lights'] . "\n";
    echo "  ON: " . $row['lights_on'] . "\n";
    echo "  OFF: " . $row['lights_off'] . "\n";
    echo "  Error: " . $row['lights_in_error'] . "\n";
    echo "  Last Updated: " . $row['last_updated'] . "\n\n";
}

// Recalculate from scratch
echo "🔄 Recalculating city_summary...\n";

// Get unique cities
$citiesResult = $conn->query('SELECT DISTINCT city FROM street_lights');
while($cityRow = $citiesResult->fetch_assoc()) {
    $city = $cityRow['city'];
    
    // Calculate stats for this city
    $statsResult = $conn->query("SELECT 
        COUNT(*) as total_lights,
        SUM(CASE WHEN status = 'on' THEN 1 ELSE 0 END) as lights_on,
        SUM(CASE WHEN status = 'off' THEN 1 ELSE 0 END) as lights_off,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as lights_in_error
        FROM street_lights WHERE city = '$city'");
    
    $stats = $statsResult->fetch_assoc();
    
    // Update or insert
    $checkSql = "SELECT id FROM city_summary WHERE city = '$city'";
    $checkResult = $conn->query($checkSql);
    
    if ($checkResult->num_rows > 0) {
        $updateSql = "UPDATE city_summary 
                      SET total_lights = " . $stats['total_lights'] . ",
                          lights_on = " . $stats['lights_on'] . ",
                          lights_off = " . $stats['lights_off'] . ",
                          lights_in_error = " . $stats['lights_in_error'] . ",
                          last_updated = NOW()
                      WHERE city = '$city'";
        $conn->query($updateSql);
        echo "✅ Updated city_summary for " . $city . "\n";
    } else {
        $insertSql = "INSERT INTO city_summary 
                      (city, total_lights, lights_on, lights_off, lights_in_error, last_updated)
                      VALUES ('$city', " . $stats['total_lights'] . ", " . $stats['lights_on'] . ", " . 
                      $stats['lights_off'] . ", " . $stats['lights_in_error'] . ", NOW())";
        $conn->query($insertSql);
        echo "✅ Inserted city_summary for " . $city . "\n";
    }
}

// Show updated values
echo "\n📊 Updated city_summary table:\n";
$result3 = $conn->query('SELECT * FROM city_summary');
while($row = $result3->fetch_assoc()) {
    echo "City: " . $row['city'] . "\n";
    echo "  Total: " . $row['total_lights'] . "\n";
    echo "  ON: " . $row['lights_on'] . "\n";
    echo "  OFF: " . $row['lights_off'] . "\n";
    echo "  Error: " . $row['lights_in_error'] . "\n";
    echo "  Last Updated: " . $row['last_updated'] . "\n\n";
}

$conn->close();
echo "✅ City summary recalculation complete!\n";
?>
