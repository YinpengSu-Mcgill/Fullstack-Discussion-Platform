<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['course_id']) || !isset($_SESSION['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

$courseID = $_SESSION['course_id'];
$email = $_SESSION['email'];
$pinnedPosts = $boardController->getPinnedPostsByUser($courseID, $email);

if (isset($pinnedPosts['error'])) {
    http_response_code(500);
    echo json_encode(['error' => $pinnedPosts['error']]);
} else {
    http_response_code(200);
    echo json_encode($pinnedPosts);
}
