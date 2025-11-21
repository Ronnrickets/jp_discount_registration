<?php
header('Content-Type: application/json');

require_once 'config.php'; 

if (!isset($pdo) || !$pdo instanceof PDO) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal Server Error: Database connection object missing.']);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $discount   = trim($_POST['discount'] ?? '');
    $lastname       = trim($_POST['lastname'] ?? '');
    $firstname       = trim($_POST['firstname'] ?? '');
    $email      = trim($_POST['email'] ?? '');
    $phone      = trim($_POST['phone'] ?? '');

    if (empty($lastname) || empty($firstname) || empty($email) || empty($discount) || empty($phone)) {
        http_response_code(400); 
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        exit;
    }

    $checkSql = "
        SELECT COUNT(*) 
        FROM registration 
        WHERE DiscountCode = :discount 
        AND (Email = :email OR Phone = :phone)
    ";

    try {
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->bindParam(':discount', $discount);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->bindParam(':phone', $phone);
        $checkStmt->execute();
        $count = $checkStmt->fetchColumn();

        if ($count > 0) {
            http_response_code(409); 
            echo json_encode([
                'success' => false, 
                'message' => 'The **Discount Code** is already registered with this **Email** or **Phone** number.'
            ]);
            exit;
        }
    } catch (PDOException $e) {
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Database Error during check: ' . $e->getMessage()]);
        exit;
    }
    
    $sql = "
        INSERT INTO registration (DiscountCode, LastName, FirstName, Email, Phone) 
        VALUES (:discount, :lastname, :firstname, :email, :phone)
    ";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':discount', $discount);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'New record created successfully.']);
        } else {
            http_response_code(409); 
            echo json_encode(['success' => false, 'message' => 'Registration failed. Please check your data and try again.']);
        }
        
    } catch (PDOException $e) {
        http_response_code(500); 
        echo json_encode(['success' => false, 'message' => 'Database Error: ' . $e->getMessage()]);
    }

} else {
    http_response_code(405); 
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>