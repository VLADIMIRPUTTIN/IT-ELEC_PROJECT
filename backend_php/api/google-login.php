<?php

// Set CORS headers for all requests
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type
header("Content-Type: application/json; charset=UTF-8");

// Database connection
$conn = new mysqli("localhost", "root", "", "recipe_db");

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Debug information
error_log("Google login request received: " . print_r($data, true));

if (!isset($data->idToken)) {
    echo json_encode(["error" => "ID token is required"]);
    exit;
}

// Manual verification by sending request to Google
$token = $data->idToken;
$client_id = '209979773198-25s0s393sceitste72jnh3583dldq8fr.apps.googleusercontent.com';

// Create a context for the request
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Accept: application/json',
        'ignore_errors' => true
    ]
]);

// Make the request to Google's token info endpoint
$response = file_get_contents("https://oauth2.googleapis.com/tokeninfo?id_token=$token", false, $context);

if ($response === false) {
    echo json_encode(["error" => "Failed to verify token with Google"]);
    exit;
}

$payload = json_decode($response, true);
error_log("Google payload: " . print_r($payload, true));

// Verify the audience (client ID)
if (!isset($payload['aud']) || $payload['aud'] != $client_id) {
    echo json_encode(["error" => "Invalid token audience"]);
    exit;
}

// Get user details
$email = $payload['email'];
$name = isset($payload['name']) ? $payload['name'] : $payload['email'];
$google_id = $payload['sub'];
$picture = isset($payload['picture']) ? $payload['picture'] : null;

error_log("Google picture URL: " . $picture);

// Process profile image
$profileImage = null;
if ($picture) {
    // Create uploads directory if it doesn't exist
    $uploadDir = '../uploads/profiles/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
        error_log("Created directory: " . $uploadDir);
    }
    
    // Generate filename
    $filename = 'google_' . $google_id . '_' . time() . '.jpg';
    $uploadPath = $uploadDir . $filename;
    
    // Download image
    $imageContent = file_get_contents($picture);
    if ($imageContent !== false) {
        if (file_put_contents($uploadPath, $imageContent)) {
            $profileImage = 'uploads/profiles/' . $filename;
            error_log("Image saved successfully to: " . $uploadPath);
        } else {
            error_log("Failed to save image to: " . $uploadPath);
        }
    } else {
        error_log("Failed to download image from: " . $picture);
    }
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, username, email, profile_image FROM users WHERE email = ? OR google_id = ?");
$stmt->bind_param("ss", $email, $google_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists
    $user = $result->fetch_assoc();
    $user_id = $user['id'];
    
    // Update google_id and possibly profile image
    $updateQuery = "UPDATE users SET google_id = ?";
    $updateParams = [$google_id];
    $updateTypes = "s";
    
    // Update profile image if downloaded
    if ($profileImage) {
        $updateQuery .= ", profile_image = ?";
        $updateParams[] = $profileImage;
        $updateTypes .= "s";
    }
    
    $updateQuery .= " WHERE id = ?";
    $updateParams[] = $user_id;
    $updateTypes .= "i";
    
    $update = $conn->prepare($updateQuery);
    $update->bind_param($updateTypes, ...$updateParams);
    $update->execute();
    
    error_log("Updated existing user: " . $user_id);
    
    // Use existing profile image if not updated
    if (!$profileImage) {
        $profileImage = $user['profile_image'];
    }
} else {
    // Create new user
    $password = password_hash(bin2hex(random_bytes(10)), PASSWORD_DEFAULT);
    
    // Set default profile if Google image not available
    if (!$profileImage) {
        $profileImage = 'assets/pfp-default/profile-icon.jpg';
    }
    
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, google_id, profile_image) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $name, $email, $password, $google_id, $profileImage);
    $stmt->execute();
    $user_id = $conn->insert_id;
    error_log("Created new user: " . $user_id);
}

// Generate auth token
$auth_token = bin2hex(random_bytes(32));

// Store token
$stmt = $conn->prepare("UPDATE users SET auth_token = ? WHERE id = ?");
$stmt->bind_param("si", $auth_token, $user_id);
$stmt->execute();

// Return response
error_log("Final profile image path: " . $profileImage);
echo json_encode([
    "success" => "Google login successful",
    "data" => [
        "id" => $user_id,
        "username" => $name,
        "email" => $email,
        "auth_token" => $auth_token,
        "profile_image" => $profileImage
    ]
]);
exit;
?>