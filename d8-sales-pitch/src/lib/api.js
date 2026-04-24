async function callClaude(system, user, maxTokens = 1000) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error.type || JSON.stringify(data.error));
  const raw   = data.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim();
  try { return JSON.parse(clean); }
  catch {
    const m = clean.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('JSON parse failed');
  }
}

export async function callClaudeText(system, messages, maxTokens = 2048) {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error.type || JSON.stringify(data.error));
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('');
}

export async function claudeJSON(system, user, { maxTokens = 1000, retries = 1 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callClaude(system, user, maxTokens);
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}
