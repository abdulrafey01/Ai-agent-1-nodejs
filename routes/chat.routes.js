import express from "express";
import dotenv from "dotenv";
import gemini from "../services/gemini.js";

dotenv.config();
const router = express.Router();

const chat = gemini.startChat();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const result = await chat.sendMessage(message);
    res.status(200).json({ message: result.response.text() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
