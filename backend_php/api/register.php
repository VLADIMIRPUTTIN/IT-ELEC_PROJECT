<?php
// Set proper CORS headers
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include necessary files
require_once 'modules/global.php';
require_once 'modules/api.php';

// Get the request body
$data = json_decode(file_get_contents("php://input"), true);

// Check if all required data is present
if (!isset($data['email']) || !isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['error' => 'All fields are required.']);
    exit;
}

// Create database connection and API instance
$conn = new mysqli('localhost', 'root', '', 'recipe_db');
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$api = new Api($conn);

// Call the register method and return the response
echo $api->register($data['email'], $data['username'], $data['password']);
?>