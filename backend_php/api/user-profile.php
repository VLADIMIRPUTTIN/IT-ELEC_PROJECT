<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

// Get user ID from query parameter
$userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$userId) {
    echo json_encode([
        'success' => false,
        'error' => 'User ID is required'
    ]);
    exit();
}

// Get user profile data
try {
    // Fetch user data using userId
    $query = "SELECT id, username, email, profile_image FROM users WHERE id = ?";
    $stmt = $mysqli->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $userData = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'user' => $userData
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>