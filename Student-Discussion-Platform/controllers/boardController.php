<?php

require_once __DIR__ . '/../includes/config.php';
require_once 'userController.php';

$boardController = new BoardController();

class BoardController
{
    public function getAllDiscussionBoard()
    {
        global $db;

        $sql = "SELECT * FROM DiscussionBoards";
        $stmt = $db->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCourseInfoById($courseID)
    {
        global $db;

        $sql = "SELECT * FROM DiscussionBoards WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$courseID]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function listPostsInBoard($courseID, $email)
    {
        global $db;

        $sql = "SELECT p.id AS post_id, p.content, p.post_time, c.name AS channel_name, 
                   u.first_name, u.last_name,
                   CASE WHEN upp.email IS NOT NULL THEN 'true' ELSE 'false' END AS PIN
            FROM Posts p
                     INNER JOIN Channels c ON p.channel_id = c.id
                     INNER JOIN Users u ON p.author_email = u.email
                     LEFT JOIN UserPinPost upp ON p.id = upp.post_id AND upp.email = ?
            WHERE p.course_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$email, $courseID]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function getChannelsInBoard($courseID)
    {
        global $db;

        $sql = "SELECT name FROM Channels WHERE course_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$courseID]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUsersInCourse($courseId)
    {
        global $db;

        $sql = "SELECT Users.email, Users.first_name, Users.last_name, UserBoardRelations.role 
                FROM Users 
                JOIN UserBoardRelations ON Users.email = UserBoardRelations.email 
                WHERE UserBoardRelations.course_id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$courseId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addPost($authorEmail, $textContent, $time, $channelId, $parentId, $courseId)
    {
        global $db;

        $sql = "INSERT INTO Posts (author_email, content, post_time, channel_id, parent_id, course_id) 
                VALUES (?, ?, ?, ?, ?, ?)";

        try {
            $stmt = $db->prepare($sql);
            $result = $stmt->execute([$authorEmail, $textContent, $time, $channelId, $parentId, $courseId]);

            if ($result) {
                $newPostId = $db->lastInsertId();
                return ['success' => true, 'postId' => $newPostId];
            } else {
                return ['success' => false, 'postId' => null];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'postId' => null, 'error' => $e->getMessage()];
        }
    }

    public function getChannelId($course_id, $channel_name)
    {
        global $db;

        $sql = "SELECT id FROM Channels WHERE course_id = ? AND name = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$course_id, $channel_name]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? $result['id'] : null;
    }

    public function getPostInChannel($course_id, $email, $channel_name)
    {

        $channel_id = $this->getChannelId($course_id, $channel_name);
        if ($channel_id == null) {
            return ['success' => false, 'error' => 'Channel not exists'];
        }

        global $db;

        $sql = "SELECT p.id AS post_id, p.content, p.post_time, c.name AS channel_name, 
                   u.first_name, u.last_name,
                   CASE WHEN upp.email IS NOT NULL THEN 'true' ELSE 'false' END AS PIN
            FROM Posts p
                     INNER JOIN Channels c ON p.channel_id = c.id
                     INNER JOIN Users u ON p.author_email = u.email
                     LEFT JOIN UserPinPost upp ON p.id = upp.post_id AND upp.email = ?
            WHERE p.channel_id = ?";

        $stmt = $db->prepare($sql);
        $stmt->execute([$email, $channel_id]);

        return ['success' => true, 'posts' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
    }

    public function convertMemberType($email, $courseID)
    {
        global $db;

        $checkRoleSql = "SELECT role FROM UserBoardRelations WHERE email = ? AND course_id = ?";
        $checkRoleStmt = $db->prepare($checkRoleSql);
        $checkRoleStmt->execute([$email, $courseID]);
        $row = $checkRoleStmt->fetch();

        if (!$row) {
            return ["error" => "User with the given email and course ID not found."];
        }

        $currentRole = $row['role'];

        if ($currentRole === 'student') {
            $newRole = 'ta';
        } elseif ($currentRole === 'ta') {
            $newRole = 'student';
        } else {
            return ["error" => "No role change required for the user."];
        }

        $updateSql = "UPDATE UserBoardRelations SET role = ? WHERE email = ? AND course_id = ?";
        try {
            $updateStmt = $db->prepare($updateSql);
            $result = $updateStmt->execute([$newRole, $email, $courseID]);

            if ($result) {
                return ["success" => "User role updated successfully."];
            } else {
                return ["error" => "Failed to update user role."];
            }
        } catch (PDOException $e) {
            return ["error" => "Database error: " . $e->getMessage()];
        }
    }


    public function renameChannel($courseID, $oldChannelName, $newChannelName)
    {
        global $db;

        $checkNewSql = "SELECT * FROM Channels WHERE course_id = ? AND name = ?";
        $checkNewStmt = $db->prepare($checkNewSql);
        $checkNewStmt->execute([$courseID, $newChannelName]);

        if ($checkNewStmt->rowCount() > 0) {
            return ["error" => "New channel name already exists in this course."];
        }

        $updateSql = "UPDATE Channels SET name = ? WHERE course_id = ? AND name = ?";
        try {
            $updateStmt = $db->prepare($updateSql);
            $result = $updateStmt->execute([$newChannelName, $courseID, $oldChannelName]);

            if ($result) {
                return ["success" => "Channel name updated successfully."];
            } else {
                return ["error" => "Failed to update channel name."];
            }
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                return ["error" => "Channel name is already exists in this course."];
            } else {
                return ["error" => "Database error: " . $e->getMessage()];
            }
        }


    }

    public function addChannel($courseID, $newChannelName)
    {
        global $db;

        $insertSql = "INSERT INTO Channels (name, course_id) VALUES (?, ?)";
        try {
            $insertStmt = $db->prepare($insertSql);
            $result = $insertStmt->execute([$newChannelName, $courseID]);

            if ($result) {
                return ["success" => "Channel added successfully."];
            } else {
                return ["error" => "Failed to add new channel."];
            }
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                return ["error" => "Channel name is already exists in this course."];
            } else {
                return ["error" => "Database error: " . $e->getMessage()];
            }
        }


    }


    public function addMember($email, $courseID)
    {
        global $db, $userController;

        $user = $userController->getUserByEmail($email);

        if ($user) {
            $userRole = $user['role'];
            $insertSql = "INSERT INTO UserBoardRelations (email, course_id, role) VALUES (?, ?, ?)";
            try {
                $insertStmt = $db->prepare($insertSql);
                $result = $insertStmt->execute([$email, $courseID, $userRole]);

                if ($result) {
                    return ["success" => "User added as a member successfully."];
                } else {
                    return ["error" => "Failed to add user as a member."];
                }
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) {
                    return ["error" => "User is already a member of this course."];
                } else {
                    return ["error" => "Database error: " . $e->getMessage()];
                }
            }
        } else {
            return ["error" => "User not registered."];
        }
    }

    public function pinPost($email, $postId)
    {
        global $db;

        $sql = "INSERT INTO UserPinPost (email, post_id) VALUES (?, ?)";
        try {
            $stmt = $db->prepare($sql);
            $stmt->execute([$email, $postId]);

            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Post successfully pinned'];
            } else {
                return ['success' => false, 'message' => 'No rows affected'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    public function unpinPost($email, $postId)
    {
        global $db;

        $sql = "DELETE FROM UserPinPost WHERE email = ? AND post_id = ?";
        try {
            $stmt = $db->prepare($sql);
            $stmt->execute([$email, $postId]);

            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Post successfully unpinned'];
            } else {
                return ['success' => false, 'message' => 'No rows affected'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }


    public function getPinnedPostsByUser($courseID, $email)
    {
        global $db;

        $sql = "SELECT p.id AS post_id, p.content, p.post_time, c.name AS channel_name, 
                   u.first_name, u.last_name,
                   CASE WHEN upp.email IS NOT NULL THEN 'true' ELSE 'false' END AS PIN
            FROM UserPinPost upp
                     INNER JOIN Posts p ON upp.post_id = p.id
                     INNER JOIN Channels c ON p.channel_id = c.id
                     INNER JOIN Users u ON p.author_email = u.email
            WHERE p.course_id = ? AND upp.email = ?";

        try {
            $stmt = $db->prepare($sql);
            $stmt->execute([$courseID, $email]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return ['error' => 'Database error: ' . $e->getMessage()];
        }
    }


    public function deletePost($postId, $manageTransaction = true)
    {
        global $db;

        $sqlDeleteUserPinPost = "DELETE FROM UserPinPost WHERE post_id = ?";
        $sqlDeletePost = "DELETE FROM Posts WHERE id = ?";
        try {
            if ($manageTransaction) {
                $db->beginTransaction();
            }

            $stmtUserPinPost = $db->prepare($sqlDeleteUserPinPost);
            $stmtUserPinPost->execute([$postId]);

            $stmtPost = $db->prepare($sqlDeletePost);
            $stmtPost->execute([$postId]);

            if ($manageTransaction) {
                $db->commit();
            }

            if ($stmtPost->rowCount() > 0) {
                return ['success' => true, 'message' => 'Post and related pins successfully deleted'];
            } else {
                return ['success' => false, 'message' => 'No rows affected, post may not exist'];
            }
        } catch (PDOException $e) {
            if ($manageTransaction) {
                $db->rollBack();
            }
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }



    public function deleteChannel($channelName, $courseID)
    {
        global $db;

        $sql = "DELETE FROM Channels WHERE name = ? AND course_id = ?";

        try {
            $stmt = $db->prepare($sql);
            $stmt->execute([$channelName, $courseID]);

            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Channel successfully deleted'];
            } else {
                return ['success' => false, 'message' => 'No channel found with the provided name and course ID'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }


    public function removeUserFromBoard($email, $courseID)
    {
        global $db;

        $sql = "DELETE FROM UserBoardRelations WHERE email = ? AND course_id = ?";

        try {
            $stmt = $db->prepare($sql);
            $stmt->execute([$email, $courseID]);

            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'User successfully removed from the board'];
            } else {
                return ['success' => false, 'message' => 'No user-board relation found with the provided email and course ID'];
            }
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }


    public function createBoard($owner_email, $course_name, $semester)
    {
        global $db;

        try {
            $db->beginTransaction();

            $insertBoardSql = "INSERT INTO DiscussionBoards (course_name, semester, owner) VALUES (?, ?, ?)";
            $insertBoardStmt = $db->prepare($insertBoardSql);
            $insertBoardStmt->execute([$course_name, $semester, $owner_email]);

            $boardId = $db->lastInsertId();

            $insertChannelSql = "INSERT INTO Channels (name, course_id) VALUES ('Announcements', ?)";
            $insertChannelStmt = $db->prepare($insertChannelSql);
            $insertChannelStmt->execute([$boardId]);

            $insertRelationSql = "INSERT INTO UserBoardRelations (email, course_id, role) VALUES (?, ?, 'professor')";
            $insertRelationStmt = $db->prepare($insertRelationSql);
            $insertRelationStmt->execute([$owner_email, $boardId]);

            $db->commit();

            return ["success" => "Board and initial channel created successfully.", 'course_id' => $boardId];

        } catch (PDOException $e) {
            $db->rollBack();

            if ($e->getCode() == 23000) {
                return ["error" => "A board for this course and semester already exists."];
            } else {
                return ["error" => "Database error: " . $e->getMessage()];
            }
        }
    }


    function deleteBoard($email, $courseID, $role)
    {
        global $db;

        try {
            if ($role !== 'admin') {
                $checkSql = "SELECT id FROM DiscussionBoards WHERE id = ? AND owner = ?";
                $checkStmt = $db->prepare($checkSql);
                $checkStmt->execute([$courseID, $email]);
                $board = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if (!$board) {
                    return ["error" => "You are not the owner of this board or the board does not exist."];
                }
            } else {

                $boardSql = "SELECT id FROM DiscussionBoards WHERE id = ?";
                $boardStmt = $db->prepare($boardSql);
                $boardStmt->execute([$courseID]);
                $board = $boardStmt->fetch(PDO::FETCH_ASSOC);

                if (!$board) {
                    return ["error" => "The board does not exist."];
                }
            }

            $db->beginTransaction();

            $postsSql = "SELECT id FROM Posts WHERE course_id = ?";
            $postsStmt = $db->prepare($postsSql);
            $postsStmt->execute([$board['id']]);
            while ($post = $postsStmt->fetch(PDO::FETCH_ASSOC)) {
                $deleteResult = $this->deletePost($post['id'], false);
                if (!$deleteResult['success']) {
                    return ["error" => "Delete post error: ".$deleteResult['error']];
                }
            }


            $deleteUserBoardRelationsSql = "DELETE FROM UserBoardRelations WHERE course_id = ?";
            $db->prepare($deleteUserBoardRelationsSql)->execute([$board['id']]);


            $deleteBoardSql = "DELETE FROM DiscussionBoards WHERE id = ?";
            $deleteBoardStmt = $db->prepare($deleteBoardSql);
            $result = $deleteBoardStmt->execute([$board['id']]);

            $db->commit();

            if ($result) {
                return ["success" => "Board and all related data deleted successfully."];
            } else {
                return ["error" => "Failed to delete the board."];
            }
        } catch (PDOException $e) {
            return ["error" => "Database error: " . $e->getMessage().' board:'.$board['id']];
        }
    }
}


