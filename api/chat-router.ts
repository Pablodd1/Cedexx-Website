import express from 'express';
import { buildSystemPrompt } from '../src/data/cedexx-knowledge';

const router = express.Router();

/**
 * POST /api/chat
 * AI chat endpoint — uses CEDEXX knowledge base for accurate responses
 */
router.post('/chat', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'en', provider } = req.body;
  
  // Get all API keys
  const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
  const XAI_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const KIMI_KEY = process.env.KIMI_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const MINIMAX_KEY = process.env.MINIMAX_API_KEY;

  const langInstruction = 
    language === 'es' ? "Responde en español profesional (Latinoamérica). " :
    language === 'ht' ? "Reponn an kreyòl ayisyen. " :
    language === 'ru' ? "Отвечайте на русском языке. " :
    "Respond in English. ";

  const systemPrompt = `${langInstruction}\n\n${buildSystemPrompt()}`;

  // Try providers in order of preference (Grok 3.0 first, followed by automatic failover loop)
  const availableProviders = [
    // xAI Grok 3.0 — PRIMARY BRAIN
    { name: 'grok', key: XAI_KEY, model: 'grok-3' },
    // DeepSeek V3.2 Fast
    { name: 'deepseek', key: DEEPSEEK_KEY, model: 'deepseek-chat' },
    // Kimi (Moonshot Global api.moonshot.ai — kimi-k2.6 ~800ms non-thinking mode)
    { name: 'kimi', key: KIMI_KEY, model: 'kimi-k2.6' },
    // Gemini — Fast fallback
    { name: 'gemini', key: GEMINI_KEY, model: 'gemini-2.0-flash' },
    // OpenAI — Backup
    { name: 'openai', key: OPENAI_KEY, model: 'gpt-4o-mini' },
    // MiniMax — Backup
    { name: 'minimax', key: MINIMAX_KEY, model: 'abab6.5s-chat' }
  ].filter(p => Boolean(p.key));

  if (availableProviders.length === 0) {
    const fallbackText = 'We are currently unavailable. Please try again in a moment or contact support at (888) 260-0585 or (754) 432-2201 for immediate assistance.';
    return res.status(200).json({ choices: [{ message: { content: fallbackText } }] });
  }

  const orderedProviders = [...availableProviders];
  if (provider) {
    const idx = orderedProviders.findIndex(p => p.name === provider);
    if (idx > 0) {
      const [reqProv] = orderedProviders.splice(idx, 1);
      orderedProviders.unshift(reqProv);
    }
  }

  for (const selectedProvider of orderedProviders) {
    try {
      // DeepSeek V3.2 Fast
      if (selectedProvider.name === 'deepseek' && DEEPSEEK_KEY) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.choices?.[0]?.message?.content) {
            return res.status(200).json({ ...data, provider: 'deepseek' });
          }
        }
        throw new Error('DeepSeek failed');
      }

      // xAI Grok 3.0
      if (selectedProvider.name === 'grok' && XAI_KEY) {
        for (const gModel of ['grok-3', 'grok-3-fast', 'grok-3-mini-fast', 'grok-3-mini']) {
          const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${XAI_KEY}`
            },
            body: JSON.stringify({
              model: gModel,
              messages: [{ role: 'system', content: systemPrompt }, ...messages],
              temperature: 0.3,
              max_tokens: 500
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.choices?.[0]?.message?.content) {
              return res.status(200).json({ ...data, provider: 'grok-3.0', requested_model: gModel });
            }
          }
        }
        throw new Error('Grok failed');
      }

      // Kimi (Moonshot Global api.moonshot.ai — kimi-k2.6 / kimi-k3)
      if (selectedProvider.name === 'kimi' && KIMI_KEY) {
        for (const endpoint of ['https://api.moonshot.ai/v1/chat/completions', 'https://api.moonshot.cn/v1/chat/completions']) {
          for (const kModel of ['kimi-k2.6', 'kimi-k3']) {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIMI_KEY}`
              },
              body: JSON.stringify({
                model: kModel,
                messages: [{ role: 'system', content: systemPrompt }, ...messages],
                thinking: { type: 'disabled' },
                temperature: 0.6,
                max_tokens: 500
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.choices?.[0]?.message?.content) {
                return res.status(200).json(data);
              }
            } else if (response.status === 401) {
              break;
            }
          }
        }
        throw new Error('Kimi failed');
      }

      // Gemini (Google)
      if (selectedProvider.name === 'gemini' && GEMINI_KEY) {
        const geminiMessages = messages.map((m: any) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        geminiMessages.unshift({ 
          role: 'user', 
          parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nYou are JasDex. Respond as instructed above.` }] 
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiMessages,
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
          })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (reply) {
          return res.status(200).json({
            choices: [{ message: { content: reply } }]
          });
        }
        throw new Error('Gemini failed');
      }

      // OpenAI
      if (selectedProvider.name === 'openai' && OPENAI_KEY) {
        const useAzure = OPENAI_KEY.includes('azure') || process.env.AZURE_OPENAI_ENDPOINT;
        
        const response = await fetch(useAzure 
          ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15`
          : 'https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_KEY}`,
            ...(useAzure && { 'api-key': OPENAI_KEY })
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            temperature: 0.3,
            max_tokens: 500
          })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return res.status(200).json(data);
        }
        throw new Error('OpenAI failed');
      }

      // MiniMax
      if (selectedProvider.name === 'minimax' && MINIMAX_KEY) {
        const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MINIMAX_KEY}`
          },
          body: JSON.stringify({
            model: 'abab6.5s-chat',
            messages: [{ role: "system", content: systemPrompt }, ...messages]
          })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return res.status(200).json(data);
        }
        throw new Error('MiniMax failed');
      }
    } catch (error) {
      console.warn(`[CHAT-ROUTER] Provider ${selectedProvider.name} failed:`, (error as Error).message);
    }
  }

  return res.status(500).json({ error: 'Failed to communicate with AI' });
});

export default router;
