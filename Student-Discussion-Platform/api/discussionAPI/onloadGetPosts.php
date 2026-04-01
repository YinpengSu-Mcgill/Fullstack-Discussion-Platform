<?php


require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');


if (!isset($_SESSION['email'], $_SESSION['course_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

$courseID = $_SESSION['course_id'];
$email = $_SESSION['email'];

try {
    $posts = $boardController->listPostsInBoard($courseID, $email);
    http_response_code(200);
    echo json_encode($posts);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

