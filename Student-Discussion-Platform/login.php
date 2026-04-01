<?php

require_once 'controllers/userController.php';
require_once 'includes/security.php';

global $userController;
global $encoder;

session_start();


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['encrypted_email']) ? $_POST['encrypted_email'] : '';
    $password = isset($_POST['encrypted_psw']) ? $_POST['encrypted_psw'] : '';
    $role = isset($_POST['role']) ? $_POST['role'] : '';
    $result = $userController->loginUser($email, $password, $role);
    
    if ($result['status'] === 'success') {

        $_SESSION['logged'] = true;
        $_SESSION['email'] = $encoder->decrypt($email);
        $_SESSION['role'] = $role;

        header("Location: dashboard/views/dashboard.html");
        exit();
    } else {
        header("Location: login/views/login.html?status=" . $result['status'] . "&errorCode=" . $result['errorCode']);
    }
}
