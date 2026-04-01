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

$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['channel_name'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameters']);
    exit;
}

$courseID = $_SESSION['course_id'];
$email = $_SESSION['email'];
$channel_name = $inputData['channel_name'];

try {
    $result = $boardController->getPostInChannel($courseID, $email, $channel_name);
    if ($result['success']) {
        http_response_code(200);
        echo json_encode(['state' => 'success', 'error_message' => '', 'posts'=>$result['posts']]);
    } else {
        http_response_code(400);
        echo json_encode(['state' => 'success', 'error_message' => $result['error'], 'posts' => []]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

