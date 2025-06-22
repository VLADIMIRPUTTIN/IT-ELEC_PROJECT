<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

try {
    // Query to fetch all shared recipes with user information
    $query = "SELECT sr.id as share_id, sr.recipe_id, sr.shared_at, ur.name, ur.description, ur.category, 
              ur.image, u.username, u.id as user_id 
              FROM shared_recipes sr 
              JOIN user_recipes ur ON sr.recipe_id = ur.id 
              JOIN users u ON ur.user_id = u.id 
              ORDER BY sr.shared_at DESC";
    
    $result = $mysqli->query($query);
    
    if (!$result) {
        throw new Exception($mysqli->error);
    }
    
    $recipes = [];
    while ($row = $result->fetch_assoc()) {
        // Format the recipe data as needed
        $recipes[] = [
            'id' => $row['recipe_id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'category' => $row['category'],
            'image' => $row['image'],
            'username' => $row['username'],
            'user_id' => $row['user_id'],
            'shared_at' => $row['shared_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'recipes' => $recipes
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch shared recipes: ' . $e->getMessage()
    ]);
}
?>