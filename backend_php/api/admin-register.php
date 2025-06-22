<?php
// Disable output buffering and clear any existing output
if (ob_get_level()) ob_end_clean();

// Set headers for cross-origin requests and JSON response
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Make sure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Only POST requests are allowed']);
    exit;
}

// Get raw POST data and decode JSON
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

// Validate input
if (!isset($data['email']) || !isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Include required files
require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

// Create API instance
$api = new Api($mysqli);

// Check if admin_users table exists
$tableExists = $mysqli->query("SHOW TABLES LIKE 'admin_users'");
if ($tableExists->num_rows == 0) {
    // Create admin_users table if it doesn't exist
    $createTable = "CREATE TABLE `admin_users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `username` varchar(50) NOT NULL,
        `email` varchar(100) NOT NULL,
        `password` varchar(255) NOT NULL,
        `auth_token` varchar(255) DEFAULT NULL,
        `token_expires` datetime DEFAULT NULL,
        `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    
    $mysqli->query($createTable);
}

// Register admin
$response = $api->adminRegister($data['email'], $data['username'], $data['password']);

// Ensure response is always JSON encoded
echo json_encode($response);
?>