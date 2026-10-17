import express, { type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required 'aistudio-build' User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Prioritized list of 100% FREE tier models.
// 'gemini-3.1-flash-lite' is fast, high-availability, lightweight, and completely free.
// If any model experiences high traffic (503), the server cascades seamlessly to the next free model.
const FREE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
];

const SYSTEM_INSTRUCTION = `You are AKIM AI, a friendly, witty, encouraging, and deeply respectful conversational AI companion.
You are fully bilingual in English and French.
- When the user writes in French, reply in natural, warm, idiomatic French.
- When the user writes in English, reply in natural, engaging English.
- If asked to translate or teach, you provide easy-to-understand explanations with examples.

Your core personality:
- Warm, polite, uplifting, and humorous (you love a good laugh, but always respectful and clean).
- Patient and encouraging, especially with students and beginners.
- Designed specifically for phone users: keep explanations structured, easy to read on small screens (use short paragraphs, clear bullet points, bold key concepts, and friendly emojis).

Your core superpowers:
1. Schoolwork & Homework: Break problems down step-by-step for math, sciences, grammar, literature, history, and geography. Explain the "why" and encourage the student.
2. Original Songwriting: Compose complete song lyrics with verses, pre-chorus, chorus, bridge, rhythm/flow cues, musical genre suggestions (Afrobeats, Pop, Rap, R&B, Acoustic ballad, etc.), and rhyme schemes.
3. Jokes & Fun: Tell hilarious, clean jokes, clever riddles, puns, and playful banter in both French and English.
4. General Knowledge: Explain how things work, world culture, science, tech, and daily life questions in simple, everyday language.
5. Natural Conversation: Be a genuine, positive companion who listens, motivates, and chats comfortably.

Never ask for money, subscriptions, or credit cards. You are 100% free and always happy to help.`;

// Helper: try stream with automatic fallback between free models
async function getStreamWithModelFallback(formattedContents: any[], systemInstruction: string) {
  let lastError: any = null;

  for (const model of FREE_MODELS) {
    try {
      console.log(`[AKIM AI] Attempting free model: ${model}`);
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });
      return { stream: responseStream, modelUsed: model };
    } catch (err: any) {
      console.warn(`[AKIM AI] Model ${model} encountered error:`, err?.status || err?.message || err);
      lastError = err;
      // Wait 300ms before trying the next free candidate model
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  throw lastError;
}

