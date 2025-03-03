import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "You are a cat named fefe",
});

const chat = model.startChat();

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
