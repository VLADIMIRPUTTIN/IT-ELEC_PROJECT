<?php
// Add the following at the top of your PHP files, before any output is sent:
<<<<<<< HEAD
header("Access-Control-Allow-Origin: http://localhost:4200"); // Allows all origins. You can restrict this to your frontend domain for added security.
=======
header("Access-Control-Allow-Origin: *"); // Allows all origins. You can restrict this to your frontend domain for added security.
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
    
<<<<<<< HEAD
        // First check regular users
        $query = "SELECT id, 0 AS is_admin FROM users WHERE auth_token = ?";
=======
        // Check if token exists in database
        $query = "SELECT id FROM users WHERE auth_token = ?";
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
    
        if ($result->num_rows === 0) {
<<<<<<< HEAD
            // If not found in users, check admin_users
            $query = "SELECT id, 1 AS is_admin FROM admin_users WHERE auth_token = ? AND token_expires > NOW()";
            $stmt = $this->mysqli->prepare($query);
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
        return $user; // Returns both the ID and whether the user is an admin
    }

    function requireAdmin() {
        $user = $this->validateAuthToken();
        
        if (!isset($user['is_admin']) || $user['is_admin'] != 1) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin privileges required']);
            exit();
        }
        
        return $user['id']; // Returns the admin ID
=======
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit();
        }
    
        $user = $result->fetch_assoc();
        return $user['id'];
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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

<<<<<<< HEAD
        // Set default profile image
        $defaultProfileImage = 'assets/pfp-default/profile-icon.jpg';

        // Insert new user into the database
        $query = "INSERT INTO users (email, username, password, profile_image) VALUES (?, ?, ?, ?)";
        $stmt = $this->mysqli->prepare($query);

        // Bind the parameters again
        $stmt->bind_param("ssss", $email, $username, $hashedPassword, $defaultProfileImage);
=======
        // Insert new user into the database
        $query = "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
        $stmt = $this->mysqli->prepare($query);

        // Bind the parameters again
        $stmt->bind_param("sss", $email, $username, $hashedPassword);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD
                'success' => true,
                'token' => $token,
                'user_id' => $user['id'],
                'profile_image' => $user['profile_image'] ?? null
