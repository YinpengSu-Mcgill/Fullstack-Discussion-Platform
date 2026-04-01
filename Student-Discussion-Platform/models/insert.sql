INSERT INTO DiscussionBoards (course_name, semester, owner)
VALUES ('COMP307', 'Fall 2023', 'joseph.vybihal@mcgill.ca'),
       ('COMP350', 'Fall 2023', 'xiaowen.chang@mail.com'),
       ('COMP421', 'Winter 2023', 'kemme@cs.mcgill.ca'),
       ('COMP445', 'Fall 2023', 'eva.portelance@mcgill.ca'),
       ('COMP557', 'Fall 2022', 'kry@cs.mcgill.ca'),
       ('COMP206', 'Fall 2023', 'joseph.vybihal@mcgill.ca');

INSERT INTO Users (email, first_name, last_name, password, role)
VALUES ('joseph.vybihal@mcgill.ca', 'joseph', 'vybihal', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'professor'),
       ('xiaowen.chang@mail.com', 'Xiao-Wen', 'Chang', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'professor'),
       ('kemme@cs.mcgill.ca', 'Bettina', 'Kemme', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'professor'),
       ('eva.portelance@mcgill.ca', 'eva', 'portelance', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'professor'),
       ('kry@cs.mcgill.ca', 'Paul', 'Kry', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'professor'),
       ('admin@mail.com', 'Admin', '', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'admin');

INSERT INTO UserBoardRelations (email, course_id, role)
VALUES ('joseph.vybihal@mcgill.ca', 1, 'professor'),
       ('xiaowen.chang@mail.com', 2, 'professor'),
       ('kemme@cs.mcgill.ca', 3, 'professor'),
       ('eva.portelance@mcgill.ca', 4, 'professor'),
       ('kry@cs.mcgill.ca', 5, 'professor'),
       ('joseph.vybihal@mcgill.ca', 6, 'professor');


INSERT INTO Channels (name, course_id)
VALUES ('General', 1),
       ('General', 2),
       ('General', 3),
       ('General', 4),
       ('General', 5),
       ('General', 6),
       ('Announcements', 1),
       ('Announcements', 2),
       ('Announcements', 3),
       ('Announcements', 4),
       ('Announcements', 5),
       ('Announcements', 6);



