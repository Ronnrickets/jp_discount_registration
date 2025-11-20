<?php
header('Content-Type: application/json');

require_once 'config.php';

if (!isset($pdo) || !$pdo instanceof PDO) {
    http_response_code(500);
    echo json_encode(['exists' => false, 'message' => 'Internal Server Error: Database connection object missing.']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['discount'])) {
    $discount = trim($_GET['discount']);

    if (empty($discount)) {
        http_response_code(400); 
        echo json_encode(['exists' => false, 'message' => 'Discount code cannot be empty.']);
        exit;
    }
    $sql = "SELECT COUNT(*) FROM discounts WHERE DiscountCode = :discount";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':discount', $discount);
        $stmt->execute();
        $count = $stmt->fetchColumn();

        if ($count > 0) {
            echo json_encode(['exists' => true, 'message' => 'Discount code is valid.']);
        } else {
            http_response_code(404);
            echo json_encode(['exists' => false, 'message' => 'Discount code not found.']);
        }
    } catch (PDOException $e) {
        http_response_code(500); 
        echo json_encode(['exists' => false, 'message' => 'Database Error: ' . $e->getMessage()]);
    }

} else {
    http_response_code(405); 
    echo json_encode(['exists' => false, 'message' => 'Invalid request method or missing discount code.']);
}
?>