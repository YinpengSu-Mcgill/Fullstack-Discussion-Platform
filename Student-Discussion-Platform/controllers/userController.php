<?php

require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/security.php';


$userController = new UserController();

class UserController
{

    public function registerUser($email, $firstName, $lastName, $password, $role)
    {
        global $db, $encoder;

        $firstName = $encoder->decrypt($firstName);
        $lastName = $encoder->decrypt($lastName);
        $email = $encoder->decrypt($email);

        $existingUser = $this->getUserByEmail($email);
        if ($existingUser) {
            return ['status' => 'error', 'errorCode' => '1', 'message' => 'Email already registered.'];
        }

        $sql = "INSERT INTO Users (email, first_name, last_name, password, role) VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        $success = $stmt->execute([$email, $firstName, $lastName, $password, $role]);

        if ($success) {
            return ['status' => 'success', 'errorCode' => '0', 'message' => 'User registered successfully.'];
        } else {
            return ['status' => 'error', 'errorCode' => '2', 'message' => 'Failed to register user.'];
        }
    }


    public function loginUser($email, $password, $role)
    {
        global $encoder;

        $email = $encoder->decrypt($email);
        $user = $this->getUserByEmail($email);

        if (!$user || $user['role'] != $role) {
            return ['status' => 'error', 'errorCode' => '3', 'message' => 'No user found with the given email and role.'];
        }

        if ($password == $user['password']) {
            return ['status' => 'success', 'errorCode' => '0', 'user' => $user];
        } else {
            return ['status' => 'error', 'errorCode' => '4', 'message' => 'Incorrect password.'];
        }
    }


    public function getUserByEmail($email)
    {
        global $db;

        $sql = "SELECT * FROM Users WHERE email = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserRoleInCourse($email, $courseId)
    {
        global $db;

        $sql = "SELECT role FROM UserBoardRelations WHERE email = ? AND course_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$email, $courseId]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? $result['role'] : null;
    }






    public function deleteUser($email)
    {
        global $db;

        $sql = "DELETE FROM Users WHERE email = ?";
        $stmt = $db->prepare($sql);

        return $stmt->execute([$email]);
    }

    public function listDiscussionBoards($email)
    {
        global $db;


        $sql = "SELECT DiscussionBoards.* FROM DiscussionBoards 
            JOIN UserBoardRelations ON DiscussionBoards.id = UserBoardRelations.course_id
            WHERE UserBoardRelations.email = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$email]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


}


