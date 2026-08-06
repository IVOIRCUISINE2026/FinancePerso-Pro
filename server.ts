import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Financial Assistant API
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    // System instruction to guide the financial bot
    const systemInstruction = `
      Tu es un assistant financier intelligent pour l'application FinancePerso Pro.
      Ton ton est professionnel, encourageant et pragmatique.
      
      CONTEXTE DU COMPTE :
      ${JSON.stringify(context)}
      
      MISSIONS :
      1. Répondre aux questions financières de l'utilisateur.
      2. Analyser les dépenses par rapport aux budgets.
      3. Signaler proactivement si une dépense dépasse les normes (budgets) définies.
      
      RÈGLES :
      - Utilise les données fournies dans le contexte pour tes analyses.
      - Sois précis sur les chiffres.
      - Si un budget est dépassé ou presque atteint, mentionne-le clairement.
      - Parle en français.
    `;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      },
    });

    // Send the history if needed, but for simplicity we'll just send the last message for now
    // or reconstruct history if we have it.
    const lastMessage = messages[messages.length - 1];
    const response = await chat.sendMessage({ message: lastMessage.content });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Une erreur est survenue lors de la communication avec l'IA." });
  }
});

app.post("/api/report", async (req, res) => {
  try {
    const { transactions, incomes } = req.body;
    
    const prompt = `
      Génère un rapport financier hebdomadaire complet basé sur les données suivantes :
      - Revenus : ${JSON.stringify(incomes)}
      - Transactions : ${JSON.stringify(transactions)}
      
      Le rapport doit inclure :
      1. Un résumé des dépenses totales.
      2. Une analyse par catégorie.
      3. Des conseils personnalisés pour économiser.
      4. Une conclusion sur la santé financière actuelle.
      
      Utilise un format Markdown élégant avec des titres, des listes et du gras.
      Parle en français.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Report error:", error);
    res.status(500).json({ error: "Erreur lors de la génération du rapport." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
