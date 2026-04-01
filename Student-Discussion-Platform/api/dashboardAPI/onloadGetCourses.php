<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['email'], $_SESSION['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

if ($_SESSION['role'] === 'admin') {
    $result = $boardController->getAllDiscussionBoard();
} else {
    $email = $_SESSION['email'];
    $result = $userController->listDiscussionBoards($email);
}

echo json_encode($result);
