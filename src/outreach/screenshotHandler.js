/**
 * Section 6A - Screenshot/Comment Handler
 * Jei uploads screenshot → OCR → detect context → 3 reply options
 */

import { writeFileSync } from 'fs';
import { callClaude, generate3Tones } from '../core/claudeAPI.js';

const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function processScreenshot(imagePath, ocrText = null) {
  let textContent = ocrText;

  if (!textContent && imagePath) {
    const { text } = await callClaude({
      system: `You are an OCR engine. Extract ALL text from this screenshot. Detect: platform (X/Discord/Telegram), author handle, what they said, conversation context. Output JSON: { platform, author, text, context, tone }.`,
      messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: imagePath } }, { type: 'text', text: 'Extract and analyze this screenshot' }] }],
      maxTokens: 1024
    });
    textContent = text;
  }

  const parsed = typeof textContent === 'string' && textContent.startsWith('{')
    ? JSON.parse(textContent)
    : { platform: 'unknown', author: 'unknown', text: textContent, context: '', tone: 'neutral' };

  const replyPrompt = `Reply to: "${parsed.text}" on ${parsed.platform}. Author: ${parsed.author}. Context: ${parsed.context}`;
  const tones = await generate3Tones(replyPrompt, 'Jei - Web3 builder. Never: sáo rỗng, chung chung, bịa, shill. Always: relevant, specific, real insight.');

  const result = {
    source: { platform: parsed.platform, author: parsed.author, originalText: parsed.text, context: parsed.context },
    replies: { degen: tones.degen, casual: tones.casual, formal: tones.formal },
    generatedAt: new Date().toISOString(),
    status: 'awaiting_jei_selection'
  };

  writeFileSync(`./files/outreach/comments/${TODAY}/replies.json`, JSON.stringify(result, null, 2));

  console.log('\n📸 Screenshot processed. Choose tone:');
  console.log('DEGEN:', tones.degen);
  console.log('CASUAL:', tones.casual);
  console.log('FORMAL:', tones.formal);

  return result;
}
