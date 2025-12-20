<?php
// Add state, district, taluk, ward_number columns to street_lights table if they don't exist

$conn = new mysqli('localhost', 'root', 'Honeyshell2024', 'street_light_control');

if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

echo "🔧 Adding filter columns to street_lights table...\n";

$columns = [
    'state' => 'VARCHAR(100)',
    'district' => 'VARCHAR(100)',
    'taluk' => 'VARCHAR(100)',
    'ward_number' => 'VARCHAR(50)',
];

foreach ($columns as $col => $type) {
    $check = $conn->query("SHOW COLUMNS FROM street_lights LIKE '$col'");
    if ($check->num_rows === 0) {
        $sql = "ALTER TABLE street_lights ADD COLUMN $col $type AFTER city";
        if ($conn->query($sql)) {
            echo "✅ Added column: $col ($type)\n";
        } else {
            echo "❌ Failed to add column $col: " . $conn->error . "\n";
        }
    } else {
        echo "⚠️  Column $col already exists, skipping.\n";
    }
}

// Optional: populate some sample data for testing
echo "\n📝 Adding sample data to new columns...\n";
$conn->query("UPDATE street_lights SET state='Karnataka', district='Bengaluru', taluk='Bengaluru North', ward_number='Ward-1' WHERE id=1");
$conn->query("UPDATE street_lights SET state='Karnataka', district='Bengaluru', taluk='Bengaluru South', ward_number='Ward-2' WHERE id=2");
$conn->query("UPDATE street_lights SET state='Karnataka', district='Mysuru', taluk='Mysuru Urban', ward_number='Ward-3' WHERE id=3");
$conn->query("UPDATE street_lights SET state='Tamil Nadu', district='Chennai', taluk='Chennai North', ward_number='Ward-4' WHERE id=4");
$conn->query("UPDATE street_lights SET state='Tamil Nadu', district='Chennai', taluk='Chennai South', ward_number='Ward-5' WHERE id=5");
echo "✅ Sample data updated.\n";

$conn->close();
echo "\n✅ Done!\n";
?>
