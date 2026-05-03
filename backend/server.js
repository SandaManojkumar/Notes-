const express = require("express");
const mongoose = require("mongoose");
const Note = require("./models/Notes");
require('dotenv').config();

const app = express();
app.use(express.json());

// Simple request logger to help debug network issues
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const cors = require("cors");
app.use(cors());

// MongoDB connection (use MONGO_URI from env if present)

  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ CREATE
app.post("/api/notes", async (req, res) => {
  try {
    const note = new Note(req.body);
    const saved = await note.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL
app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE
app.put("/api/notes/:id", async (req, res) => {
  try {
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE
app.delete("/api/notes/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Home
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(5000, () => console.log("Server running on port 5000"));