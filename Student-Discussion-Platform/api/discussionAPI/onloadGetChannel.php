<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['course_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

$course_id = $_SESSION['course_id'];
$response = $boardController->getChannelsInBoard($course_id);

http_response_code(200);
echo json_encode($response);


