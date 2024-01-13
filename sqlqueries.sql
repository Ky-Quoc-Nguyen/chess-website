-- CREATE DATABASE chessClubDB;
-- USE chessClubDB;

-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(255) NOT NULL,
--     password VARCHAR(255) NOT NULL
-- );

-- CREATE TABLE posts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     title VARCHAR(255) NOT NULL,
--     content TEXT NOT NULL,
--     author VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE comments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     post_id INT,
--     author VARCHAR(255),
--     content TEXT NOT NULL,
--     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
-- );

-- INSERT INTO posts (title, content, author) VALUES ('What the hell', 'bro this shit is so lit', 'Peter');

-- INSERT INTO comments (post_id, author, content) VALUES (20, 'CommentAuthor', 'Comment content here');

-- ALTER TABLE posts
-- ADD COLUMN likes_count INT DEFAULT 0,
-- ADD COLUMN dislikes_count INT DEFAULT 0;

ALTER TABLE posts
-- ADD COLUMN liked_by TEXT,
-- ADD COLUMN disliked_by TEXT;
DROP COLUMN dislikes_count;