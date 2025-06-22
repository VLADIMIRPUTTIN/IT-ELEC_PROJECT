<?php
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

// Check if user ID is provided
if (!isset($_POST['user_id']) || empty($_POST['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'User ID is required'
    ]);
    exit();
}

$userId = $_POST['user_id'];

// Check if file was uploaded
if (!isset($_FILES['profile_image']) || $_FILES['profile_image']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'success' => false,
        'error' => 'No image file uploaded or upload error'
    ]);
    exit();
}

// Process file upload
try {
    $file = $_FILES['profile_image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
        ]);
        exit();
    }
    
    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if ($file['size'] > $maxSize) {
        echo json_encode([
            'success' => false,
            'error' => 'File size exceeds the 5MB limit.'
        ]);
        exit();
    }
    
    // Create directory if it doesn't exist - with full path
    $uploadDir = '../uploads/profiles/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);  // Use recursive param to create full path
        
        // For debugging - log the creation
        error_log("Created directory: " . realpath($uploadDir));
    }
    
    // Check directory is writable
    if (!is_writable($uploadDir)) {
        error_log("Directory is not writable: " . realpath($uploadDir));
        chmod($uploadDir, 0777);  // Try to make it writable
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'user_' . $userId . '_' . time() . '.' . $extension;
    $uploadPath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Update profile_image in database
        $imagePath = 'uploads/profiles/' . $filename;
        $query = "UPDATE users SET profile_image = ? WHERE id = ?";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param("si", $imagePath, $userId);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0 || $mysqli->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile image updated successfully',
                'image_path' => $imagePath
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Failed to update profile image in database'
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to move uploaded file'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>