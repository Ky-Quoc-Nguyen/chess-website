const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "sqluser",
  password: "password",
  database: "chessClubDB",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      res.status(500).send("Error registering new user");
    } else {
      res.redirect("http://127.0.0.1:5500/index.html#");
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Received credentials:", username, password);

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    console.log("Database query results:", results);
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length > 0) {
      if (results[0].password === password) {
        res.json({
          success: true,
          message: "Login successful",
          username: username,
        });
      } else {
        res.json({ success: false, message: "Invalid username or password" });
      }
    } else {
      res.json({ success: false, message: "Invalid username or password" });
    }
  });
});

app.post("/posts", (req, res) => {
  const { title, content, author } = req.body; // Ensure your form sends these fields
  const sql = "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)";
  db.query(sql, [title, content, author], (err, result) => {
    if (err) {
      console.error("Database error during post creation:", err);
      return res.status(500).send("Error creating new post");
    }
    res.json({
      success: true,
      message: "Post created",
      postId: result.insertId,
    });
  });
});

app.get("/posts", (req, res) => {
  const sql = "SELECT id, title, content, author,created_at FROM posts"; // Select only id and title
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error during fetching posts:", err);
      return res.status(500).send("Error fetching posts");
    }
    res.json(results);
  });
});

app.get("/getComments/:postId", (req, res) => {
  const postId = req.params.postId;
  const sql = "SELECT * FROM comments WHERE post_id = ?";
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error fetching comments" });
    }
    res.json(results);
  });
});

app.post("/postComment", (req, res) => {
  const { postId, author, content } = req.body;
  const sql =
    "INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)";
  db.query(sql, [postId, author, content], (err, result) => {
    if (err) {
      console.error("Error posting comment:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error posting comment" });
    }
    res.json({ success: true, message: "Comment posted successfully" });
  });
});

app.delete("/deletePost/:postId", (req, res) => {
  const postId = req.params.postId;
  const username = req.body.username;

  const sql = "DELETE FROM posts WHERE id = ?";
  db.query(sql, [postId], (err, result) => {
    if (err) {
      console.error("Error deleting post:", err);
      res.status(500).send("Error deleting post");
    } else {
      res.send("Post deleted successfully");
    }
  });
});

//console.log(postId, voteType, username)
app.post("/vote", (req, res) => {
  const { postId, voteType, username } = req.body;
  let sql;
  console.log(postId, voteType, username);
  switch (voteType) {
    case "like":
      sql = `
        UPDATE posts
        SET liked_by = JSON_ARRAY_APPEND(COALESCE(liked_by, JSON_ARRAY()), '$', ?)
        WHERE id = ?;
      `;
      break;
    case "dislike":
      sql = `
        UPDATE posts
        SET disliked_by = JSON_ARRAY_APPEND(COALESCE(liked_by, JSON_ARRAY()), '$', ?)
        WHERE id = ?;
      `;
      break;
    case "unvote":
      sql = `
        UPDATE posts
        SET liked_by = JSON_REMOVE(liked_by, JSON_UNQUOTE(JSON_SEARCH(liked_by, 'one', ?)))
        WHERE id = ? AND JSON_CONTAINS(liked_by, JSON_QUOTE(?));
      `;
      break;
    default:
      return res
        .status(400)
        .json({ success: false, message: "Invalid vote action" });
  }

  db.query(sql, [username, postId, username], (err, result) => {
    if (err) {
      console.error("Error updating vote:", err);
      return res.status(500).json({ success: false, message: "Error updating vote" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Post not found or no changes made" });
    }
    res.json({ success: true, message: "Vote updated" });
  });
});

// app.post("/vote", (req, res) => {
//   const { postId, voteType, username } = req.body;
//   let sql;
//   console.log(postId, voteType, username)

//   switch (voteType) {
//     case "like":
//       sql = `
//       UPDATE posts
//       SET liked_by = IF(liked_by IS NOT NULL AND JSON_CONTAINS(liked_by, ?, '$'), JSON_REMOVE(liked_by, JSON_UNQUOTE(JSON_SEARCH(liked_by, 'one', ?))), liked_by),
//           disliked_by = IF(disliked_by IS NOT NULL AND JSON_CONTAINS(disliked_by, ?, '$'), JSON_REMOVE(disliked_by, JSON_UNQUOTE(JSON_SEARCH(disliked_by, 'one', ?))), disliked_by)
//       WHERE id = ?;
//     `;
//       break;
//     case "dislike":
//       sql = `
//       UPDATE posts
//       SET disliked_by = IF(disliked_by IS NULL, JSON_ARRAY(?), IF(JSON_CONTAINS(disliked_by, ?), disliked_by, JSON_ARRAY_APPEND(disliked_by, '$', ?))),
//           liked_by = IF(liked_by IS NULL, JSON_ARRAY(), JSON_REMOVE(liked_by, JSON_UNQUOTE(JSON_SEARCH(liked_by, 'one', ?))))
//       WHERE id = ?;
//     `;
//       break;
//     case "unvote":
//       sql = `
//         UPDATE posts
//         SET liked_by = IF(liked_by IS NOT NULL AND JSON_CONTAINS(liked_by, ?, '$'), JSON_REMOVE(liked_by, JSON_UNQUOTE(JSON_SEARCH(liked_by, 'one', ?))), liked_by),
//             disliked_by = IF(disliked_by IS NOT NULL AND JSON_CONTAINS(disliked_by, ?, '$'), JSON_REMOVE(disliked_by, JSON_UNQUOTE(JSON_SEARCH(disliked_by, 'one', ?))), disliked_by)
//         WHERE id = ?;
//       `;
//       break;
//     default:
//       return res.status(400).json({ success: false, message: "Invalid vote action" });
//   }

//   db.query(sql, [username, username, username, username, postId], (err, result) => {
//     if (err) {
//       console.error("Error updating vote:", err);
//       return res.status(500).json({ success: false, message: "Error updating vote" });
//     }
//     res.json({ success: true, message: "Vote updated" });
//   });
// });

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
