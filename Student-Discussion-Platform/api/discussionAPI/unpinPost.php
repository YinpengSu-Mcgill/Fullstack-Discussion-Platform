<?php

require_once '../../controllers/boardController.php';
require_once '../../controllers/userController.php';
require_once '../../includes/security.php';

global $boardController;
global $userController;
global $encoder;

session_start();
header('Content-Type: application/json');


if (!isset($_SESSION['email'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Email not found in session']);
    exit;
}


$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['post_id'])) {
    http_response_code(400);
    echo json_encode(['state' => 'fail', 'error_message' => 'Missing required parameter: post_id']);
    exit;
}

$result = $boardController->unpinPost($_SESSION['email'], $inputData['post_id']);

http_response_code($result['success'] ? 200 : 400);
echo json_encode([
    'state' => $result['success'] ? 'success' : 'fail',
    'error_message' => $result['message']
]);
