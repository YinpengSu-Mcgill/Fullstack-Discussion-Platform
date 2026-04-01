<?php

require_once '../../controllers/boardController.php';
require_once '../../includes/security.php';

global $boardController;
global $encoder;

session_start();
header('Content-Type: application/json');

function extractSecondPartAsNumber($s) {
    $parts = explode(' ', $s);
    return (count($parts) === 2 && is_numeric($parts[1])) ? (int)$parts[1] : null;
}

$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['invite_code'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameter: invite_code']);
    exit;
}

if (!isset($_SESSION['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

$email = $_SESSION['email'];

$course_id = $encoder->decrypt($inputData['invite_code']);
$course_id = extractSecondPartAsNumber($course_id);

if ($course_id === null) {
    http_response_code(401);
    echo json_encode(['state' => 'fail', 'error_message' => 'Incorrect invite code']);
    exit; 
}

$addMemberResult = $boardController->addMember($email, $course_id);

if (isset($addMemberResult['error'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => $addMemberResult['error']]);
} else {
    $courseInfo = $boardController->getCourseInfoById($course_id);
    if ($courseInfo === null) {
        http_response_code(404);
        echo json_encode(['error' => 'Course not found']);
        exit;
    }
    http_response_code(200);
    echo json_encode(['state' => 'success', 'error_message' => '', 'course_info' => $courseInfo]);
}

