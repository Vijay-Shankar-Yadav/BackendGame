import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

console.log("🟢 Starting server...");
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ DB Error:", err));

/* ===== Contact Schema ===== */
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);

app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "Message saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===== News Schema ===== */
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,    // optional image URL
  video: String,    // optional video URL
  likes: { type: Number, default: 0 },
  comments: [
    {
      name: String,
      text: String,
      date: { type: Date, default: Date.now }
    }
  ],
  date: { type: Date, default: Date.now }
});

const News = mongoose.model("News", newsSchema);

/* ===== Routes for News ===== */

// Get all news
app.get("/news", async (req, res) => {
  try {
    const allNews = await News.find().sort({ date: -1 }); // latest first
    res.json(allNews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a news post
app.post("/news/add", async (req, res) => {
  try {
    const { title, content, image, video } = req.body;
    const newNews = new News({ title, content, image, video });
    await newNews.save();
    res.status(201).json({ success: true, message: "News added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Like a news post
app.post("/news/:id/like", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: "News not found" });
    news.likes += 1;
    await news.save();
    res.json({ likes: news.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a comment
app.post("/news/:id/comment", async (req, res) => {
  try {
    const { name, text } = req.body;
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: "News not found" });

    news.comments.push({ name, text });
    await news.save();
    res.json(news.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
