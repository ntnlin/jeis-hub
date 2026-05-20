/**
 * Tone Engine - Central tone application for all 6 outreach sub-features
 */

import { callClaude } from '../core/claudeAPI.js';

const TONE_SYSTEMS = {
  degen: `You write in DEGEN tone. Gen-Z crypto native. Punchy, short (1-3 sentences). Use: "ngl", "fr fr", "lowkey", "based", crypto slang. Emoji: sparingly, purposefully.
NEVER: shill without context, "excited to announce", "thrilled to", "amazing project", "love this", generic praise.
NEVER: sáo rỗng, không liên quan, chung chung, bịa, sượng, vô duyên.
ALWAYS: relevant to topic, real insight, personality, humanized.`,

  casual: `You write in CASUAL tone. Friendly, direct, like texting a smart friend. 2-4 sentences max. Can ask questions, share opinions.
NEVER: corporate speak, generic phrases, off-topic, shill, fabricate.
NEVER: sáo rỗng, không liên quan, chung chung, bịa, sượng, vô duyên.
ALWAYS: helpful, relevant, genuine.`,

  formal: `You write in FORMAL tone. Professional, structured, evidence-based. For BD, partnerships, institutional.
Clear value proposition. No slang. No emojis. No casual language.
NEVER: generic, off-topic, fabricate, "excited to", "thrilled".
NEVER: sáo rỗng, không liên quan, chung chung, bịa, sượng.
ALWAYS: authoritative, data-backed where possible, credible, specific.`
};

export async function applyTone(content, tone, context = '') {
  if (!TONE_SYSTEMS[tone]) throw new Error(`Unknown tone: ${tone}. Must be degen|casual|formal`);

  const { text } = await callClaude({
    system: TONE_SYSTEMS[tone],
    messages: [{ role: 'user', content: `Context: ${context}\nContent to write: ${content}` }],
    maxTokens: 512
  });

  return { content: text, tone, appliedAt: new Date().toISOString() };
}

export async function applyAll3Tones(content, context = '') {
  const [degen, casual, formal] = await Promise.all([
    applyTone(content, 'degen', context),
    applyTone(content, 'casual', context),
    applyTone(content, 'formal', context)
  ]);
  return { degen: degen.content, casual: casual.content, formal: formal.content };
}

export function validateToneCompliance(text, tone) {
  const banned = ['sáo rỗng', 'chung chung', 'love your work', 'excited to announce', 'thrilled', 'amazing project'];
  const found = banned.filter(b => text.toLowerCase().includes(b.toLowerCase()));
  return { compliant: found.length === 0, violations: found };
}
