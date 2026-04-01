<?php
require_once 'controllers/userController.php';

global $userController;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = isset($_POST['encrypted_email']) ? $_POST['encrypted_email'] : '';
    $firstName = isset($_POST['encrypted_first_name']) ? $_POST['encrypted_first_name'] : '';
    $lastName = isset($_POST['encrypted_last_name']) ? $_POST['encrypted_last_name'] : '';
    $password = isset($_POST['encrypted_psw']) ? $_POST['encrypted_psw'] : '';
    $role = isset($_POST['role']) ? $_POST['role'] : '';

    $result = $userController->registerUser($email, $firstName, $lastName, $password, $role);


    if ($result['status'] == 'success') {
        header("Location: login/views/login.html");
    } else {
        header("Location: login/views/register.html?status=" . $result['status'] . "&errorCode=" . $result['errorCode']);
    }
    exit;
}
