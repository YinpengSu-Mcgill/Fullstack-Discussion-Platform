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
    echo json_encode(['state' => 'fail', 'error_message' => '(Course ID / email) not found in session']);
    exit;
}
$courseID = $_SESSION['course_id'];
$email =  $_SESSION['email'];

$role = $userController->getUserRoleInCourse($courseID, $email);
if ($role == 'student') {
    http_response_code(403);
    echo json_encode(['state' => 'fail', 'error_message' => 'Insufficient permissions']);
    exit;
}

$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['channelName'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameter: channelName']);
    exit;
}

if ($inputData['channelName'] == 'Announcements') {
    http_response_code(405);
    echo json_encode(['state' => 'fail', 'error_message' => 'You are not allow to delete Announcements channel']);
    exit;
}

$channelName = $inputData['channelName'];
$result = $boardController->deleteChannel($channelName, $courseID);

http_response_code($result['success'] ? 200 : 400);
echo json_encode([
    'state' => $result['success'] ? 'success' : 'fail',
    'error_message' => $result['message']
]);
