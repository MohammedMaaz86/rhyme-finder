import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `You are a rhyme generator. Given a word, respond with ONLY a valid JSON object with exactly two keys:
- "perfect": array of perfect rhymes (same ending sound)
- "near": array of near/slant rhymes (similar but not exact sound)

Include up to 30 words per array. Return only the JSON — no markdown, no explanation.`;

app.post("/api/rhymes", async (req, res) => {
  const { word } = req.body;
  if (!word || typeof word !== "string") {
    return res.status(400).json({ error: "word required" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(`Rhymes for: ${word.trim()}`);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const data = JSON.parse(cleaned);
    res.json(data);
  } catch (err) {
    if (err instanceof SyntaxError) {
      res.status(500).json({ error: "Model returned invalid JSON" });
    } else {
      res.status(500).json({ error: err.message || "Failed to generate rhymes" });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rhyme Finder running → http://localhost:${PORT}`));
