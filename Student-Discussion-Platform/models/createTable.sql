CREATE TABLE Users
(
    email      VARCHAR(255) UNIQUE PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(100) NOT NULL
);


CREATE TABLE DiscussionBoards
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    course_name VARCHAR(255) NOT NULL,
    semester    VARCHAR(255) NOT NULL,
    owner       VARCHAR(255) NOT NULL,
    UNIQUE (course_name, semester),
    FOREIGN KEY (owner) REFERENCES Users (email)
);


CREATE TABLE UserBoardRelations
(
    email     VARCHAR(255) NOT NULL,
    course_id INTEGER NOT NULL,
    role      VARCHAR(100) NOT NULL,
    UNIQUE (email, course_id),
    PRIMARY KEY (email, course_id),
    FOREIGN KEY (email) REFERENCES Users (email),
    FOREIGN KEY (course_id) REFERENCES DiscussionBoards (id)
);


CREATE TABLE Channels
(
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      VARCHAR(255) NOT NULL,
    course_id INTEGER,
    UNIQUE (name, course_id),
    FOREIGN KEY (course_id) REFERENCES DiscussionBoards (id)
);



CREATE TABLE Posts
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    author_email VARCHAR(255),
    content      TEXT     NOT NULL,
    post_time    DATETIME NOT NULL,
    channel_id   INTEGER  NOT NULL,
    parent_id    INTEGER,
    course_id    INTEGER,
    FOREIGN KEY (author_email) REFERENCES Users (email),
    FOREIGN KEY (channel_id) REFERENCES Channels (id),
    FOREIGN KEY (parent_id) REFERENCES Posts (id),
    FOREIGN KEY (course_id) REFERENCES DiscussionBoards (id)
);


CREATE TABLE UserPinPost
(
    email   VARCHAR(255) NOT NULL,
    post_id INTEGER      NOT NULL,
    UNIQUE (email, post_id),
    FOREIGN KEY (email) REFERENCES Users (email),
    FOREIGN KEY (post_id) REFERENCES Posts (id)
);


