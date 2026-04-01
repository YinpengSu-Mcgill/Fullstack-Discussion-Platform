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
    http_response_code(401);
    echo json_encode(['state' => 'fail', 'error_message' => 'User not logged in']);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['course_id'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameter: course_id']);
    exit;
}

$email = $_SESSION['email'];
$role =  $_SESSION['role'];
$courseID = $inputData['course_id'];

$deleteBoardResult = $boardController->deleteBoard($email, $courseID, $role);

if (isset($deleteBoardResult['error'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => $deleteBoardResult['error']]);
} else {
    http_response_code(200);
    echo json_encode(['state' => 'success', 'message' => 'Board deleted successfully']);
}
