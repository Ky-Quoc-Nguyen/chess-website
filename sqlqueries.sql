-- CREATE DATABASE chessClubDB;
-- USE chessClubDB;

-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(255) NOT NULL,
--     password VARCHAR(255) NOT NULL
-- );

-- DELETE FROM users;


-- USE chessClubDB;
-- CREATE TABLE posts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     content TEXT NOT NULL,
--     author VARCHAR(255) NOT NULL
--     -- created_at TIMESTAMP
-- );

-- INSERT INTO posts (title, content, author) VALUES ('Sample Post Title', 'This is the content of the sample post.', 'SampleAuthor');

-- DELETE FROM posts;

-- CREATE TABLE comments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     post_id INT,
--     author VARCHAR(255),
--     content TEXT,
--     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
-- );

INSERT INTO comments (post_id, author, content) VALUES (20, 'Peter', 'bro this shit is so lit');