=======
                'success' => 'Login successful.', 
                'token' => $token,
                'user_id' => $user['id']  // Add user ID to the response
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
            ]);
        } else {
            return json_encode(['error' => 'Failed to generate authentication token.']);
        }
    }
    
    public function createRecipe() {
<<<<<<< HEAD
        // Check authorization
        try {
            $user = $this->validateAuthToken();
            
            // Check if user is an admin
            if (!isset($user['is_admin']) || $user['is_admin'] != 1) {
                error_log("User is not admin");
                return json_encode(['success' => false, 'message' => 'Admin privileges required']);
            }
            
            error_log("Admin authorized, proceeding with recipe creation");
            
            // Get recipe data from form
            $recipeDataJson = isset($_POST['recipeData']) ? $_POST['recipeData'] : null;
            if (!$recipeDataJson) {
                error_log("No recipe data provided");
                return json_encode(['success' => false, 'message' => 'No recipe data provided']);
            }
            
            // Debug log the received data
            error_log("Received recipe data: " . $recipeDataJson);
            
            $recipeData = json_decode($recipeDataJson, true);
            if (!$recipeData) {
                error_log("Failed to decode recipe data JSON");
                return json_encode(['success' => false, 'message' => 'Invalid recipe data format']);
            }
            
            // Validate required fields
            $requiredFields = ['name', 'category', 'description', 'ingredients_list', 'preparation_steps'];
            foreach ($requiredFields as $field) {
                if (!isset($recipeData[$field])) {
                    error_log("Missing required field: " . $field);
                    return json_encode(['success' => false, 'message' => "Missing required field: $field"]);
                }
            }
            
            // Handle image upload
            $imagePath = null;
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                try {
                    $fileName = $this->uploadRecipeImage($_FILES['image']);
                    
                    // Store just the filename in the database
                    $imagePath = $fileName;
                    error_log("Image path for database: " . $imagePath);
                } catch (Exception $e) {
                    error_log("Image upload failed: " . $e->getMessage());
                    return json_encode(['success' => false, 'message' => 'Image upload failed: ' . $e->getMessage()]);
                }
            } else {
                error_log("No image provided or upload error: " . 
                          (isset($_FILES['image']) ? $_FILES['image']['error'] : 'No image in request'));
            }
            
            // Begin transaction
            $this->mysqli->begin_transaction();
            
            try {
                // Insert recipe into database
                $query = "INSERT INTO recipes (name, category, description, ingredients_list, preparation_steps, image, created_at, updated_at) 
                          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
                $stmt = $this->mysqli->prepare($query);
                
                if (!$stmt) {
                    throw new Exception("Database preparation error: " . $this->mysqli->error);
                }
                
                $ingredientsJson = json_encode($recipeData['ingredients_list']);
                $stepsJson = json_encode($recipeData['preparation_steps']);
                
                $stmt->bind_param("ssssss", 
                    $recipeData['name'],
                    $recipeData['category'],
                    $recipeData['description'],
                    $ingredientsJson,
                    $stepsJson,
                    $imagePath
                );
                
                $result = $stmt->execute();
                if (!$result) {
                    throw new Exception("Failed to insert recipe: " . $stmt->error);
                }
                
                $recipeId = $this->mysqli->insert_id;
                error_log("Recipe inserted with ID: " . $recipeId);
                
                // Commit transaction
                $this->mysqli->commit();
                
                return json_encode([
                    'success' => true, 
                    'message' => 'Recipe created successfully',
                    'recipe_id' => $recipeId
                ]);
                
            } catch (Exception $e) {
                // Rollback transaction on error
                $this->mysqli->rollback();
                error_log("Error in recipe creation transaction: " . $e->getMessage());
                return json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
        } catch (Exception $e) {
            error_log("Uncaught exception in createRecipe: " . $e->getMessage());
            return json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
=======
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
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        }
    }

    public function createUserRecipe($userId, $recipeData) {
<<<<<<< HEAD
        // Validate user ID
        if (empty($userId) || !is_numeric($userId)) {
            return json_encode(['success' => false, 'error' => 'Invalid user ID.']);
        }
    
        try {
            // Handle the form data
            $name = isset($_POST['name']) ? trim($_POST['name']) : null;
            $category = isset($_POST['category']) ? trim($_POST['category']) : null;
            $description = isset($_POST['description']) ? trim($_POST['description']) : null;
            
            // Parse JSON strings for ingredients and steps
            $ingredientsJson = isset($_POST['recipe_ingredients']) ? $_POST['recipe_ingredients'] : null;
            $stepsJson = isset($_POST['preparation_steps']) ? $_POST['preparation_steps'] : null;
            
            // IMPORTANT: Get the image filename directly from POST
            $imagePath = isset($_POST['image']) ? $_POST['image'] : null;
            
            // Enhanced debugging
            error_log("Image path in createUserRecipe: " . ($imagePath ?? 'NULL'));
            error_log("RecipeData dump: " . print_r($recipeData, true));
            
            $recipeIngredients = json_decode($ingredientsJson, true);
            $preparationSteps = json_decode($stepsJson, true);
    
            // Input validation
            if (empty($name) || empty($category) || empty($description)) {
                error_log('Missing required fields in recipe creation');
                return json_encode(['success' => false, 'error' => 'Name, category and description are required.']);
            }
    
            if (empty($recipeIngredients) || empty($preparationSteps)) {
                return json_encode(['success' => false, 'error' => 'Ingredients and preparation steps are required.']);
            }
    
            $this->mysqli->begin_transaction();
    
            // Insert recipe with image path from POST
            $query = "INSERT INTO user_recipes (user_id, name, category, description, ingredients_list, preparation_steps, image, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $this->mysqli->prepare($query);
            
            // Convert arrays to JSON strings for database storage
            $ingredientsJson = json_encode($recipeIngredients);
            $stepsJson = json_encode($preparationSteps);
            
            error_log("About to execute SQL with imagePath: " . ($imagePath ?? 'NULL'));
            
            // Debug values before binding
            error_log("Values to bind - userId: $userId, name: $name, category: $category, image: $imagePath");
            
            $stmt->bind_param("issssss", 
                $userId,
                $name,
                $category,
                $description,
                $ingredientsJson,
                $stepsJson,
                $imagePath
            );
    
            // Try to execute and check for errors
            if (!$stmt->execute()) {
                throw new Exception("SQL error: " . $stmt->error);
            }
            
            $recipeId = $stmt->insert_id;
            
            $this->mysqli->commit();
            
            return json_encode([
                'success' => true, 
                'message' => 'Recipe created successfully', 
                'recipe_id' => $recipeId,
                'image_path' => $imagePath // Return the image path for confirmation
=======
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
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
            ]);
    
        } catch (Exception $e) {
            $this->mysqli->rollback();
<<<<<<< HEAD
            error_log('Recipe creation error: ' . $e->getMessage());
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
            return json_encode([
                'success' => false, 
                'error' => 'Failed to create recipe: ' . $e->getMessage()
            ]);
        }
    }


    private function uploadRecipeImage($imageFile) {
<<<<<<< HEAD
        try {
            // Output debug information
            error_log("Uploading image: " . $imageFile['name']);
            
            // Check if image_domain is set in the request
            $imageDomain = isset($_POST['image_domain']) ? 
                $_POST['image_domain'] : 
                'https://userirecipeimage.foodhubrecipe.shop';
            
            error_log("Image domain: " . $imageDomain);
            
            // Set up local storage path - adjust this to your server's directory structure
            // This should be a directory that actually exists and is writable
            $targetDir = "C:/xampp/htdocs/FoodHub/uploads/recipe_images/";
            
            // Create directory if it doesn't exist
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0755, true);
            }
            
            // Generate a unique filename
            $fileName = uniqid() . '_' . basename($imageFile['name']);
            $targetFilePath = $targetDir . $fileName;
            
            // Check file type
            $imageFileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));
            $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            if (!in_array($imageFileType, $allowedTypes)) {
                throw new Exception("Sorry, only JPG, JPEG, PNG, GIF, and WebP files are allowed.");
            }
            
            // Check file size (5MB limit)
            if ($imageFile['size'] > 5 * 1024 * 1024) {
                throw new Exception("Sorry, your file is too large. Max file size is 5MB.");
            }
            
            // Upload the file
            if (!move_uploaded_file($imageFile['tmp_name'], $targetFilePath)) {
                error_log("Failed to move uploaded file: " . $imageFile['tmp_name'] . " to " . $targetFilePath);
                throw new Exception("Sorry, there was an error uploading your file.");
            }
            
            error_log("Image uploaded successfully to: " . $targetFilePath);
            
            // Return just the filename - we'll construct the full URL when needed
            return $fileName;
        } catch (Exception $e) {
            error_log("Image upload error: " . $e->getMessage());
            throw $e;
=======
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
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD

    // public function updateRecipe($recipeId, $recipeData, $isUserRecipe) {
    //     if (empty($recipeId) || !is_numeric($recipeId)) {
    //         return json_encode(['error' => 'Invalid recipe ID.']);
    //     }
    
    //     // Debug logging
    //     error_log('Received POST data: ' . print_r($_POST, true));
    //     error_log('Received FILES data: ' . print_r($_FILES, true));
    
    //     $table = $isUserRecipe ? 'user_recipes' : 'recipes';
    
    //     try {
    //         $this->mysqli->begin_transaction();
    
    //         // Handle image upload if present
    //         $imagePath = null;
    //         if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    //             try {
    //                 $imagePath = $this->uploadRecipeImage($_FILES['image']);
    //             } catch (Exception $e) {
    //                 error_log('Image upload error: ' . $e->getMessage());
    //                 // Continue without updating image if upload fails
    //             }
    //         }
    
    //         // Parse recipe data
    //         $recipeDataRaw = isset($_POST['recipeData']) ? $_POST['recipeData'] : null;
    //         if (!$recipeDataRaw) {
    //             error_log('No recipe data found');
    //             throw new Exception("No recipe data provided");
    //         }
    
    //         // Decode recipe data from JSON
    //         $recipeData = json_decode($recipeDataRaw, true);
    //         if (!$recipeData) {
    //             error_log('Failed to decode recipe data');
    //             throw new Exception("Invalid recipe data format");
    //         }
    
    //         // Prepare query with optional image update
    //         if ($imagePath !== null) {
    //             $query = "UPDATE $table 
    //                       SET name = ?, category = ?, description = ?, 
    //                           ingredients_list = ?, preparation_steps = ?, 
    //                           image = ?, updated_at = NOW() 
    //                       WHERE id = ?";
    //             $stmt = $this->mysqli->prepare($query);
    
    //             $ingredientsJson = json_encode($recipeData['ingredients_list']);
    //             $stepsJson = json_encode($recipeData['preparation_steps']);
    
    //             $stmt->bind_param("sssssssi", 
    //                 $recipeData['name'],
    //                 $recipeData['category'],
    //                 $recipeData['description'],
    //                 $ingredientsJson,
    //                 $stepsJson,
    //                 $imagePath,
    //                 $recipeId
    //             );
    //         } else {
    //             // Query without image update
    //             $query = "UPDATE $table 
    //                       SET name = ?, category = ?, description = ?, 
    //                           ingredients_list = ?, preparation_steps = ?, 
    //                           updated_at = NOW() 
    //                       WHERE id = ?";
    //             $stmt = $this->mysqli->prepare($query);
    
    //             $ingredientsJson = json_encode($recipeData['ingredients_list']);
    //             $stepsJson = json_encode($recipeData['preparation_steps']);
    
    //             $stmt->bind_param("sssssi", 
    //                 $recipeData['name'],
    //                 $recipeData['category'],
    //                 $recipeData['description'],
    //                 $ingredientsJson,
    //                 $stepsJson,
    //                 $recipeId
    //             );
    //         }
    
    //         $stmt->execute();
    
    //         $this->mysqli->commit();
    
    //         return json_encode(['success' => true, 'message' => 'Recipe updated successfully']);
    //     } catch (Exception $e) {
    //         $this->mysqli->rollback();
    //         error_log('Recipe update error: ' . $e->getMessage());
    //         return json_encode(['success' => false, 'error' => 'Failed to update recipe: ' . $e->getMessage()]);
    //     }
    // }
    
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
      
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
                
<<<<<<< HEAD
                if ($result->num_rows > 0) {
=======
                // If no recipe found in user_recipes, fall back to recipes table
                if ($result->num_rows === 0) {
                    error_log("No user recipe found, checking main recipes table");
                } else {
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
                    $recipe = $result->fetch_assoc();
                    
                    // Parse JSON fields
                    $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
                    $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
                    
<<<<<<< HEAD
                    // IMPORTANT: Add flag to identify this as a user recipe image
                    $recipe['is_user_recipe_image'] = true;
                    
                    // Log the image path for debugging
                    error_log("User recipe image path: " . ($recipe['image'] ?? 'NULL'));
                    
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
                    return json_encode([
                        'success' => true, 
                        'recipe' => $recipe
                    ]);
<<<<<<< HEAD
                } else {
                    error_log("No user recipe found with ID: $recipeId for user: $userId");
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
            
<<<<<<< HEAD
            // Explicitly set this as NOT a user recipe image
            $recipe['is_user_recipe_image'] = false;
            
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD
            // First try to find in regular recipes
            $query = "SELECT * FROM recipes WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $recipeId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($recipe = $result->fetch_assoc()) {
                // Recipe found in regular recipes
                $this->parseJsonFields($recipe);
                return json_encode([
                    'success' => true,
                    'recipe' => $recipe
                ]);
            }
            
            // If not found, try user_recipes
            $query = "SELECT * FROM user_recipes WHERE id = ?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $recipeId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($recipe = $result->fetch_assoc()) {
                // Recipe found in user recipes
                $this->parseJsonFields($recipe);
                return json_encode([
                    'success' => true,
                    'recipe' => $recipe
                ]);
            }
            
            // Recipe not found in either table
            return json_encode([
                'success' => false,
                'error' => 'Recipe not found'
            ]);
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Failed to fetch recipe: ' . $e->getMessage()
=======
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
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
            ]);
        }
    }
    
