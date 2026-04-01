<?php

session_start();

if (!isset($_SESSION['logged']) || $_SESSION['logged'] !== true) {
    header('Content-Type: application/json');
    echo json_encode(['logged' => false]);
    exit();
}


$inputData = json_decode(file_get_contents("php://input"), true);
if (!isset($inputData['course_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No course ID provided']);
    exit();
}

$_SESSION['course_id'] = $inputData['course_id'];
$result = ['course_id' => $_SESSION['course_id']];

header('Content-Type: application/json');
echo json_encode($result);
