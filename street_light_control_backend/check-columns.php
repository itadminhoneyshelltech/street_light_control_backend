<?php
$conn = new mysqli('localhost', 'root', 'Honeyshell2024', 'street_light_control');
$result = $conn->query('SHOW COLUMNS FROM city_summary');
echo "city_summary columns:\n";
while($row = $result->fetch_assoc()) {
    echo "  " . $row['Field'] . ": " . $row['Type'] . "\n";
}
$conn->close();
?>
