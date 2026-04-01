<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;


session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['course_id'], $_SESSION['role'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Course ID not found in session']);
    exit;
}

$role = $_SESSION['role'];
if ($role == 'student') {
    http_response_code(403);
    echo json_encode(['state' => 'fail', 'error_message' => 'Insufficient permissions: '.$role]);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['email'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameter: email']);
    exit;
}

$email = $inputData['email'];
$course_id = $_SESSION['course_id'];


$convertResult = $boardController->convertMemberType($email, $course_id);
if (isset($convertResult['error'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => $convertResult['error']]);
} else {
    http_response_code(200);
    echo json_encode(['state' => 'success', 'error_message' => '']);
}

