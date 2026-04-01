<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');

$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['time'], $inputData['text_content'], $inputData['channel_name'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameters', 'post_id' => null, 'parent_id' => null]);
    exit;
}
$time = $inputData['time'];
$text_content = $inputData['text_content'];
$channel_name = $inputData['channel_name'];
$course_id = $_SESSION['course_id'];
$email = $_SESSION['email'];
$channel_id = $boardController->getChannelId($course_id, $channel_name);

if ($channel_id === null) {
    http_response_code(404);
    echo json_encode(['state' => 'fail', 'error_message' => 'Channel not found', 'post_id' => null, 'parent_id' => null]);
    exit;
}

$addPostResult = $boardController->addPost($email, $text_content, $time, $channel_id, null, $course_id);
if ($addPostResult['success']) {
    $post_id = $addPostResult['postId'];
    http_response_code(201);
    echo json_encode(['state' => 'success', 'error_message' => '', 'post_id' => $post_id, 'parent_id' => null]);
} else {
    http_response_code(500);
    echo json_encode(['state' => 'fail', 'error_message' => 'Failed to add post', 'post_id' => null, 'parent_id' => null]);
}


