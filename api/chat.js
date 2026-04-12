export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'en', provider = 'gemini' } = req.body;
  
  const KIMI_KEY = process.env.KIMI_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  const langInstruction = 
    language === 'es' ? "Responde en español profesional (Latinoamérica). " :
    language === 'ht' ? "Reponn an kreyòl ayisyen. " : "Respond in English. ";

  const systemPrompt = `${langInstruction} You are Cedex, a warm and professional AI for Cedexx — a technology platform connecting families to independent telemedicine providers. No insurance needed. Pricing: $14.99/mo individual, $27.99/mo family. Contact: info@cedexx.net. No medical diagnoses. For emergencies, call 911.`;

  try {
    const useKimi = provider === 'kimi' || req.body.model === 'moonshot-v1-8k' || (!GEMINI_KEY && KIMI_KEY);

    if (useKimi && KIMI_KEY) {
      // Kimi (Moonshot) Implementation - Optimized for speed
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_KEY}`
        },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      });

      const data = await response.json();
      
      // Vapi expects a specific structure if not using their standard OpenAI integration
      // But typically it follows the OpenAI choices structure which Kimi already provides.
      return res.status(200).json(data);
    } else if (GEMINI_KEY) {
      // Google Gemini Implementation
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Insert system prompt
      if (geminiMessages.length === 0 || geminiMessages[0].role !== 'user') {
        geminiMessages.unshift({ role: 'user', parts: [{ text: systemPrompt }] });
      } else {
        geminiMessages[0].parts[0].text = systemPrompt + "\n\n" + geminiMessages[0].parts[0].text;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I'm having trouble connecting to my brain.";
      
      return res.status(200).json({
        choices: [{ message: { content: reply } }]
      });
    } else {
      return res.status(500).json({ error: 'No AI provider configured' });
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
}
