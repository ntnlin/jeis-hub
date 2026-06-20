/**
 * Claude API wrapper with prompt caching, token tracking, batching
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function callClaude({ system, messages, maxTokens = 2048, model = 'claude-sonnet-4-6' }) {
  // cache_control marks the system block for Anthropic-side prompt caching.
  const systemBlock = [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }];

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemBlock,
    messages
  });

  return {
    text: response.content[0].text,
    usage: response.usage,
    model: response.model,
    stopReason: response.stop_reason
  };
}

export async function callClaudeBatch(requests) {
  return Promise.all(requests.map(r => callClaude(r)));
}

export async function generate3Tones(topic, context = '') {
  const [degen, casual, formal] = await callClaudeBatch([
    {
      system: buildToneSystem('degen'),
      messages: [{ role: 'user', content: `Topic: ${topic}\nContext: ${context}` }],
      maxTokens: 512
    },
    {
      system: buildToneSystem('casual'),
      messages: [{ role: 'user', content: `Topic: ${topic}\nContext: ${context}` }],
      maxTokens: 512
    },
    {
      system: buildToneSystem('formal'),
      messages: [{ role: 'user', content: `Topic: ${topic}\nContext: ${context}` }],
      maxTokens: 512
    }
  ]);

  return { degen: degen.text, casual: casual.text, formal: formal.text };
}

function buildToneSystem(tone) {
  const rules = {
    degen: 'Gen-Z crypto native. Punchy 1-3 sentences. Use: "ngl", "fr fr", "lowkey", "based". Emoji: sparingly. NEVER: shill, generic praise, "excited to", "thrilled to", sáo rỗng, chung chung, bịa, sượng.',
    casual: 'Friendly, direct, like texting a smart friend. 2-4 sentences. Can ask questions. NEVER: generic, off-topic, shill, fabricate.',
    formal: 'Professional, structured, evidence-based. For BD/partnerships/institutional. Clear value prop. No slang, no emoji. NEVER: generic, off-topic, fabricate.'
  };
  return `You generate ${tone} tone content. ${rules[tone]} Always: relevant to topic, real insight, specific.`;
}
