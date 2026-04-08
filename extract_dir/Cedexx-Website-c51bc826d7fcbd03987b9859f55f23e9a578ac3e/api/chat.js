export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'en' } = req.body;
  const apiKey = process.env.KIMI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'KIMI_API_KEY not configured' });
  }

  const langInstruction = 
    language === 'es' ? "Responde en español profesional (Latinoamérica). " :
    language === 'ht' ? "Reponn an kreyòl ayisyen. " : "Respond in English. ";

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: `${langInstruction} You are the Cedexx Healthcare Smart Assistant. You help families with 24/7 physician access, mental wellness, and prescriptions. Pricing starts at $14.99/mo for individuals and $27.99/mo for families of 4. We are a digital-first platform. Contact us at info@cedexx.net for more info. Do not provide medical diagnoses. For emergencies, always tell users to call 911.`
          },
          ...messages
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with Kimi AI' });
  }
}
