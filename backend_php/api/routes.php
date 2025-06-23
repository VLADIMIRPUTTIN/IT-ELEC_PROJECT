<?php 
<<<<<<< HEAD
// Turn on output buffering at the very beginning
ob_start();

// Use consistent CORS headers across all endpoints
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

<<<<<<< HEAD
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
=======
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    http_response_code(200);
    exit();
}

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

<<<<<<< HEAD
// Get the raw input data for POST requests
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, true);

// Single clean handler for the admin-register endpoint
if (isset($data['request']) && $data['request'] === 'admin-register') {
    // Clean any existing output
    ob_clean();
    
    // Execute admin registration
    $response = $api->adminRegister($data['email'], $data['username'], $data['password']);
    
    // Send clean JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Regular route processing
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
$request = isset($_REQUEST['request']) ? explode('/', $_REQUEST['request']) : null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRequest($request, $mysqli);
        break;
    case 'POST':
<<<<<<< HEAD
        handlePostRequest($request, $mysqli, $data);
        break;
    case 'PUT':
=======
        $data = json_decode(file_get_contents("php://input"), true);
        handlePostRequest($request, $mysqli, $data);
        break;
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        handlePutRequest($request, $mysqli, $data);
        break;
    case 'DELETE':
        handleDeleteRequest($request, $mysqli);
        break;
    default:
<<<<<<< HEAD
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// Rest of your code...

=======
        http_response_code(404);
        echo json_encode(['error' => 'Method not available']);
        break;
}

>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
function handleGetRequest($request, $mysqli) {
    global $api;
    
    if (!$request || empty($request[0])) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }

    switch ($request[0]) {
        case 'users':
            break;
<<<<<<< HEAD
        case 'recipe':
            if (isset($request[1])) {
                $recipeId = (int)$request[1];
                echo $api->getRecipe($recipeId);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Recipe ID required']);
            }
            break;

        case 'get-recipe':
            $recipeId = isset($_GET['id']) ? (int)$_GET['id'] : null;
            $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
            $isUserRecipe = isset($_GET['isUserRecipe']) ? filter_var($_GET['isUserRecipe'], FILTER_VALIDATE_BOOLEAN) : false;
        
            if ($recipeId) {
                echo $api->getRecipeView($recipeId, $userId, $isUserRecipe);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Recipe ID is required']);
            }
            break;
                    
        case 'ingredients':
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                echo $api->getAvailableIngredients();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;    
=======
            case 'recipe':
                if (isset($request[1])) {
                    $recipeId = (int)$request[1];
                    echo $api->getRecipe($recipeId);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Recipe ID required']);
                }
                break;

                case 'get-recipe':
                    $recipeId = isset($_GET['id']) ? (int)$_GET['id'] : null;
                    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;
                    $isUserRecipe = isset($_GET['isUserRecipe']) ? filter_var($_GET['isUserRecipe'], FILTER_VALIDATE_BOOLEAN) : false;
                
                    if ($recipeId) {
                        echo $api->getRecipeView($recipeId, $userId, $isUserRecipe);
                    } else {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Recipe ID is required']);
                    }
                    break;
                    
        case 'ingredients':
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    echo $api->getAvailableIngredients();
                } else {
                    http_response_code(405);
                    echo json_encode(['error' => 'Method not allowed']);
                }
                break;    
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
                
        case 'get-recipe-by-id':
            $recipeId = isset($_GET['id']) ? (int)$_GET['id'] : null; // Convert to integer
            $isUserRecipe = isset($_GET['isUserRecipe']) ? filter_var($_GET['isUserRecipe'], FILTER_VALIDATE_BOOLEAN) : false; // Convert to boolean
            $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null; // Convert to integer or null if not provided

            if ($recipeId) {
                echo $api->getRecipeById($recipeId, $isUserRecipe, $userId);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Recipe ID is required']);
            }
            break;

            
        case 'get-ingredients':
<<<<<<< HEAD
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                echo $api->getIngredients();
            } else {
                http_response_code(405);
                echo json_encode(['error' => 'Method not allowed']);
            }
            break;  
        case 'recipes':
            if (isset($_GET['ingredients'])) {
                $ingredients = json_decode($_GET['ingredients'], true);
                echo $api->getRecipesByIngredients($ingredients);
            } else {
                echo $api->getAllRecipes();
            }
            break;       
=======
                if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                    echo $api->getIngredients();
                } else {
                    http_response_code(405);
                    echo json_encode(['error' => 'Method not allowed']);
                }
                break;  
         case 'recipes':
                    if (isset($_GET['ingredients'])) {
                        $ingredients = json_decode($_GET['ingredients'], true);
                        echo $api->getRecipesByIngredients($ingredients);
                    } else {
                        echo $api->getAllRecipes();
                    }
                    break;       
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

        case 'search':
            $searchTerm = isset($_GET['term']) ? $_GET['term'] : '';
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            echo $api->searchRecipes($searchTerm, $category);
            break;
            
