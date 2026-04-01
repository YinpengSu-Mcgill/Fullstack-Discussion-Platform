<?php

require_once '../../controllers/boardController.php';
require_once '../../includes/security.php';

global $boardController;
global $encoder;

session_start();
header('Content-Type: application/json');


if (!isset($_SESSION['email'])) {
    http_response_code(401);
    echo json_encode(['state' => 'fail', 'error_message' => 'User not logged in or invalid session']);
    exit;
}


if ($_SESSION['role'] == 'student') {
    http_response_code(403);
    echo json_encode(['state' => 'fail', 'error_message' => 'Insufficient permissions']);
    exit;
}


$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['course_name']) || !isset($inputData['semester'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameters: course_name and/or semester']);
    exit;
}

$owner_email = $_SESSION['email'];
$course_name = $inputData['course_name'];
$semester = $inputData['semester'];

$createBoardResult = $boardController->createBoard($owner_email, $course_name, $semester);

if (isset($createBoardResult['error'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => $createBoardResult['error']]);
} else {
    $courseInfo = $boardController->getCourseInfoById($createBoardResult['course_id']);
    http_response_code(200);
    echo json_encode(['state' => 'success', 'error_message' => '', 'course_info' => $courseInfo]);
}
