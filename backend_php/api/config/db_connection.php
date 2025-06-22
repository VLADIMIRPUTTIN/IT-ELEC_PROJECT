<?php
function db_connect() {
    $server = 'srv544.hstgr.io'; // Your database host
    $username = 'u867901111_foodhub'; // Your database username
    $password = 'Foodhub2025!'; // Your database password
    $dbname = 'u867901111_recipe_db'; // Your database name

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
