// server.js
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(
  session({ secret: "your-secret", resave: false, saveUninitialized: true })
);

mongoose.connect("mongodb://localhost:27017/hello");

// Middleware to check the number of active sessions
const checkSessionLimit = (req, res, next) => {
  const userId = req.session.userId; // Assume user ID is stored in session
  if (userId) {
    User.findById(userId).then((user) => {
      if (user.sessions.length >= 2) {
        return res.status(403).json({ message: "Session limit reached." });
      }
      next();
    });
  } else {
    next();
  }
};

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const newUser = new User({ username, password });
  await newUser.save();
  res.status(201).send("User registered");
});

// Log in
app.post("/login", checkSessionLimit, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (user) {
    req.session.userId = user._id;
    // Here you might want to generate a session ID (e.g., UUID)
    const sessionId = req.session.id;
    user.sessions.push(sessionId);
    await user.save();
    res.send("Logged in");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Log out
app.post("/logout", (req, res) => {
  const userId = req.session.userId;
  User.findById(userId).then((user) => {
    user.sessions = user.sessions.filter((id) => id !== req.session.id);
    user.save();
    req.session.destroy();
    res.send("Logged out");
  });
});

// Protected route
app.get("/protected", (req, res) => {
  if (req.session.userId) {
    res.send("This is a protected route");
  } else {
    res.status(401).send("You are not authenticated");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
