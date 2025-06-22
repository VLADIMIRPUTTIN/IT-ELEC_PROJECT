<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

// For debugging
error_log("Share recipe request received");

// Get JSON input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Log inputs for debugging
error_log("Input data: " . print_r($input, true));

try {
    // Check if required parameters are present
    if (!isset($input['user_id']) || !isset($input['recipe_id'])) {
        throw new Exception("User ID and Recipe ID are required");
    }
    
    $userId = intval($input['user_id']);
    $recipeId = intval($input['recipe_id']);
    
    // Validate input types
    if (!is_int($userId) || $userId <= 0) {
        throw new Exception("Invalid user ID format");
    }
    
    if (!is_int($recipeId) || $recipeId <= 0) {
        throw new Exception("Invalid recipe ID format");
    }
    
    // Log token information
    $headers = getallheaders();
    error_log("Headers: " . print_r($headers, true));
    
    // Get token from headers
    $token = null;
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    } elseif (isset($headers['authorization'])) {
        $token = str_replace('Bearer ', '', $headers['authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    }
    
    error_log("Token: " . ($token ?? 'Not found'));
    
    // First check if the recipe exists
    $recipeExistsQuery = "SELECT id, user_id FROM user_recipes WHERE id = ?";
    $recipeExistsStmt = $mysqli->prepare($recipeExistsQuery);
    $recipeExistsStmt->bind_param("i", $recipeId);
    $recipeExistsStmt->execute();
    $recipeExistsResult = $recipeExistsStmt->get_result();
    
    if ($recipeExistsResult->num_rows === 0) {
        throw new Exception("Recipe not found");
    }
    
    $recipeData = $recipeExistsResult->fetch_assoc();
    
    // If user ID in recipe doesn't match requesting user ID
    if ($recipeData['user_id'] != $userId) {
        error_log("Recipe belongs to user {$recipeData['user_id']} but request is from user $userId");
        throw new Exception("This recipe doesn't belong to the requesting user");
    }
    
    // Check if the recipe is already shared
    $sharedCheckQuery = "SELECT id FROM shared_recipes WHERE recipe_id = ?";
    $sharedCheckStmt = $mysqli->prepare($sharedCheckQuery);
    $sharedCheckStmt->bind_param("i", $recipeId);
    $sharedCheckStmt->execute();
    $sharedCheckResult = $sharedCheckStmt->get_result();
    
    if ($sharedCheckResult->num_rows > 0) {
        // Recipe is already shared
        echo json_encode([
            'success' => true,
            'message' => 'Recipe is already shared'
        ]);
        exit;
    }
    
    // Share the recipe
    $shareQuery = "INSERT INTO shared_recipes (recipe_id, user_id, shared_at) VALUES (?, ?, NOW())";
    $shareStmt = $mysqli->prepare($shareQuery);
    $shareStmt->bind_param("ii", $recipeId, $userId);
    $shareStmt->execute();
    
    if ($shareStmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Recipe shared successfully'
        ]);
    } else {
        throw new Exception("Failed to share recipe. Database error: " . $mysqli->error);
    }
    
} catch (Exception $e) {
    error_log("Share recipe error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>