//push date 5:33
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const fs = require('fs');


const cors = require("cors");
app.use(cors());
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("mssql");

const config = {
  user: "kynguyen1105",
  password: "Kyisagod1!",
  server: "chessclubdb.database.windows.net",
  database: "chessclubdb",
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

function logMessage(message) {
  const logFilePath = path.join(__dirname, "app.log");
  fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${message}\n`);
}
var options = {
  index: "hostingstart.html",
};
db.connect(config)
  .then((pool) => {
    logMessage("Connected to Azure SQL Database");
  })
  .catch((err) => {
    logMessage("Error connecting to Azure SQL: " + err.message);
  });

// Serve static files from the 'public' directory
app.use("/", express.static("/home/site/wwwroot", options));

// // Send the user to index.html if the route is not recognized
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public/index.html'));
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });
app.listen(process.env.PORT);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  logMessage("Registered USER");
  try {
    const pool = await db.connect(config);
    const result = await pool
      .request()
      .input("username", db.VarChar, username)
      .input("password", db.VarChar, password)
      .query(
        "INSERT INTO users (username, password) VALUES (@username, @password)"
      );
      res.json({
        success: true,
        message: "User registered successfully"
    });
    logMessage("Registered USER GOOD");


    res.redirect("hostingstart.html");
  } catch (err) {
    logMessage("Registered USER ERRROR");
    res.status(500).json({
      success: false,
      message: "Error registering new user"
  });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await db.connect(config);
    const results = await pool
      .request()
      .input("username", db.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");

    if (results.recordset.length > 0) {
      const user = results.recordset[0];
      if (user.password === password) {
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
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/posts", async (req, res) => {
  const { title, content, author } = req.body;
  try {
    const pool = await db.connect(config);
    const result = await pool
      .request()
      .input("title", db.NVarChar, title)
      .input("content", db.NVarChar, content)
      .input("author", db.NVarChar, author)
      .query(
        "INSERT INTO posts (title, content, author) OUTPUT INSERTED.id VALUES (@title, @content, @author)"
      );
    res.json({
      success: true,
      message: "Post created",
      postId: result.recordset[0].id,
    });
  } catch (err) {
    console.error("Database error during post creation:", err);
    res.status(500).send("Error creating new post");
  }
});

app.get("/posts", async (req, res) => {
  const sort = req.query.sort;
  const search = req.query.search;
  let sqlQuery =
    "SELECT id, title, content, author, created_at, like_count, dislike_count FROM posts";
  if (search) {
    sqlQuery +=
      " WHERE title LIKE '%' + @search + '%' OR content LIKE '%' + @search + '%'";
  }
  if (sort === "likes") {
    sqlQuery += " ORDER BY like_count DESC";
  } else if (sort === "recent") {
    sqlQuery += " ORDER BY created_at DESC";
  }
  try {
    const pool = await db.connect(config);
    const request = pool.request();
    if (search) {
      request.input("search", db.NVarChar, search);
    }
    const result = await request.query(sqlQuery);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error during fetching posts:", err);
    res.status(500).send("Error fetching posts");
  }
});

//   if (sort === 'likes') {
//     console.log("likes")
//     sql += "ORDER BY like_diff ASC"; // Order by vote difference in decreasing order
//   } else if (sort === 'recent') {
//     console.log("recent")
//     sql += "ORDER BY created_at ASC"; // Order by most recent
//   }

//   // Prepare the query parameters
//   const queryParameters = [];
//   if (search) {
//     queryParameters.push(search, search);
//   }

//   db.query(sql, queryParameters, (err, results) => {
//     if (err) {
//       console.error("Error during fetching posts:", err);
//       return res.status(500).send("Error fetching posts");
//     }
//     res.json(results);
//   });
// });

// app.get("/getComments/:postId", (req, res) => {
//   const postId = req.params.postId;
//   const sql = "SELECT * FROM comments WHERE post_id = ?";
//   db.query(sql, [postId], (err, results) => {
//     if (err) {
//       console.error("Error fetching comments:", err);
//       return res
//         .status(500)
//         .json({ success: false, message: "Error fetching comments" });
//     }
//     res.json(results);
//   });
// });

// app.post("/postComment", (req, res) => {
//   const { postId, author, content } = req.body;
//   const sql =
//     "INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)";
//   db.query(sql, [postId, author, content], (err, result) => {
//     if (err) {
//       console.error("Error posting comment:", err);
//       return res
//         .status(500)
//         .json({ success: false, message: "Error posting comment" });
//     }
//     res.json({ success: true, message: "Comment posted successfully" });
//   });
// });

// app.delete("/deletePost/:postId", (req, res) => {
//   const postId = req.params.postId;
//   const username = req.body.username;

//   const sql = "DELETE FROM posts WHERE id = ?";
//   db.query(sql, [postId], (err, result) => {
//     if (err) {
//       console.error("Error deleting post:", err);
//       res.status(500).send("Error deleting post");
//     } else {
//       res.send("Post deleted successfully");
//     }
//   });
// });

app.delete("/deletePost/:postId", async (req, res) => {
  const postId = req.params.postId;
  // Assuming 'username' is used for some validation or logging

  try {
      const pool = await sql.connect(config);
      await pool.request()
          .input('postId', sql.Int, postId)
          .query('DELETE FROM posts WHERE id = @postId');
      
      res.send("Post deleted successfully");
  } catch (err) {
      console.error("Error deleting post:", err);
      res.status(500).send("Error deleting post");
  }
});

// //console.log(postId, voteType, username)
// app.post("/vote", (req, res) => {
//   const { postId, voteType, username } = req.body;
//   let sql;
//   console.log(postId, voteType, username);
//   switch (voteType) {
//     case "like":
//       sql = `
//         UPDATE posts
//         SET liked_by = JSON_ARRAY_APPEND(COALESCE(liked_by, JSON_ARRAY()), '$', ?)
//         WHERE id = ?;
//       `;
//       break;
//     case "dislike":
//       sql = `
//         UPDATE posts
//         SET disliked_by = JSON_ARRAY_APPEND(COALESCE(disliked_by, JSON_ARRAY()), '$', ?)
//         WHERE id = ?;
//       `;
//       break;
//     case "unvoteUP":
//       sql = `
//         UPDATE posts
//         SET liked_by = JSON_REMOVE(liked_by, JSON_UNQUOTE(JSON_SEARCH(liked_by, 'one', ?)))
//         WHERE id = ? AND JSON_CONTAINS(liked_by, JSON_QUOTE(?));
//       `;
//       break;
//     case "unvoteDOWN":
//       sql = `
//           UPDATE posts
//           SET disliked_by = JSON_REMOVE(disliked_by, JSON_UNQUOTE(JSON_SEARCH(disliked_by, 'one', ?)))
//           WHERE id = ? AND JSON_CONTAINS(disliked_by, JSON_QUOTE(?));
//         `;
//       break;
//     default:
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid vote action" });
//   }

//   db.query(sql, [username, postId, username], (err, result) => {
//     if (err) {
//       console.error("Error updating vote:", err);
//       return res
//         .status(500)
//         .json({ success: false, message: "Error updating vote" });
//     }
//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Post not found or no changes made" });
//     }
//     res.json({ success: true, message: "Vote updated" });
//   });
// });

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });
