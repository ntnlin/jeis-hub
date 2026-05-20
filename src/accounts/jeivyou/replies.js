/**
 * @jeivyou - Auto-reply system (screenshot → AI options)
 */

import { writeFileSync } from 'fs';
import { callClaude, generate3Tones } from '../../core/claudeAPI.js';

const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const JEIVYOU_CONTEXT = '@jeivyou is Jei - Web3 degen builder. Direct, insightful, authentic. Never: sáo rỗng, chung chung, bịa, shill, sượng, vô duyên.';

export async function generateReplyOptions(screenshotOCR) {
  const { text: contextAnalysis } = await callClaude({
    system: `Analyze this tweet/message. Extract: platform, author, what they said, tone, key claim or question. Output JSON: { platform, author, originalText, tone, keyPoint, context }.`,
    messages: [{ role: 'user', content: screenshotOCR }],
    maxTokens: 512
  });

  const parsed = JSON.parse(contextAnalysis);
  const prompt = `Reply to: "${parsed.originalText}"\nAuthor: ${parsed.author}\nContext: ${parsed.context}`;
  const tones = await generate3Tones(prompt, JEIVYOU_CONTEXT);

  const result = {
    account: 'jeivyou',
    originalContext: parsed,
    replies: {
      degen: tones.degen,
      casual: tones.casual,
      formal: tones.formal
    },
    generatedAt: new Date().toISOString(),
    status: 'awaiting_jei_selection'
  };

  writeFileSync(`./files/accounts/jeivyou/${TODAY}/replies.md`,
    `# @jeivyou Reply Options - ${new Date().toISOString()}\n\n**Original:** ${parsed.originalText}\n**Author:** ${parsed.author}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n---\n`,
    { flag: 'a' }
  );
  return result;
}

export async function generateSmartReply(conversationHistory, lastMessage) {
  const { text } = await callClaude({
    system: `You generate smart replies for @jeivyou. ${JEIVYOU_CONTEXT} Detect needed tone from context. Generate 3 options (degen/casual/formal). Never: generic, off-topic, fabricate. Output JSON: { degen, casual, formal, detectedTone }.`,
    messages: [
      { role: 'user', content: `Conversation: ${JSON.stringify(conversationHistory)}\nLast message: ${lastMessage}` }
    ],
    maxTokens: 1024
  });
  return JSON.parse(text);
}
