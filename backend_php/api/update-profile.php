<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

// Get PUT data
$inputJSON = file_get_contents('php://input');
$inputData = json_decode($inputJSON, true);

if (!$inputData) {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid input data'
    ]);
    exit();
}

// Update user profile
try {
    // Start with basic validation
    $updateFields = [];
    $updateParams = [];
    $paramTypes = '';
    
    // Check which fields to update
    if (isset($inputData['username']) && !empty($inputData['username'])) {
        $updateFields[] = 'username = ?';
        $updateParams[] = $inputData['username'];
        $paramTypes .= 's';
    }
    
    if (isset($inputData['email']) && !empty($inputData['email'])) {
        // Validate email
        if (!filter_var($inputData['email'], FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'success' => false,
                'error' => 'Invalid email format'
            ]);
            exit();
        }
        
        // Check if email already exists for another user
        $checkEmailStmt = $mysqli->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $checkEmailStmt->bind_param("si", $inputData['email'], $userId);
        $checkEmailStmt->execute();
        $checkResult = $checkEmailStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            echo json_encode([
                'success' => false,
                'error' => 'Email is already in use by another account'
            ]);
            exit();
        }
        
        $updateFields[] = 'email = ?';
        $updateParams[] = $inputData['email'];
        $paramTypes .= 's';
    }
    
    // Handle password update if provided
    if (isset($inputData['current_password']) && isset($inputData['new_password']) && 
        !empty($inputData['current_password']) && !empty($inputData['new_password'])) {
        
        // Verify current password
        $passwordStmt = $mysqli->prepare("SELECT password FROM users WHERE id = ?");
        $passwordStmt->bind_param("i", $userId);
        $passwordStmt->execute();
        $passwordResult = $passwordStmt->get_result();
        
        if ($passwordResult->num_rows === 0) {
            echo json_encode([
                'success' => false,
                'error' => 'User not found'
            ]);
            exit();
        }
        
        $userData = $passwordResult->fetch_assoc();
        
        if (!password_verify($inputData['current_password'], $userData['password'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Current password is incorrect'
            ]);
            exit();
        }
        
        // Update with new hashed password
        $hashedPassword = password_hash($inputData['new_password'], PASSWORD_DEFAULT);
        $updateFields[] = 'password = ?';
        $updateParams[] = $hashedPassword;
        $paramTypes .= 's';
    }
    
    // If there are fields to update
    if (count($updateFields) > 0) {
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $updateParams[] = $userId;
        $paramTypes .= 'i';
        
        $stmt = $mysqli->prepare($sql);
        $stmt->bind_param($paramTypes, ...$updateParams);
        $result = $stmt->execute();
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update profile: ' . $mysqli->error
            ]);
        }
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'No changes to update'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>