interface Env {
  DEEPSEEK_API_KEY?: string;
  ENVIRONMENT?: string;
  DB?: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'Ankitti Cloudflare Edge Worker API',
          time: Date.now(),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // AI deck generation endpoint
    if (url.pathname === '/api/ai/generate-deck' && request.method === 'POST') {
      try {
        const body: any = await request.json().catch(() => ({}));
        const { topic, cardCount = 8, notes = '', style = 'mixed', apiKey: clientKey } = body;

        if (!topic || !String(topic).trim()) {
          return new Response(
            JSON.stringify({ error: 'Please provide a topic or prompt for AI deck generation.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const apiKey = (clientKey || env.DEEPSEEK_API_KEY || '').trim();

        if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
          return new Response(
            JSON.stringify({
              error: 'AI_API_KEY_MISSING',
              message: 'AI Service API Key is missing. Please add DEEPSEEK_API_KEY to your Cloudflare environment variables or Settings.'
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const systemPrompt = `You are Ankitti AI, an expert pedagogist and spaced repetition flashcard architect.
Your task is to generate high-yield, highly memorable flashcards on the requested topic.
Guidelines:
1. Generate between ${Math.min(20, Math.max(3, cardCount))} cards.
2. For cards, use either 'basic' (Q&A) or 'cloze' (e.g. {{c1::hidden answer}}).
3. Always include a concise, high-yield 'takeaway' (pearl of wisdom) and an intuitive 'mnemonic' (memory hook).
4. Assign 2-3 relevant tags.
5. Provide a cute deck title, a 1-sentence description, a fitting emoji icon, and a pastel hex color (e.g. #ff4d88, #8b5cf6, #06b6d4, #10b981, #f59e0b).
6. Output ONLY valid JSON matching this schema:
{
  "deckName": "string",
  "description": "string",
  "icon": "emoji",
  "color": "#hex",
  "cards": [
    {
      "type": "basic" | "cloze",
      "front": "string",
      "back": "string",
      "tags": ["string"],
      "takeaway": "string",
      "mnemonic": "string"
    }
  ]
}`;

        const userPrompt = `Topic: "${String(topic).trim()}"
${notes && String(notes).trim() ? `Additional Source Notes/Text:\n${String(notes).trim()}\n` : ''}
Card Style Preference: ${style}
Number of Cards: ${cardCount}
Remember: return ONLY the JSON object, with no markdown code blocks and no commentary.`;

        const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          })
        });

        if (!aiRes.ok) {
          const errText = await aiRes.text();
          return new Response(
            JSON.stringify({ error: `AI Service returned status ${aiRes.status}: ${errText}` }),
            { status: aiRes.status, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const data: any = await aiRes.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          return new Response(
            JSON.stringify({ error: 'AI service returned empty content.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const cleanJson = content.replace(/^```json/m, '').replace(/^```/m, '').trim();
        const parsed = JSON.parse(cleanJson);

        return new Response(
          JSON.stringify(parsed),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: err.message || 'AI Generation failed on Cloudflare Worker.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
