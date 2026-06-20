/**
 * Smart Reply Generator
 * Context-aware, tone-detected, conversation-coherent
 */

import { callClaude } from '../core/claudeAPI.js';
import { extractJson } from '../core/jsonParse.js';

const TONE_RULES = {
  degen: 'Gen-Z crypto native. Punchy 1-3 sentences. "ngl", "fr fr", "lowkey", "based". NEVER: shill, generic praise, "excited to", "thrilled to", sáo rỗng.',
  casual: 'Friendly, direct, like texting smart friend. 2-4 sentences. Can ask questions. NEVER: generic, off-topic, shill.',
  formal: 'Professional, structured, evidence-based. Clear value prop. No slang. NEVER: generic, off-topic, fabricate.'
};

export async function generateSmartReply(conversationHistory, lastMessage, forceTone = null) {
  const { text: toneDetection } = await callClaude({
    system: `Analyze this conversation and detect the most appropriate tone. Options: degen|casual|formal. Base on: context, relationship, platform, formality of original message. Output JSON: { detectedTone, reasoning }.`,
    messages: [{ role: 'user', content: `History: ${JSON.stringify(conversationHistory)}\nLast: ${lastMessage}` }],
    maxTokens: 256
  });

  const { detectedTone } = extractJson(toneDetection);
  const tone = forceTone || detectedTone;
  const rules = TONE_RULES[tone] || TONE_RULES.casual;

  const { text } = await callClaude({
    system: `Generate a reply in ${tone} tone. ${rules} Rules: relevant to conversation topic, add real insight if possible, preserve conversation context, never: generic, off-topic, shill, fabricate, sượng hay vô duyên.`,
    messages: [
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: `Reply to: ${lastMessage}` }
    ],
    maxTokens: 512
  });

  return {
    reply: text,
    tone,
    detectedTone,
    generatedAt: new Date().toISOString(),
    status: 'pending_jei_approval'
  };
}

export async function generateMultiTone(lastMessage, conversationHistory = []) {
  const [degen, casual, formal] = await Promise.all([
    generateSmartReply(conversationHistory, lastMessage, 'degen'),
    generateSmartReply(conversationHistory, lastMessage, 'casual'),
    generateSmartReply(conversationHistory, lastMessage, 'formal')
  ]);
  return { degen: degen.reply, casual: casual.reply, formal: formal.reply };
}
