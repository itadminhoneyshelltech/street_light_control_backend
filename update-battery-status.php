<?php
$conn = new mysqli('localhost', 'root', 'Honeyshell2024', 'street_light_control');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Set first 2 lights to have critical battery (< 20%)
$sql = "UPDATE street_lights SET battery_percentage = 10 WHERE id IN (1, 2)";
if ($conn->query($sql)) {
    echo "✅ Updated " . $conn->affected_rows . " lights with critical battery (10%)\n";
}

// Set next 2 lights to have low battery (20-50%)
$sql2 = "UPDATE street_lights SET battery_percentage = 35 WHERE id IN (3, 4)";
if ($conn->query($sql2)) {
    echo "✅ Updated " . $conn->affected_rows . " lights with low battery (35%)\n";
}

// Check what we have
echo "\n📊 Current battery statuses:\n";
$result = $conn->query('SELECT light_id, battery_percentage, battery_status FROM street_lights');
while($row = $result->fetch_assoc()) {
    echo $row['light_id'] . ': ' . $row['battery_percentage'] . '% (' . $row['battery_status'] . ")\n";
}

$conn->close();
echo "\n✅ Done!\n";
?>
