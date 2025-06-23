<?php

//set default time zone

date_default_timezone_set("Asia/Manila");

//set time limit of requests
set_time_limit(1000);

//define constants for server credentials/configuration
<<<<<<< HEAD
define("SERVER", "srv544.hstgr.io");
define("DATABASE", "u867901111_recipe_db");
define("USER", "u867901111_foodhub");
define("PASSWORD", "Foodhub2025!");
=======
define("SERVER", "localhost");
define("DATABASE", "recipe_db(1)");
define("USER", "root");
define("PASSWORD", "");
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
define("DRIVER", "mysql");

class Connection{
    private $connectionString = DRIVER . ":host=" . SERVER . ";dbname=" . DATABASE . "; charset=utf8mb4";
    private $options = [
        \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        \PDO::ATTR_EMULATE_PREPARES => false
    ];


    public function connect(){
        return new \PDO($this->connectionString, USER, PASSWORD, $this->options);
    }
}
