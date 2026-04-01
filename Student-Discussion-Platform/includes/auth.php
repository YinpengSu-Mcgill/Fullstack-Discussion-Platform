<?php
session_start();

$response = array('logged' => false);

if (isset($_SESSION['logged']) && $_SESSION['logged'] === true) {
    $response['logged'] = true;
}


header('Content-Type: application/json');
echo json_encode($response);
