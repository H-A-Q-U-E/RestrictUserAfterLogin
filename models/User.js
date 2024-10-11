// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sessions: { type: [String], default: [] }, // Store session identifiers
});

module.exports = mongoose.model("User", userSchema);
