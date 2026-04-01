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


$course_id = $_SESSION['course_id'];
$courseInfo = $boardController->getCourseInfoById($course_id);
if ($courseInfo === null) {
    http_response_code(404);
    echo json_encode(['state' => 'fail', 'error_message' => 'fail to get course information']);
    exit;
}

$course_name = $courseInfo['course_name'];
$invite_code = $course_name . ' ' . $course_id;


http_response_code(200);
echo json_encode([
    'state' => 'success',
    'error_message' => '',
    'invite_code' => $encoder->encrypt($invite_code)
]);