<<<<<<< HEAD
    // Helper to decode JSON fields
    private function parseJsonFields(&$recipe) {
        if (isset($recipe['ingredients_list'])) {
            $recipe['ingredients_list'] = json_decode($recipe['ingredients_list'], true);
        }
        if (isset($recipe['preparation_steps'])) {
            $recipe['preparation_steps'] = json_decode($recipe['preparation_steps'], true);
        }
    }

    // Helper to get the absolute image path from the image filename
    private function getImagePath($imageFilename) {
        // Adjust this path to match your actual image storage directory
        $uploadDir = 'C:/xampp/htdocs/FoodHub/src/assets/img/';
        return $uploadDir . $imageFilename;
    }

public function getAllRecipes() {
    try {
        $query = "SELECT id, name, category, description, image, estimated_price, ingredients_list, preparation_steps, created_at, updated_at FROM recipes ORDER BY created_at DESC";
=======
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
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD
    
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

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

<<<<<<< HEAD
    // Make sure this method is correctly implemented
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    public function getUserProfile($userId) {
        try {
            // Validate user ID
            if (empty($userId) || !is_numeric($userId)) {
<<<<<<< HEAD
                return json_encode(['success' => false, 'error' => 'Invalid user ID']);
=======
                return json_encode(['error' => 'Invalid user ID']);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD
            $checkQuery = "SELECT id FROM user_recipes WHERE id = ? AND user_id = ?";
=======
            $checkQuery = "SELECT id FROM recipes WHERE id = ? AND user_id = ?";
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD
            $deleteQuery = "DELETE FROM user_recipes WHERE id = ? AND user_id = ?";
=======
            $deleteQuery = "DELETE FROM recipes WHERE id = ? AND user_id = ?";
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD
                $uploadDir = '/public/uploads/profile_images/';
=======
                $uploadDir = 'uploads/profile_images/';
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD

    public function addToFavorites($userId, $recipeId, $isUserRecipe = false) {
        try {
            // Check if favorite already exists
            $checkQuery = "SELECT id FROM user_favorites 
                          WHERE user_id = ? AND recipe_id = ? AND is_user_recipe = ?";
            $checkStmt = $this->mysqli->prepare($checkQuery);
            $checkStmt->bind_param("iii", $userId, $recipeId, $isUserRecipe);
            $checkStmt->execute();
            $result = $checkStmt->get_result();
            
            if ($result->num_rows > 0) {
                return json_encode([
                    'success' => true,
                    'message' => 'Recipe is already a favorite'
                ]);
            }

            // Add to favorites
            $query = "INSERT INTO user_favorites (user_id, recipe_id, is_user_recipe) 
                     VALUES (?, ?, ?)";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("iii", $userId, $recipeId, $isUserRecipe);
            
            if ($stmt->execute()) {
                return json_encode([
                    'success' => true,
                    'message' => 'Recipe added to favorites'
                ]);
            }
            
            throw new Exception("Failed to add favorite");
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
    
    public function removeFromFavorites($userId, $recipeId, $isUserRecipe = false) {
        if (empty($userId) || empty($recipeId)) {
            return json_encode(['success' => false, 'error' => 'Invalid user or recipe ID.']);
        }
    
        try {
            $query = "DELETE FROM user_favorites 
                      WHERE user_id = ? AND recipe_id = ? AND is_user_recipe = ?";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("iii", $userId, $recipeId, $isUserRecipe);
            $stmt->execute();
    
            if ($stmt->affected_rows > 0) {
                return json_encode(['success' => true, 'message' => 'Recipe removed from favorites.']);
            } else {
                return json_encode(['success' => false, 'error' => 'Favorite not found.']);
            }
        } catch (Exception $e) {
            return json_encode(['success' => false, 'error' => 'Failed to remove from favorites: ' . $e->getMessage()]);
        }
    }
    
    public function shareRecipe($userId, $recipeId, $isUserRecipe = false) {
        try {
            $query = "INSERT INTO shared_recipes (user_id, recipe_id, is_user_recipe) 
                     VALUES (?, ?, ?)";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("iii", $userId, $recipeId, $isUserRecipe);
            
            if ($stmt->execute()) {
                return json_encode([
                    'success' => true,
                    'message' => 'Recipe shared successfully',
                    'share_id' => $this->mysqli->insert_id
                ]);
            }
            
            throw new Exception("Failed to share recipe");
            
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    // Method to get user's favorite recipes
    public function getUserFavorites($userId) {
        try {
            // Query to get favorites from both system and user recipes
            $query = "SELECT f.recipe_id, f.is_user_recipe, f.added_at
                      FROM user_favorites f
                      WHERE f.user_id = ?
                      ORDER BY f.added_at DESC";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
    
            $favorites = [];
            while ($row = $result->fetch_assoc()) {
                $favorites[] = $row;
            }
    
            return json_encode([
                'success' => true,
                'favorites' => $favorites
            ]);
        } catch (Exception $e) {
            return json_encode([
                'success' => false,
                'error' => 'Failed to retrieve favorites: ' . $e->getMessage()
            ]);
        }
    }
    
    // Admin login method - Update this part
    public function adminLogin($email, $password) {
        // Validate input
        if (empty($email) || empty($password)) {
            return json_encode(['success' => false, 'error' => 'Email and password are required.']);
        }

        // Debug output
        error_log("Admin login attempt with email: $email");

        // Check if admin exists with the given email
        $query = "SELECT * FROM admin_users WHERE email = ?";
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $admin = $result->fetch_assoc();

        if (!$admin) {
            return json_encode(['success' => false, 'error' => 'Admin not found.']);
        }

        // Verify the password using password_verify since we're storing hashed passwords
        if (!password_verify($password, $admin['password'])) {
            return json_encode(['success' => false, 'error' => 'Incorrect password.']);
        }

        // Generate authentication token
        $token = bin2hex(random_bytes(16));
        $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $updateQuery = "UPDATE admin_users SET auth_token = ?, token_expires = ? WHERE id = ?";
        $updateStmt = $this->mysqli->prepare($updateQuery);
        $updateStmt->bind_param("ssi", $token, $expiry, $admin['id']);
        $updateStmt->execute();

        if ($updateStmt->affected_rows > 0) {
            return json_encode([
                'success' => true,
                'token' => $token,
                'user_id' => $admin['id'],
                'is_admin' => true
            ]);
        } else {
            return json_encode(['success' => false, 'error' => 'Failed to generate authentication token.']);
        }
    }

    // Admin registration
    public function adminRegister($email, $username, $password) {
        try {
            // Validate inputs
            if (empty($email) || empty($username) || empty($password)) {
                return ['success' => false, 'error' => 'All fields are required.'];
            }

            // Check if email contains valid format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return ['success' => false, 'error' => 'Invalid email format'];
            }

            // Check if email already exists in admin_users
            $stmt = $this->mysqli->prepare("SELECT id FROM admin_users WHERE email = ?");
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                return ['success' => false, 'error' => 'Email already registered as admin.'];
            }

            // Generate unique auth token
            $authToken = bin2hex(random_bytes(32));
            
            // Set token expiration (e.g., 30 days from now)
            $tokenExpires = date('Y-m-d H:i:s', strtotime('+30 days'));

            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            // Insert new admin user
            $stmt = $this->mysqli->prepare("INSERT INTO admin_users (username, email, password, auth_token, token_expires, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("sssss", $username, $email, $hashedPassword, $authToken, $tokenExpires);
            
            if ($stmt->execute()) {
                $userId = $this->mysqli->insert_id;
                return [
                    'success' => true,
                    'message' => 'Admin registration successful',
                    'user_id' => $userId
                ];
            } else {
                return ['success' => false, 'error' => 'Registration failed: ' . $this->mysqli->error];
            }
        } catch (Exception $e) {
            // Catch any exceptions and return as error
            return ['success' => false, 'error' => 'Server error: ' . $e->getMessage()];
        }
    }

    public function rateRecipe($userId, $recipeId, $rating) {
        if ($rating < 1 || $rating > 5) {
            return json_encode(['success' => false, 'error' => 'Invalid rating']);
        }
        // Upsert rating
        $query = "INSERT INTO recipe_ratings (user_id, recipe_id, rating)
                  VALUES (?, ?, ?)
                  ON DUPLICATE KEY UPDATE rating = VALUES(rating)";
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("iii", $userId, $recipeId, $rating);
        if ($stmt->execute()) {
            return json_encode(['success' => true, 'message' => 'Rating saved']);
        }
        return json_encode(['success' => false, 'error' => 'Failed to save rating']);
    }

    public function getRecipeRating($recipeId) {
        $query = "SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings FROM recipe_ratings WHERE recipe_id = ?";
        $stmt = $this->mysqli->prepare($query);
        $stmt->bind_param("i", $recipeId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return json_encode([
            'success' => true,
            'avg_rating' => round($result['avg_rating'], 2),
            'total_ratings' => (int)$result['total_ratings']
        ]);
    }

    // Google login implementation
    public function googleLogin($idToken) {
        if (empty($idToken)) {
            return json_encode(["error" => "ID token is required"]);
        }

        try {
            // Debug information
            error_log("Google login request received with token: " . substr($idToken, 0, 10) . "...");

            // Google client ID
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
            $response = file_get_contents("https://oauth2.googleapis.com/tokeninfo?id_token=$idToken", false, $context);

            if ($response === false) {
                return json_encode(["error" => "Failed to verify token with Google"]);
            }

            $payload = json_decode($response, true);
            error_log("Google payload: " . print_r($payload, true));

            // Verify the audience (client ID)
            if (!isset($payload['aud']) || $payload['aud'] != $client_id) {
                return json_encode(["error" => "Invalid token audience"]);
            }

            // Get user details
            $email = $payload['email'];
            $name = isset($payload['name']) ? $payload['name'] : $payload['email'];
            $google_id = $payload['sub'];
            $picture = isset($payload['picture']) ? $payload['picture'] : null;

            error_log("Google picture URL: " . ($picture ?? 'NULL'));

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
            $query = "SELECT id, username, email, profile_image FROM users WHERE email = ? OR google_id = ?";
            $stmt = $this->mysqli->prepare($query);
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
                
                $update = $this->mysqli->prepare($updateQuery);
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
                
                $stmt = $this->mysqli->prepare("INSERT INTO users (username, email, password, google_id, profile_image) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssss", $name, $email, $password, $google_id, $profileImage);
                $stmt->execute();
                $user_id = $this->mysqli->insert_id;
                error_log("Created new user: " . $user_id);
            }

            // Generate auth token
            $auth_token = bin2hex(random_bytes(32));

            // Store token
            $stmt = $this->mysqli->prepare("UPDATE users SET auth_token = ? WHERE id = ?");
            $stmt->bind_param("si", $auth_token, $user_id);
            $stmt->execute();

            // Return response
            error_log("Final profile image path: " . $profileImage);
            return json_encode([
                "success" => "Google login successful",
                "data" => [
                    "id" => $user_id,
                    "username" => $name,
                    "email" => $email,
                    "auth_token" => $auth_token,
                    "profile_image" => $profileImage
                ]
            ]);

        } catch (Exception $e) {
            error_log("Google login error: " . $e->getMessage());
            return json_encode(["error" => "Server error: " . $e->getMessage()]);
        }
    }
=======
    
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
}
?>
