import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.json({ limit: "50mb" }));

let defaultGenAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  defaultGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

let defaultAnthropic: Anthropic | null = null;
if (process.env.ANTHROPIC_API_KEY) {
  defaultAnthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// 1. Chat Proxy
app.post("/api/chat", async (req, res) => {
  const { messages, engine = "gemini", system, apiKey } = req.body;
  try {
    if (engine === "claude") {
      const client = apiKey ? new Anthropic({ apiKey }) : defaultAnthropic;
      if (!client) return res.status(400).json({ error: "Anthropic API key not configured" });
      
      const anthropicMessages = messages.map((m: any) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts.map((p: any) => {
          if (p.text) return { type: "text", text: p.text };
          if (p.inlineData && p.inlineData.mimeType.startsWith('image/')) {
            return { type: "image", source: { type: "base64", media_type: p.inlineData.mimeType, data: p.inlineData.data } };
          }
          return null;
        }).filter(Boolean),
      }));

      const msg = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: system || "You are a helpful assistant.",
        messages: anthropicMessages,
      });

      let responseText = "";
      for (const content of msg.content) {
         if (content.type === 'text') responseText += content.text;
      }
      res.json({ text: responseText });
    } else {
      const client = apiKey ? new GoogleGenAI({ apiKey }) : defaultGenAI;
      if (!client) return res.status(400).json({ error: "Gemini API key not configured" });
      
      const response = await client.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: messages,
        config: { systemInstruction: system },
      });
      res.json({ text: response.text });
    }
  } catch (error: any) {
    let errorMessage = error.message || "Failed to generate content";
    if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      errorMessage = "Rate limit exceeded (Quota exhausted). Please wait a few seconds and try again.";
      console.warn("API Rate Limit Exceeded (429)");
    } else {
      console.error("API Error:", error);
    }
    res.status(500).json({ error: errorMessage });
  }
});

// 2. TTS Proxy
app.post("/api/tts", async (req, res) => {
  const { text, apiKey } = req.body;
  const client = apiKey ? new GoogleGenAI({ apiKey }) : defaultGenAI;
  if (!client) return res.status(400).json({ error: "Gemini API key not configured" });

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Repeat this exactly: " + text,
      config: {
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } },
      },
    });
    
    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.mimeType?.startsWith("audio/"));
    if (audioPart && audioPart.inlineData) {
      res.json({ audio: audioPart.inlineData.data, mimeType: audioPart.inlineData.mimeType });
    } else {
      res.status(500).json({ error: "No audio generated" });
    }
  } catch (error: any) {
    let errorMessage = error.message || "Failed to generate TTS";
    if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      errorMessage = "Rate limit exceeded for Text-to-Speech. Please wait a moment.";
      console.warn("TTS Rate Limit Exceeded (429)");
    } else {
      console.error("TTS Error:", error);
    }
    res.status(500).json({ error: errorMessage });
  }
});

// 3. Image Generation Proxy
app.post("/api/image", async (req, res) => {
  const { prompt, aspectRatio = "1:1", apiKey } = req.body;
  const client = apiKey ? new GoogleGenAI({ apiKey }) : defaultGenAI;
  if (!client) return res.status(400).json({ error: "Gemini API key not configured" });

  try {
    const response = await client.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: aspectRatio }
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
      const img = response.generatedImages[0];
      res.json({ image: img.image?.imageBytes, mimeType: img.image?.mimeType || 'image/jpeg' });
    } else {
      res.status(500).json({ error: "Model did not return an image." });
    }
  } catch (error: any) {
    let errorMessage = error.message || "Failed to generate image";
    if (errorMessage.includes("not found") || errorMessage.includes("permission")) {
      errorMessage = "Image generation is not supported by your current API key or model configuration.";
      console.warn("Image API Permission Error");
    } else if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      errorMessage = "Rate limit exceeded for Image Generation. Please wait a moment.";
      console.warn("Image Gen Rate Limit Exceeded (429)");
    } else {
      console.error("Image Gen Error:", error);
    }
    res.status(500).json({ error: errorMessage });
  }
});

// P2P Signaling Relay
const p2pRooms: Record<string, any[]> = {};

app.post("/api/p2p/send", (req, res) => {
  const { room, message } = req.body;
  if (!p2pRooms[room]) p2pRooms[room] = [];
  p2pRooms[room].push({ ...message, id: Date.now().toString(), timestamp: Date.now() });
  // Keep only last 100 messages per room to prevent memory leak
  if (p2pRooms[room].length > 100) p2pRooms[room] = p2pRooms[room].slice(-100);
  res.json({ success: true });
});

app.get("/api/p2p/poll", (req, res) => {
  const { room, since } = req.query;
  const msgs = p2pRooms[room as string] || [];
  const sinceTime = Number(since || 0);
  res.json(msgs.filter(m => m.timestamp > sinceTime));
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
  }
  app.listen(PORT, "0.0.0.0", () => { console.log(`Server running on port ${PORT}`); });
}
startServer();
