<?php
// Disable output buffering and clear any existing output
if (ob_get_level()) ob_end_clean();

// Set headers for cross-origin requests and JSON response
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

try {
    // Get user ID from query string first
    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
    
    // If no user_id in query string, try to get it from auth token
    if (empty($userId)) {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
        
        if ($authHeader) {
            $token = str_replace('Bearer ', '', $authHeader);
            // Query to get user ID from auth token
            $query = "SELECT id FROM users WHERE auth_token = ?";
            $stmt = $mysqli->prepare($query);
            $stmt->bind_param("s", $token);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $userId = (int)$row['id'];
            }
        }
    }
    
    // Final check if we have a valid user ID
    if (empty($userId)) {
        echo json_encode(['success' => false, 'error' => 'Invalid user ID']);
        exit;
    }
    
    // Query user recipes
    $query = "SELECT * FROM user_recipes WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $recipes = [];
    while ($row = $result->fetch_assoc()) {
        // Handle JSON fields - parse them once before sending
        $row['ingredients_list'] = json_decode($row['ingredients_list'], true);
        $row['preparation_steps'] = json_decode($row['preparation_steps'], true);
        $recipes[] = $row;
    }
    
    echo json_encode(['success' => true, 'recipes' => $recipes]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Error: ' . $e->getMessage()]);
}
?>