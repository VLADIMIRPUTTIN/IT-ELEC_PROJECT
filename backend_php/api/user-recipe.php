<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set error reporting to log only
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

try {
    // Get user ID from POST data directly
    $userId = isset($_POST['user_id']) ? (int)$_POST['user_id'] : null;
    
    // Validate user ID from POST
    if (empty($userId) || !is_numeric($userId)) {
        // Try to get it from auth token
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
    if (empty($userId) || !is_numeric($userId)) {
        echo json_encode(['success' => false, 'error' => 'Invalid user ID.']);
        exit;
    }
    
    // Handle image upload if present
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        // Create directory if it doesn't exist
        $uploadDir = '../uploads/userrecipeimage/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                throw new Exception('Failed to create upload directory');
            }
        }
        
        // Generate a unique filename
        $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $newFileName = uniqid('recipe_') . '_' . time() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $newFileName;
        
        // Move the uploaded file
        if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath)) {
            // Store just the filename in POST data for the API
            $_POST['image'] = $newFileName;
            
            // You can also add a flag to indicate this is a user recipe image
            $_POST['is_user_recipe_image'] = true;
        } else {
            throw new Exception('Failed to move uploaded file');
        }
    }
    
    // Call the API method with the user ID and modified POST data
    $response = $api->createUserRecipe($userId, $_POST);
    
    // Ensure proper content type header
    header('Content-Type: application/json');
    
    // Return the API response
    echo $response;
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>