// Endpoint: AI chat with streaming SSE and automatic 503 resilience
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, language } = req.body;
  const isFr = language === 'fr';

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Set up SSE headers for smooth mobile streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Graceful helpful fallback if no API key is configured yet
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let fallbackText = '';

    if (lastMsg.includes('joke') || lastMsg.includes('blague')) {
      fallbackText = isFr
        ? "😄 **Voici une blague pour toi !**\n\nPourquoi les oiseaux ne jouent-ils jamais aux cartes ?\n... Parce qu'il y a trop de chats dans le quartier ! 🐦😂\n\n*Demande-m'en une autre quand tu veux !*"
        : "😄 **Here is a funny one for you!**\n\nWhy don't scientists trust atoms?\n... Because they make up everything! ⚛️😂\n\n*Tap me again for another joke or ask for a song!*";
    } else if (lastMsg.includes('song') || lastMsg.includes('chanson')) {
      fallbackText = isFr
        ? "🎵 **Chanson Originale : 'Lumière du Matin'** (Style: Afro-Pop Joyeux)\n\n*(Couplet 1)*\nLe réveil sonne, un nouveau jour se lève,\nRange tes doutes, poursuis tous tes rêves.\nChaque pas en avant construit ton histoire,\nRegarde devant toi avec tout ton espoir !\n\n*(Refrain)*\nOh oui on avance, on ne lâche rien,\nLe soleil brille sur notre chemin !\nAKIM est avec toi, main dans la main,\nAujourd'hui commence un beau lendemain ! 🎶✨"
        : "🎵 **Original Song: 'Rise & Shine'** (Style: Upbeat Acoustic Pop)\n\n*(Verse 1)*\nMorning light is breaking through the screen,\nChasing big dreams that nobody's seen.\nTake a deep breath, step into the sun,\nThe day has just started, the journey's begun!\n\n*(Chorus)*\nOh, we're climbing high, reaching for the stars,\nNever forget how amazing you are!\nWith rhythm in your heart and a beat in your soul,\nTogether we're gonna reach that goal! 🎶✨";
    } else {
      fallbackText = isFr
        ? `Bonjour ! Je suis **AKIM AI**, ton assistant gratuit et amical. Je suis prêt à t'aider avec tes devoirs, t'écrire des chansons, te raconter des blagues ou simplement discuter ! 😊 Comment puis-je t'aider aujourd'hui ?`
        : `Hello! I'm **AKIM AI**, your friendly, 100% free companion. I'm here to help with your schoolwork, write catchy songs, share jokes, and chat naturally! 😊 What would you like to explore today?`;
    }

    res.write(`data: ${JSON.stringify({ chunk: fallbackText })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  try {
    // Format conversation history for Gemini
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Stream using automatic free model fallback (gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.8-flash)
    const { stream, modelUsed } = await getStreamWithModelFallback(formattedContents, SYSTEM_INSTRUCTION);
    console.log(`[AKIM AI] Successfully streaming with model: ${modelUsed}`);

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    const errStatus = error?.status;
    const errMessage = String(error?.message || '');
    
    // Check if error is 503 (high demand / overloaded) or rate limited
    const isOverloaded =
      errStatus === 503 ||
      errStatus === 429 ||
      errMessage.includes('503') ||
      errMessage.toLowerCase().includes('overloaded') ||
      errMessage.toLowerCase().includes('high demand') ||
      errMessage.toLowerCase().includes('unavailable') ||
      errMessage.toLowerCase().includes('resource_exhausted');

    if (isOverloaded) {
      const friendlyMessage = isFr
        ? "🌟 **AKIM prend un court instant de répit !**\n\nLes serveurs gratuits de Google connaissent une très forte affluence en ce moment (Erreur 503 - Forte demande).\n\n💡 **Rassure-toi :** L'application est et restera **100% gratuite**, sans aucun abonnement ni paiement requis.\n\n🔄 **Que faire ?**\n- Patiente 5 à 10 secondes puis appuie sur le bouton **🔄 Réessayer** ci-dessous.\n- En attendant, tu peux aussi me demander une blague ou explorer les exemples !"
        : "🌟 **AKIM is catching his breath!**\n\nGoogle's free servers are currently experiencing peak demand (Error 503 - Service Overloaded).\n\n💡 **Don't worry:** AKIM is and will always remain **100% free**. No payment or subscription is ever required.\n\n🔄 **What to do:**\n- Wait 5–10 seconds and tap the **🔄 Retry** button below.\n- Meanwhile, feel free to try one of the starter buttons or ask a fun joke!";

      res.write(`data: ${JSON.stringify({ chunk: friendlyMessage, is503: true })}\n\n`);
    } else {
      const fallbackGeneric = isFr
        ? `Désolé, une petite interruption temporaire est survenue : ${errMessage || 'Service temporairement indisponible'}. Réessaie dans un instant !`
        : `Sorry, a temporary interruption occurred: ${errMessage || 'Service temporarily unavailable'}. Please try again in a moment!`;
      res.write(`data: ${JSON.stringify({ chunk: fallbackGeneric, isError: true })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// App status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    name: 'AKIM AI',
    status: 'online',
    activeModel: 'gemini-3.1-flash-lite',
    fallbackModels: FREE_MODELS,
    isFree: true,
    requiresBilling: false,
    languages: ['English', 'Français'],
    features: ['General Q&A', 'Homework & School Help', 'Original Songs', 'Clean Jokes', 'Bilingual Chat'],
  });
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AKIM AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