<<<<<<< HEAD
        case 'user-recipes':
            try {
                $userId = $api->validateAuthToken();
                echo $api->getUserRecipes($userId);
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
            }
            break;
    
        case 'user-recipe':
            try {
                $userId = $api->validateAuthToken();
                
                // Check if a specific recipe ID is provided
                $recipeId = isset($request[1]) ? $request[1] : null;
                
                if ($recipeId) {
                    echo $api->getUserRecipe($userId, $recipeId);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Recipe ID required']);
                }
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
            }
            break; 
        case 'user-profile':
            try {
                $userId = $api->validateAuthToken();
                echo $api->getUserProfile($userId);
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
            }
            break;

        case 'user-favorites':
            // Get the user ID from the authentication token
            $user = validateAuthToken();
            if ($user) {
                echo $api->getUserFavorites($user['id']);
            }
            break;

        case 'get-user-favorites':
            // Get the user ID from the authentication token
            $user = validateAuthToken();
            if ($user) {
                echo $api->getUserFavorites($user['id']);
            }
            break;

        case 'recipe-rating':
            $recipeId = isset($_GET['id']) ? (int)$_GET['id'] : null;
            echo $api->getRecipeRating($recipeId);
            break;
=======
            case 'user-recipes':
                try {
                    $userId = $api->validateAuthToken();
                    echo $api->getUserRecipes($userId);
                } catch (Exception $e) {
                    http_response_code(401);
                    echo json_encode(['error' => 'Unauthorized']);
                }
                break;
    
            case 'user-recipe':
                try {
                    $userId = $api->validateAuthToken();
                    
                    // Check if a specific recipe ID is provided
                    $recipeId = isset($request[1]) ? $request[1] : null;
                    
                    if ($recipeId) {
                        echo $api->getUserRecipe($userId, $recipeId);
                    } else {
                        http_response_code(400);
                        echo json_encode(['error' => 'Recipe ID required']);
                    }
                } catch (Exception $e) {
                    http_response_code(401);
                    echo json_encode(['error' => 'Unauthorized']);
                }
                break; 
            case 'user-profile':
                try {
                    $userId = $api->validateAuthToken();
                    echo $api->getUserProfile($userId);
                } catch (Exception $e) {
                    http_response_code(401);
                    echo json_encode(['error' => 'Unauthorized']);
                }
                break;
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
}

