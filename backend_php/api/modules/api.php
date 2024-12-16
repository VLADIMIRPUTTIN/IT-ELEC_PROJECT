<?php
// Add the following at the top of your PHP files, before any output is sent:
header("Access-Control-Allow-Origin: *"); // Allows all origins. You can restrict this to your frontend domain for added security.
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Allow HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow these headers

// Handle OPTIONS request (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200); // Respond with 200 OK for OPTIONS requests
    exit;
}

require_once 'global.php'; // Including your global database connection

class Api extends GlobalMethods {
    private $mysqli;

    function validateAuthToken() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : null;
        
        if (!$authHeader) {
            http_response_code(401);
            echo json_encode(['error' => 'No authentication token provided']);
            exit();
        }
    
        // Remove 'Bearer ' prefix if present
        $token = str_replace('Bearer ', '', $authHeader);
    
        // Check if token exists in database
        $query = "SELECT id FROM users WHERE auth_token = ?";
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows === 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit();
        }
    
        $user = $result->fetch_assoc();
        return $user['id'];
    }

    public function __construct($mysqli) {
        $this->mysqli = $mysqli; // Ensure $mysqli is passed to the class constructor
    }

    // User registration
    public function register($email, $username, $password) {
        // Validate input
        if (empty($email) || empty($username) || empty($password)) {
            return json_encode(['error' => 'All fields are required.']);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return json_encode(['error' => 'Invalid email format.']);
        }

        // Hash password before storing
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Check if email or username already exists
        $query = "SELECT * FROM users WHERE email = ? OR username = ?";
        $stmt = $this->mysqli->prepare($query);
        
        // Bind the parameters
        $stmt->bind_param("ss", $email, $username);
        $stmt->execute();
        
        // Fetch the result
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user) {
            return json_encode(['error' => 'Email or username already exists.']);
        }

        // Insert new user into the database
        $query = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
        $stmt = $this->mysqli->prepare($query);

        // Bind the parameters again
        $stmt->bind_param("sss", $email, $username, $hashedPassword);
        $stmt->execute();
        
        // Check if the user was successfully created
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            return json_encode(['success' => 'Registration successful.']);
        } else {
            http_response_code(500);
            return json_encode(['error' => 'An error occurred during registration. Please try again later.']);
        }
    }

    // User login
    public function login($email, $password) {
        // Validate input
        if (empty($email) || empty($password)) {
            return json_encode(['error' => 'Email and password are required.']);
        }

        // Check if user exists with the given email
        $query = "SELECT * FROM users WHERE email = ?";
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user) {
            return json_encode(['error' => 'User not found.']);
        }

        // Verify password
        if (!password_verify($password, $user['password'])) {
            return json_encode(['error' => 'Incorrect password.']);
        }

        // Generate authentication token (using user ID)
        $token = bin2hex(random_bytes(16)); // Simple token generation
        $query = "UPDATE users SET auth_token = ? WHERE id = ?";
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("si", $token, $user['id']);
        $stmt->execute();

        // Check if the token was successfully updated
        if ($stmt->affected_rows > 0) {
            return json_encode([
                'success' => 'Login successful.', 
                'token' => $token,
                'user_id' => $user['id']  // Add user ID to the response
            ]);
        } else {
            return json_encode(['error' => 'Failed to generate authentication token.']);
        }
    }
    
    public function createRecipe() {
        // Validate required fields
        if (empty($_POST['name']) || empty($_POST['category']) || empty($_POST['description'])) {
            return json_encode(['error' => 'Name, category, and description are required.']);
        }

        // Validate ingredients and steps
        $recipeIngredients = json_decode($_POST['recipe_ingredients'], true);
        $preparationSteps = json_decode($_POST['preparation_steps'], true);

        if (empty($recipeIngredients) || empty($preparationSteps)) {
            return json_encode(['error' => 'Ingredients and preparation steps are required.']);
        }

        try {
            // Start transaction
            $this->mysqli->begin_transaction();

            // Handle image upload (optional)
            $imagePath = null;
            if (isset($_FILES['image'])) {
                $imagePath = $this->uploadRecipeImage($_FILES['image']);
            }

            // Prepare and execute recipe insertion
            $query = "INSERT INTO recipes (
                user_id, 
                name, 
                category, 
                description, 
                ingredients_list, 
                preparation_steps, 
                image
            ) VALUES (?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->mysqli->prepare($query);

            // Assuming user_id is available from session or authentication
            $userId = $_SESSION['user_id'] ?? 1; // Replace with actual user ID retrieval

            $ingredientsJson = json_encode($recipeIngredients);
            $stepsJson = json_encode($preparationSteps);

            $stmt->bind_param(
                "issssss", 
                $userId, 
                $_POST['name'], 
                $_POST['category'], 
                $_POST['description'], 
                $ingredientsJson, 
                $stepsJson, 
                $imagePath
            );

            $stmt->execute();
            $recipeId = $stmt->insert_id;

            // Add new ingredients if necessary
            foreach ($recipeIngredients as $ingredient) {
                if ($ingredient['is_new_ingredient']) {
                    $this->addNewIngredient($ingredient['ingredient_name']);
                }
            }

            // Commit transaction
            $this->mysqli->commit();

            return json_encode([
                'success' => 'Recipe created successfully', 
                'recipe_id' => $recipeId
            ]);

        } catch (Exception $e) {
            // Rollback transaction on error
            $this->mysqli->rollback();
            return json_encode(['error' => 'Failed to create recipe: ' . $e->getMessage()]);
        }
    }

    public function createUserRecipe($userId, $recipeData) {
        // Input validation
        if (empty($userId) || !is_numeric($userId)) {
            return json_encode(['error' => 'Invalid user ID.']);
        }
    
        if (empty($recipeData['name']) || empty($recipeData['category']) || empty($recipeData['description'])) {
            return json_encode(['error' => 'Name, category and description are required.']);
        }
        
        if (empty($recipeData['recipe_ingredients']) || empty($recipeData['preparation_steps'])) {
            return json_encode(['error' => 'Ingredients and preparation steps are required.']);
        }
        
        try {
            $this->mysqli->begin_transaction();
    
            // Use a table name that matches your database schema (e.g., user_recipes)
            $query = "INSERT INTO user_recipes (user_id, name, category, description, ingredients_list, preparation_steps, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $this->mysqli->prepare($query);
            
            // Encode ingredients and steps as JSON
            $ingredientsJson = json_encode($recipeData['recipe_ingredients']);
            $stepsJson = json_encode($recipeData['preparation_steps']);
            
            $stmt->bind_param("isssss", 
                $userId,
                $recipeData['name'],
                $recipeData['category'],
                $recipeData['description'],
                $ingredientsJson,
                $stepsJson
            );
            $stmt->execute();
            $recipeId = $stmt->insert_id;
    
            // Add new ingredients if needed
            foreach ($recipeData['recipe_ingredients'] as $ingredient) {
                if ($ingredient['is_new_ingredient']) {
                    $this->addNewIngredient($ingredient['ingredient_name']);
                }
            }
    
            $this->mysqli->commit();
            
            // Return a consistent response structure
            return json_encode([
                'success' => true, 
                'message' => 'Recipe created successfully', 
                'recipe_id' => $recipeId
            ]);
    
        } catch (Exception $e) {
            $this->mysqli->rollback();
            return json_encode([
                'success' => false, 
                'error' => 'Failed to create recipe: ' . $e->getMessage()
            ]);
        }
    }


    private function uploadRecipeImage($imageFile) {
        // Validate file type and size
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB
    
        // Validate file type
        if (!in_array($imageFile['type'], $allowedTypes)) {
            throw new Exception("Invalid image type. Allowed types: JPEG, PNG, GIF, WebP");
        }
    
        // Validate file size
        if ($imageFile['size'] > $maxFileSize) {
            throw new Exception("Image too large. Max size is 5MB");
        }
    
        // Create upload directory if it doesn't exist
        $uploadDir = 'C:/xampp/htdocs/FoodHub/src/assets/img/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
    
        // Generate a unique filename to prevent overwriting
        $fileExtension = pathinfo($imageFile['name'], PATHINFO_EXTENSION);
        $uniqueFilename = uniqid() . '.' . $fileExtension;
        $uploadPath = $uploadDir . $uniqueFilename;
    
        // Move uploaded file
        if (move_uploaded_file($imageFile['tmp_name'], $uploadPath)) {
            // Return just the filename to be stored in the database
            return $uniqueFilename;
        } else {
            throw new Exception("Failed to upload image");
        }
    }
    
    public function getUserRecipes($userId) {
        try {
            $query = "SELECT * FROM user_recipes WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $recipes = [];
            while ($row = $result->fetch_assoc()) {
                $row['ingredients_list'] = json_decode($row['ingredients_list'], true);
                $row['preparation_steps'] = json_decode($row['preparation_steps'], true);
                $recipes[] = $row;
            }
            
            return json_encode(['success' => true, 'recipes' => $recipes]);
        } catch (Exception $e) {
            return json_encode(['error' => 'Failed to fetch user recipes: ' . $e->getMessage()]);
        }
    }
    
    public function getUserRecipe($userId, $recipeId) {
        try {
            $query = "SELECT * FROM user_recipes WHERE id = ? AND user_id = ?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("ii", $recipeId, $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($recipe = $result->fetch_assoc()) {
                $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
                $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
                
                return json_encode([
                    'success' => true, 
                    'recipe' => $recipe
                ]);
            }
            
            return json_encode([
                'success' => false,
                'error' => 'Recipe not found'
            ]);
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Failed to get recipe: ' . $e->getMessage()
            ]);
        }
    }

    public function getRecipeById($recipeId, $isUserRecipe = false, $userId = null) {
        try {
            // Validate the input
            if ($isUserRecipe && !$userId) {
                throw new Exception("User ID is required for user recipes.");
            }
    
            // Determine the table based on the recipe type
            $table = $isUserRecipe ? 'user_recipes' : 'recipes';
            
            // Prepare the query
            $query = "SELECT * FROM $table WHERE id = ?";
            if ($isUserRecipe) {
                $query .= " AND user_id = ?"; // Add user_id filter for user recipes
            }
    
            $stmt = $this->mysqli->prepare($query);
    
            // Bind parameters
            if ($isUserRecipe) {
                $stmt->bind_param("ii", $recipeId, $userId);
            } else {
                $stmt->bind_param("i", $recipeId);
            }
    
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($recipe = $result->fetch_assoc()) {
                // Parse JSON fields
                if (isset($recipe['ingredients_list'])) {
                    $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
                }
                if (isset($recipe['preparation_steps'])) {
                    $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
                }
    
                return json_encode([
                    'success' => true,
                    'recipe' => $recipe
                ]);
            }
    
            return json_encode([
                'success' => false,
                'error' => 'Recipe not found'
            ]);
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch recipe: ' . $e->getMessage()
            ]);
        }
    }
       
    public function getAvailableIngredients() {
        try {
            $query = "SELECT id, name FROM ingredients ORDER BY name";
            $stmt = $this->mysqli->prepare($query);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $ingredients = [];
            while ($row = $result->fetch_assoc()) {
                $ingredients[] = [
                    'id' => $row['id'],
                    'name' => $row['name']
                ];
            }
            
            return json_encode(['success' => true, 'ingredients' => $ingredients]);
        } catch (Exception $e) {
            return json_encode(['error' => 'Failed to load ingredients: ' . $e->getMessage()]);
        }
    }

    public function getIngredients() {
        try {
            $query = "SELECT id, name, created_at, updated_at FROM ingredients ORDER BY name ASC";
            $stmt = $this->mysqli->prepare($query);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $ingredients = [];
            while ($row = $result->fetch_assoc()) {
                $ingredients[] = $row;
            }
            
            return json_encode([
                'status' => 'success',
                'data' => $ingredients
            ]);
        } catch (Exception $e) {
            return json_encode([
                'status' => 'error',
                'message' => 'Failed to fetch ingredients: ' . $e->getMessage()
            ]);
        }
    }

    private function addNewIngredient($ingredientName) {
        try {
            // Check if ingredient already exists
            $checkQuery = "SELECT id FROM ingredients WHERE name = ?";
            $checkStmt = $this->mysqli->prepare($checkQuery);
            $checkStmt->bind_param("s", $ingredientName);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
    
            // If ingredient doesn't exist, insert it
            if ($checkResult->num_rows === 0) {
                $insertQuery = "INSERT INTO ingredients (name) VALUES (?)";
                $insertStmt = $this->mysqli->prepare($insertQuery);
                $insertStmt->bind_param("s", $ingredientName);
                $insertStmt->execute();
            }
        } catch (Exception $e) {
            // Log error or handle as needed
            error_log('Error adding new ingredient: ' . $e->getMessage());
        }
    }

    public function updateRecipe($recipeId, $recipeData, $isUserRecipe) {
        if (empty($recipeId) || !is_numeric($recipeId)) {
            header('Content-Type: application/json');
            return json_encode(['error' => 'Invalid recipe ID.']);
        }
    
        $table = $isUserRecipe ? 'user_recipes' : 'recipes';
    
        try {
            $this->mysqli->begin_transaction();
    
            $query = "UPDATE $table 
                      SET name = ?, category = ?, description = ?, 
                          ingredients_list = ?, preparation_steps = ?, 
                          updated_at = NOW() 
                      WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
    
            $ingredientsJson = json_encode($recipeData['ingredients_list']);
            $stepsJson = json_encode($recipeData['preparation_steps']);
    
            $stmt->bind_param("sssssi", 
                $recipeData['name'],
                $recipeData['category'],
                $recipeData['description'],
                $ingredientsJson,
                $stepsJson,
                $recipeId
            );
            $stmt->execute();
    
            $this->mysqli->commit();
    
            header('Content-Type: application/json');
            return json_encode(['success' => true, 'message' => 'Recipe updated successfully']);
        } catch (Exception $e) {
            $this->mysqli->rollback();
            header('Content-Type: application/json');
            return json_encode(['success' => false, 'error' => 'Failed to update recipe: ' . $e->getMessage()]);
        }
    }
      
    public function getRecipeView($recipeId, $userId = null, $isUserRecipe = false) {
        try {
            error_log("Attempting to fetch recipe with ID: $recipeId" . 
                      ($userId ? " for user ID: $userId" : "") . 
                      ($isUserRecipe ? " (User Recipe)" : ""));
            // Validate input
            if (!is_numeric($recipeId) || $recipeId <= 0) {
                error_log("Invalid recipe ID: $recipeId");
                return json_encode([
                    'success' => false,
                    'error' => 'Invalid Recipe ID'
                ]);
            }
            
            // If user_id is provided, first check user_recipes
            if ($isUserRecipe) {
                $query = "SELECT * FROM user_recipes WHERE id = ? AND user_id = ?";
                $stmt = $this->mysqli->prepare($query);
                if (!$stmt) {
                    error_log("Prepare failed for user_recipes: " . $this->mysqli->error);
                    return json_encode([
                        'success' => false,
                        'error' => 'Database preparation error'
                    ]);
                }
                
                $stmt->bind_param("ii", $recipeId, $userId);
                $executeResult = $stmt->execute();
                
                if (!$executeResult) {
                    error_log("Execute failed for user_recipes: " . $stmt->error);
                    return json_encode([
                        'success' => false,
                        'error' => 'Database execution error'
                    ]);
                }
                
                $result = $stmt->get_result();
                
                // If no recipe found in user_recipes, fall back to recipes table
                if ($result->num_rows === 0) {
                    error_log("No user recipe found, checking main recipes table");
                } else {
                    $recipe = $result->fetch_assoc();
                    
                    // Parse JSON fields
                    $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
                    $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
                    
                    return json_encode([
                        'success' => true, 
                        'recipe' => $recipe
                    ]);
                }
            }
    
            // If no user_id or no recipe found in user_recipes, check recipes table
            $query = "SELECT * FROM recipes WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                error_log("Prepare failed for recipes: " . $this->mysqli->error);
                return json_encode([
                    'success' => false,
                    'error' => 'Database preparation error'
                ]);
            }
            
            $stmt->bind_param("i", $recipeId);
            $executeResult = $stmt->execute();
            
            if (!$executeResult) {
                error_log("Execute failed for recipes: " . $stmt->error);
                return json_encode([
                    'success' => false,
                    'error' => 'Database execution error'
                ]);
            }
            
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                error_log("No recipe found with ID: $recipeId");
                return json_encode([
                    'success' => false,
                    'error' => 'Recipe not found'
                ]);
            }
            
            $recipe = $result->fetch_assoc();
            
            // Parse JSON fields
            $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
            $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
            
            // Add image processing
            if (!empty($recipe['image'])) {
                // Verify file exists
                $imagePath = $this->getImagePath($recipe['image']);
                if (file_exists($imagePath)) {
                    // Read image file and convert to base64
                    $imageData = file_get_contents($imagePath);
                    $base64Image = base64_encode($imageData);
                    $recipe['image_data'] = $base64Image;
                } else {
                    error_log("Image file not found: " . $imagePath);
                    $recipe['image_data'] = null;
                }
            } else {
                $recipe['image_data'] = null;
            }
            
            return json_encode([
                'success' => true, 
                'recipe' => $recipe
            ]);
        } catch (Exception $e) {
            error_log("Exception in getRecipe: " . $e->getMessage());
            return json_encode([
                'success' => false,
                'error' => 'Unexpected error: ' . $e->getMessage()
            ]);
        }
    }
    
    public function getRecipe($recipeId) {
        try {
            error_log("Attempting to fetch recipe with ID: $recipeId");
            
            // Validate input
            if (!is_numeric($recipeId) || $recipeId <= 0) {
                error_log("Invalid recipe ID: $recipeId");
                return json_encode([
                    'success' => false,
                    'error' => 'Invalid Recipe ID'
                ]);
            }
    
            $query = "SELECT * FROM recipes WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                error_log("Prepare failed: " . $this->mysqli->error);
                return json_encode([
                    'success' => false,
                    'error' => 'Database preparation error'
                ]);
            }
            
            $stmt->bind_param("i", $recipeId);
            $executeResult = $stmt->execute();
            
            if (!$executeResult) {
                error_log("Execute failed: " . $stmt->error);
                return json_encode([
                    'success' => false,
                    'error' => 'Database execution error'
                ]);
            }
            
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                error_log("No recipe found with ID: $recipeId");
                return json_encode([
                    'success' => false,
                    'error' => 'Recipe not found'
                ]);
            }
            
            $recipe = $result->fetch_assoc();
            
            // Parse JSON fields
            $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
            $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
            
            // Add image processing
            if (!empty($recipe['image'])) {
                // Verify file exists
                $imagePath = $this->getImagePath($recipe['image']);
                if (file_exists($imagePath)) {
                    // Read image file and convert to base64
                    $imageData = file_get_contents($imagePath);
                    $base64Image = base64_encode($imageData);
                    $recipe['image_data'] = $base64Image;
                } else {
                    error_log("Image file not found: " . $imagePath);
                    $recipe['image_data'] = null;
                }
            } else {
                $recipe['image_data'] = null;
            }
            
            return json_encode([
                'success' => true, 
                'recipe' => $recipe
            ]);
        } catch (Exception $e) {
            error_log("Exception in getRecipe: " . $e->getMessage());
            return json_encode([
                'success' => false,
                'error' => 'Unexpected error: ' . $e->getMessage()
            ]);
        }
    }
    
    // Helper method to get the full image path
    private function getImagePath($filename) {
        // Assuming images are stored in an 'uploads' directory
        // Adjust the path as needed for your specific file storage setup
        return 'C:\\xampp\\htdocs\\FoodHub\\src\\assets\\img\\' . $filename;
    }

    // public function getRecipe($recipeId) {
    //     try {
    //         // First try to find in regular recipes
    //         $query = "SELECT * FROM recipes WHERE id = ?";
    //         $stmt = $this->mysqli->prepare($query);
    //         $stmt->bind_param("i", $recipeId);
    //         $stmt->execute();
    //         $result = $stmt->get_result();
            
    //         if ($recipe = $result->fetch_assoc()) {
    //             // Recipe found in regular recipes
    //             $this->parseJsonFields($recipe);
    //             return json_encode([
    //                 'success' => true,
    //                 'recipe' => $recipe
    //             ]);
    //         }
            
    //         // If not found, try user_recipes
    //         $query = "SELECT * FROM user_recipes WHERE id = ?";
    //         $stmt = $this->mysqli->prepare($query);
    //         $stmt->bind_param("i", $recipeId);
    //         $stmt->execute();
    //         $result = $stmt->get_result();
            
    //         if ($recipe = $result->fetch_assoc()) {
    //             // Recipe found in user recipes
    //             $this->parseJsonFields($recipe);
    //             return json_encode([
    //                 'success' => true,
    //                 'recipe' => $recipe
    //             ]);
    //         }
            
    //         // Recipe not found in either table
    //         return json_encode([
    //             'success' => false,
    //             'error' => 'Recipe not found'
    //         ]);
    //     } catch (Exception $e) {
    //         return json_encode([
    //             'success' => false,
    //             'error' => 'Failed to fetch recipe: ' . $e->getMessage()
    //         ]);
    //     }
    // }
    
    // private function parseJsonFields(&$recipe) {
    //     if (isset($recipe['ingredients_list'])) {
    //         $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
    //     }
    //     if (isset($recipe['preparation_steps'])) {
    //         $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
    //     }
    // }

