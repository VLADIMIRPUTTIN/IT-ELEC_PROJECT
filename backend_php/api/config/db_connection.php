<?php
function db_connect() {
<<<<<<< HEAD
    $server = 'srv544.hstgr.io'; // Your database host
    $username = 'u867901111_foodhub'; // Your database username
    $password = 'Foodhub2025!'; // Your database password
    $dbname = 'u867901111_recipe_db'; // Your database name
=======
    $server = 'localhost'; // Your database host
    $username = 'root'; // Your database username
    $password = ''; // Your database password
    $dbname = 'recipe_db'; // Your database name
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

    // Create connection
    $mysqli = new mysqli($server, $username, $password, $dbname);

    // Check connection
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }

    return $mysqli;
}

$mysqli = db_connect(); 
?>
