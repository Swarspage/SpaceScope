import express from "express";
import { chatWithAstro } from "../Controllers/aiController.js";

const router = express.Router();

// POST /api/ai/chat
router.post("/chat", chatWithAstro);

export default router;
