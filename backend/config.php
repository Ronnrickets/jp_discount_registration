<?php
$host = 'localhost'; 
$port = '3310';      
$db   = 'jp_anniversarry';
$user = 'root';
$pass = '';          

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
try {
     $pdo = new PDO($dsn, $user, $pass);
} catch (\PDOException $e) {
     echo "Network Error. Could not connect to server: " . $e->getMessage();
     die();
}
?>