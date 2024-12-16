<?php
function db_connect() {
    $server = 'localhost'; // Your database host
    $username = 'root'; // Your database username
    $password = ''; // Your database password
    $dbname = 'recipe_db'; // Your database name

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
