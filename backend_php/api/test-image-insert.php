<?php
require_once './config/db_connection.php';

// Test a direct insert with an image path
$userId = 1; // Replace with a valid user ID
$name = "Test Recipe With Image";
$category = "Test";
$description = "This is a test recipe to verify image saving";
$ingredients = json_encode([["ingredient_name" => "Test ingredient", "amount" => "1", "unit" => "piece"]]);
$steps = json_encode([["step_number" => 1, "instruction" => "Test step", "preparation_time" => "5 min"]]);
$imagePath = "test_image_" . time() . ".jpg";  // Test image filename

// Direct SQL insert
$query = "INSERT INTO user_recipes (user_id, name, category, description, ingredients_list, preparation_steps, image, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
$stmt = $mysqli->prepare($query);
$stmt->bind_param("issssss", 
    $userId, 
    $name,
    $category, 
    $description,
    $ingredients,
    $steps,
    $imagePath
);

if ($stmt->execute()) {
    echo "Test successful! Recipe ID: " . $stmt->insert_id . "<br>";
    echo "Image path saved: " . $imagePath;
} else {
    echo "Error: " . $stmt->error;
}
?>