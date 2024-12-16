<?php 
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once './modules/api.php';
require_once './modules/global.php';
require_once './config/db_connection.php';

$api = new Api($mysqli);

$request = isset($_REQUEST['request']) ? explode('/', $_REQUEST['request']) : null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetRequest($request, $mysqli);
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        handlePostRequest($request, $mysqli, $data);
        break;
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        handlePutRequest($request, $mysqli, $data);
        break;
    case 'DELETE':
        handleDeleteRequest($request, $mysqli);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Method not available']);
        break;
}

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

        case 'search':
            $searchTerm = isset($_GET['term']) ? $_GET['term'] : '';
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            echo $api->searchRecipes($searchTerm, $category);
            break;
            
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

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
}

function handlePostRequest($request, $mysqli, $data) {
    global $api;

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
            } catch (Exception $e) {
                error_log('Authentication error: ' . $e->getMessage());
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
            break;
        case 'recipe':
            if (isset($request[1])) {
                echo $api->deleteRecipe($request[1]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Recipe ID required']);
            }
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Resource not found']);
            break;
    }
}

function sendResponse($response) {
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
?>