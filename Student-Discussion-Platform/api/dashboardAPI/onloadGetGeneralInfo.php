<?php

require_once '../../controllers/userController.php';
require_once '../../controllers/boardController.php';

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['email']) || !isset($_SESSION['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

$email = $_SESSION['email'];

global $userController;
$userInfo = $userController->getUserByEmail($email);

if ($userInfo === null) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

$response = [
    'user_first_name' => $userInfo['first_name'],
    'user_last_name' => $userInfo['last_name'],
    'user_role' => $_SESSION['role'],
    'user_email' => $_SESSION['email']
];

http_response_code(200);
echo json_encode($response);