public function getAllRecipes() {
    try {
        $query = "SELECT * FROM recipes ORDER BY created_at DESC";
        $stmt = $this->mysqli->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $recipes = [];
        while ($row = $result->fetch_assoc()) {
            $row['ingredients_list'] = json_decode($row['ingredients_list'], true);
            $row['preparation_steps'] = json_decode($row['preparation_steps'], true);
            $recipes[] = $row;
        }
        
        return json_encode(['success' => true, 'recipes' => $recipes]);
    } catch (Exception $e) {
        return json_encode(['error' => 'Failed to fetch recipes: ' . $e->getMessage()]);
    }
}

public function getRecipesByIngredients($ingredients) {
    try {
        $query = "SELECT * FROM recipes WHERE ";
        $conditions = [];
        $params = [];
        $types = "";
        
        foreach ($ingredients as $ingredient) {
            $conditions[] = "JSON_SEARCH(LOWER(ingredients_list), 'one', LOWER(?)) IS NOT NULL";
            $params[] = $ingredient;
            $types .= "s";
        }
        
        $query .= implode(" AND ", $conditions);
        
        $stmt = $this->mysqli->prepare($query);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        $recipes = [];
        while ($row = $result->fetch_assoc()) {
            $row['ingredients_list'] = json_decode($row['ingredients_list'], true);
            $row['preparation_steps'] = json_decode($row['preparation_steps'], true);
            $recipes[] = $row;
        }
        
        return json_encode(['success' => true, 'recipes' => $recipes]);
    } catch (Exception $e) {
        return json_encode(['error' => 'Failed to fetch recipes by ingredients: ' . $e->getMessage()]);
    }
}

    public function deleteRecipe($recipeId) {
        try {
            $query = "DELETE FROM recipes WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $recipeId);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                return json_encode(['success' => 'Recipe deleted successfully']);
            }
            
            return json_encode(['error' => 'Recipe not found']);
        } catch (Exception $e) {
            return json_encode(['error' => 'Failed to delete recipe: ' . $e->getMessage()]);
        }
    }

    public function searchRecipes($searchTerm, $category = null) {
        try {
            $query = "SELECT id, name, category, description FROM recipes WHERE 
                     name LIKE ? OR description LIKE ?";
            $params = ["%$searchTerm%", "%$searchTerm%"];
            $types = "ss";
            
            if ($category) {
                $query .= " AND category = ?";
                $params[] = $category;
                $types .= "s";
            }
            
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $recipes = [];
            while ($row = $result->fetch_assoc()) {
                $recipes[] = $row;
            }
            
            return json_encode(['success' => true, 'recipes' => $recipes]);
        } catch (Exception $e) {
            return json_encode(['error' => 'Failed to search recipes: ' . $e->getMessage()]);
        }
    }

    public function getUserProfile($userId) {
        try {
            // Validate user ID
            if (empty($userId) || !is_numeric($userId)) {
                return json_encode(['error' => 'Invalid user ID']);
            }
            // Fetch user details
            $query = "SELECT id, username, email FROM users WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($user = $result->fetch_assoc()) {
                return json_encode([
                    'success' => true, 
                    'user' => $user
                ]);
            }
            
            return json_encode([
                'success' => false,
                'error' => 'User not found'
            ]);
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }
    
    // public function getUserRecipes($userId) {
    //     try {
    //         // Validate user ID
    //         if (empty($userId) || !is_numeric($userId)) {
    //             return json_encode(['error' => 'Invalid user ID']);
    //         }
            
    //         // Fetch user's recipes
    //         $query = "SELECT id, title, description, created_at FROM recipes WHERE user_id = ? ORDER BY created_at DESC";
    //         $stmt = $this->mysqli->prepare($query);
    //         $stmt->bind_param("i", $userId);
    //         $stmt->execute();
    //         $result = $stmt->get_result();
            
    //         $recipes = [];
    //         while ($recipe = $result->fetch_assoc()) {
    //             $recipes[] = $recipe;
    //         }
            
    //         return json_encode([
    //             'success' => true,
    //             'recipes' => $recipes
    //         ]);
    //     } catch (Exception $e) {
    //         return json_encode([
    //             'success' => false,
    //             'error' => 'Database error: ' . $e->getMessage()
    //         ]);
    //     }
    // }
    
    public function deleteUserRecipe($userId, $recipeId) {
        try {
            // Validate inputs
            if (empty($userId) || !is_numeric($userId) || 
                empty($recipeId) || !is_numeric($recipeId)) {
                return json_encode(['error' => 'Invalid user ID or recipe ID']);
            }
            
            // First, verify the recipe belongs to the user
            $checkQuery = "SELECT id FROM recipes WHERE id = ? AND user_id = ?";
            $checkStmt = $this->mysqli->prepare($checkQuery);
            $checkStmt->bind_param("ii", $recipeId, $userId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();
            
            if ($checkResult->num_rows === 0) {
                return json_encode([
                    'success' => false,
                    'error' => 'Recipe not found or not owned by user'
                ]);
            }
            
            // Delete the recipe
            $deleteQuery = "DELETE FROM recipes WHERE id = ? AND user_id = ?";
            $deleteStmt = $this->mysqli->prepare($deleteQuery);
            $deleteStmt->bind_param("ii", $recipeId, $userId);
            $deleteResult = $deleteStmt->execute();
            
            if ($deleteResult) {
                return json_encode([
                    'success' => true,
                    'message' => 'Recipe deleted successfully'
                ]);
            } else {
                return json_encode([
                    'success' => false,
                    'error' => 'Failed to delete recipe'
                ]);
            }
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }
    
    public function updateUserProfile($userId, $data) {
        try {
            // Validate user ID
            if (empty($userId) || !is_numeric($userId)) {
                return json_encode(['error' => 'Invalid user ID']);
            }
            
            // Prepare update fields and values
            $updateFields = [];
            $bindTypes = '';
            $bindValues = [];
            
            // Username update
            if (isset($data['username'])) {
                $updateFields[] = "username = ?";
                $bindTypes .= 's';
                $bindValues[] = $data['username'];
            }
            
            // Email update
            if (isset($data['email'])) {
                $updateFields[] = "email = ?";
                $bindTypes .= 's';
                $bindValues[] = $data['email'];
            }
            
            // Password update (requires current password verification)
            if (isset($data['new_password'])) {
                // First, verify current password
                $passwordQuery = "SELECT password FROM users WHERE id = ?";
                $passwordStmt = $this->mysqli->prepare($passwordQuery);
                $passwordStmt->bind_param("i", $userId);
                $passwordStmt->execute();
                $passwordResult = $passwordStmt->get_result();
                $user = $passwordResult->fetch_assoc();
                
                // Verify current password
                if (!password_verify($data['current_password'], $user['password'])) {
                    return json_encode([
                        'success' => false,
                        'error' => 'Current password is incorrect'
                    ]);
                }
                
                // Hash new password
                $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);
                $updateFields[] = "password = ?";
                $bindTypes .= 's';
                $bindValues[] = $hashedPassword;
            }
            
            // Profile image update
            if (isset($_FILES['profile_image'])) {
                $uploadDir = 'uploads/profile_images/';
                $filename = uniqid() . '_' . basename($_FILES['profile_image']['name']);
                $uploadPath = $uploadDir . $filename;
                
                // Ensure upload directory exists
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Move uploaded file
                if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $uploadPath)) {
                    $updateFields[] = "profile_image = ?";
                    $bindTypes .= 's';
                    $bindValues[] = $uploadPath;
                } else {
                    return json_encode([
                        'success' => false,
                        'error' => 'Failed to upload profile image'
                    ]);
                }
            }
            
            // If no updates, return success
            if (empty($updateFields)) {
                return json_encode([
                    'success' => true,
                    'message' => 'No updates needed'
                ]);
            }
            
            // Prepare and execute update query
            $updateQuery = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $bindTypes .= 'i';
            $bindValues[] = $userId;
            
            $updateStmt = $this->mysqli->prepare($updateQuery);
            
            // Dynamically bind parameters
            $refs = [];
            foreach ($bindValues as $key => $value) {
                $refs[$key] = &$bindValues[$key];
            }
            call_user_func_array([$updateStmt, 'bind_param'], array_merge([$bindTypes], $refs));
            
            $updateResult = $updateStmt->execute();
            
            if ($updateResult) {
                return json_encode([
                    'success' => true,
                    'message' => 'Profile updated successfully'
                ]);
            } else {
                return json_encode([
                    'success' => false,
                    'error' => 'Failed to update profile'
                ]);
            }
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }
    
}
?>
