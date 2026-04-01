SELECT *
FROM Users;
SELECT *
FROM UserBoardRelations;
SELECT *
FROM DiscussionBoards;
SELECT *
FROM Channels;
SELECT *
FROM Posts;
SELECT *
FROM UserPinPost;


SELECT *
FROM Users
WHERE email = 'mingze.wang@mail.mcgill.ca';



SELECT DiscussionBoards.*
FROM DiscussionBoards
         JOIN UserBoardRelations ON DiscussionBoards.id = UserBoardRelations.course_id
WHERE UserBoardRelations.email = 'mingze.wang@mail.mcgill.ca';


SELECT name
FROM Channels
WHERE Channels.course_id = 5;


SELECT role
FROM UserBoardRelations
WHERE email = 'mingze.wang@mail.mcgill.ca'
  AND course_id = 3;

SELECT course_name, semester
FROM DiscussionBoards
WHERE id = 1;


SELECT Users.email, Users.first_name, Users.last_name, UserBoardRelations.role
FROM Users
         JOIN UserBoardRelations ON Users.email = UserBoardRelations.email
WHERE UserBoardRelations.course_id = 2;

INSERT INTO Posts (author_email, content, post_time, channel_id, parent_id, course_id)
VALUES ('mingze.wang@mail.mcgill.ca', 'Hi!', '2023-11-27 15:45:00', 1, null, 1);


SELECT Posts.*
FROM Posts
         JOIN Channels ON Posts.channel_id = Channels.id
         JOIN DiscussionBoards ON Channels.course_id = DiscussionBoards.id
WHERE DiscussionBoards.id = 1;


UPDATE Channels
SET name = 'Assignment'
WHERE course_id = 4
  AND name = 'final project';

INSERT INTO UserBoardRelations (email, course_id, role)
VALUES ('ab@cd.com', 1, 'professor'),
       ('ab@cd.com', 2, 'professor'),
       ('ab@cd.com', 3, 'professor'),
       ('ab@cd.com', 4, 'professor'),
       ('ab@cd.com', 5, 'professor');


SELECT p.id, p.content, p.post_time, c.name AS channel_name, u.first_name, u.last_name
FROM Posts p
         INNER JOIN Channels c ON p.channel_id = c.id
         INNER JOIN Users u ON p.author_email = u.email
WHERE p.course_id = 1;

DELETE
FROM UserBoardRelations
WHERE email = 'haoxi.li@mail.mcgill.ca';



SELECT p.id                                                         AS post_id,
       p.content,
       p.post_time,
       c.name                                                       AS channel_name,
       u.first_name,
       u.last_name,
       CASE WHEN upp.email IS NOT NULL THEN 'true' ELSE 'false' END AS PIN
FROM Posts p
         INNER JOIN Channels c ON p.channel_id = c.id
         INNER JOIN Users u ON p.author_email = u.email
         LEFT JOIN UserPinPost upp ON p.id = upp.post_id AND upp.email = 'mingze.wang@mail.mcgill.ca'
WHERE p.course_id = 1;


SELECT p.id                                                         AS post_id,
       p.content,
       p.post_time,
       c.name                                                       AS channel_name,
       u.first_name,
       u.last_name,
       CASE WHEN upp.email IS NOT NULL THEN 'true' ELSE 'false' END AS PIN
FROM Posts p
         INNER JOIN Channels c ON p.channel_id = c.id
         INNER JOIN Users u ON p.author_email = u.email
         LEFT JOIN UserPinPost upp ON p.id = upp.post_id AND upp.email = 'mingze.wang@mail.mcgill.ca'
WHERE p.channel_id = 13;


