<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['email'], $_SESSION['course_id'], $_SESSION['role'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required session variables']);
    exit;
}

$email = $_SESSION['email'];
$course_id = $_SESSION['course_id'];
$role = $_SESSION['role'];

$userInfo = $userController->getUserByEmail($email);
$userRole = $userController->getUserRoleInCourse($email, $course_id);
if ($role === 'admin') {
    $userRole = 'admin';
}

if ($userInfo === null || $userRole === null) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

$courseInfo = $boardController->getCourseInfoById($course_id);
if ($courseInfo === null) {
    http_response_code(404);
    echo json_encode(['error' => 'Course not found']);
    exit;
}

$response = [
    'user_first_name' => $userInfo['first_name'],
    'user_last_name' => $userInfo['last_name'],
    'user_role' => $userRole,
    'user_email' => $_SESSION['email'],
    'course_name' => $courseInfo['course_name'],
    'semester' => $courseInfo['semester']
];

http_response_code(200);
echo json_encode($response);