<<<<<<< HEAD
// In your handlePostRequest function, check for the 'request' parameter in the body
function handlePostRequest($request, $mysqli, $data) {
    global $api;

    // Check if we're getting the request from the body instead of URL
    if (isset($data['request'])) {
        $requestType = $data['request'];
        
        switch ($requestType) {
            case 'admin-register':
                // Clean any existing output
                if (ob_get_length()) ob_clean();
                
                $response = $api->adminRegister($data['email'], $data['username'], $data['password']);
                header('Content-Type: application/json');
                echo json_encode($response);
                exit;
                
            // Other cases...
        }
        return;
    }

    // Existing URL-based routing
=======
function handlePostRequest($request, $mysqli, $data) {
    global $api;

>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    if (!$request || empty($request[0])) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }

    switch ($request[0]) {
        case 'register':
            echo json_encode($api->register($data['email'], $data['username'], $data['password']));
            break;
        case 'login':
<<<<<<< HEAD
            if (!isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password are required']);
                break;
            }
            echo $api->login($data['email'], $data['password']);
            break;
        case 'google-login':
            if (!isset($data['idToken'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Google ID token is required']);
                break;
            }
            // Use the integrated method instead of including the file
            echo $api->googleLogin($data['idToken']);
            break;
            
        case 'recipe':
            // Ensure user has admin role
            $user = validateAuthToken();
            if ($user['is_admin'] !== 1) {
                http_response_code(403);
                echo json_encode(['error' => 'Admin privileges required']);
                return;
            }
            
            // Process recipe creation
            $response = $api->createRecipe();
            echo json_encode($response);
            break;
       case 'user-recipe':
            error_log('Received user-recipe request');
            error_log('POST data: ' . print_r($_POST, true));
            error_log('FILES data: ' . print_r($_FILES, true));

            try {
                $userId = $api->validateAuthToken();
                echo $api->createUserRecipe($userId, $_POST);
=======
            echo json_encode($api->login($data['email'], $data['password']));
            break;
        case 'recipe':
            echo $api->createRecipe($data);
            break;
        case 'user-recipe':
            error_log('Received user-recipe request');
            error_log('Request data: ' . print_r($data, true));
            error_log('Request method: ' . $_SERVER['REQUEST_METHOD']);
    
            try {
                $userId = $api->validateAuthToken();
                echo $api->createUserRecipe($userId, $data);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
            } catch (Exception $e) {
                error_log('Authentication error: ' . $e->getMessage());
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
            }
            break;
<<<<<<< HEAD

        case 'add-favorite':
            // Get the user ID from the authentication token
            $user = validateAuthToken();
            if ($user) {
                $recipeId = isset($data['recipeId']) ? (int)$data['recipeId'] : null;
                $isUserRecipe = isset($data['isUserRecipe']) ? filter_var($data['isUserRecipe'], FILTER_VALIDATE_BOOLEAN) : false;
                
                echo $api->addToFavorites($user['id'], $recipeId, $isUserRecipe);
            }
            break;

        case 'share-recipe':
            try {
                $userId = $api->validateAuthToken();
                $recipeId = $data['recipeId'] ?? null;
                $isUserRecipe = $data['isUserRecipe'] ?? false;
                echo $api->shareRecipe($userId, $recipeId, $isUserRecipe);
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
            }
            break;

        case 'admin-login':
            echo json_encode($api->adminLogin($data['email'], $data['password']));
            break;
            
        case 'admin-register':
            // Ensure all required fields are present
            if (!isset($data['email']) || !isset($data['username']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing required fields']);
                break;
            }
            
            // Create admin_users table if it doesn't exist
            $tableExists = $mysqli->query("SHOW TABLES LIKE 'admin_users'");
            if ($tableExists->num_rows == 0) {
                // Create admin_users table
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
            
            // Register admin using the API method
            echo json_encode($api->adminRegister($data['email'], $data['username'], $data['password']));
            break;
        
        case 'rate-recipe':
            $user = validateAuthToken();
            if ($user) {
                $recipeId = (int)$data['recipeId'];
                $rating = (int)$data['rating'];
                echo $api->rateRecipe($user['id'], $recipeId, $rating);
            }
            break;

=======
    
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
}

function handlePutRequest($request, $mysqli, $data) {
    global $api;
    
    if (!$request || empty($request[0])) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }

    switch ($request[0]) {
        case 'update-recipe':
            if (isset($request[1])) {
                $isUserRecipe = isset($_GET['isUserRecipe']) && $_GET['isUserRecipe'] === 'true';
                echo $api->updateRecipe($request[1], $data, $isUserRecipe);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Recipe ID required']);
            }
            break;
        
        case 'update-profile':
            try {
                $userId = $api->validateAuthToken();
                echo $api->updateUserProfile($userId, $data);
            } catch (Exception $e) {
                http_response_code(401);
                echo json_encode(['error' => 'Unauthorized']);
            }
            break;    
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
}

function handleDeleteRequest($request, $mysqli) {
    global $api;
    
    if (!$request || empty($request[0])) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid request']);
        return;
    }

    switch ($request[0]) {
        case 'delete-user-recipe':
<<<<<<< HEAD
            // Check if user_id and recipe_id are provided in the query parameters
            $userId = $_GET['user_id'] ?? null;
            $recipeId = $_GET['recipe_id'] ?? null;

            // Validate input
            if (!$userId || !$recipeId) {
                http_response_code(400);
                echo json_encode([
                    'success' => false, 
                    'error' => 'User ID and Recipe ID are required'
                ]);
                return;
            }
            // Call the delete user recipe method
            echo $api->deleteUserRecipe($userId, $recipeId);
            break;

=======
            break;
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        case 'recipe':
            if (isset($request[1])) {
                echo $api->deleteRecipe($request[1]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Recipe ID required']);
            }
            break;
<<<<<<< HEAD
                
        case 'remove-favorite':
            // Get the user ID from the authentication token
            $user = validateAuthToken();
            if ($user) {
                $recipeId = isset($_GET['recipeId']) ? (int)$_GET['recipeId'] : null;
                $isUserRecipe = isset($_GET['isUserRecipe']) ? filter_var($_GET['isUserRecipe'], FILTER_VALIDATE_BOOLEAN) : false;
                
                echo $api->removeFromFavorites($user['id'], $recipeId, $isUserRecipe);
            }
            break;
                
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
}

function sendResponse($response) {
<<<<<<< HEAD
    // Clean any previous output
    ob_clean();
    
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
<<<<<<< HEAD

function validateAuthToken() {
    global $mysqli;  // Access the global mysqli connection
    
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
    
    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(['error' => 'No authentication token provided']);
        exit();
    }

    // Remove 'Bearer ' prefix if present
    $token = str_replace('Bearer ', '', $authHeader);

    // First check regular users
    $query = "SELECT id, 0 AS is_admin FROM users WHERE auth_token = ?";
    $stmt = $mysqli->prepare($query);  // Use global $mysqli instead of $this->mysqli
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // If not found in users, check admin_users
        $query = "SELECT id, 1 AS is_admin FROM admin_users WHERE auth_token = ? AND token_expires > NOW()";
        $stmt = $mysqli->prepare($query);  // Use global $mysqli
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit();
        }
    }

    $user = $result->fetch_assoc();
    return $user;
}
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
?>