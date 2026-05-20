/**
 * @janerebos - Reply system (persona TBD)
 */

import { writeFileSync } from 'fs';
import { callClaude, generate3Tones } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateReplyOptions(screenshotOCR) {
  notifier.warning('@janerebos persona TBD - replies will use generic Web3 tone until Jei defines persona');

  const { text: contextAnalysis } = await callClaude({
    system: `Analyze this tweet/message. Extract: platform, author, text, tone, key point. Output JSON.`,
    messages: [{ role: 'user', content: screenshotOCR }],
    maxTokens: 512
  });

  const parsed = JSON.parse(contextAnalysis);
  const tones = await generate3Tones(`Reply to: "${parsed.originalText}"`, '@janerebos Web3 account (persona TBD). Never: generic, off-topic, shill, fabricate.');

  const result = { account: 'janerebos', originalContext: parsed, replies: tones, generatedAt: new Date().toISOString() };
  writeFileSync(`./files/accounts/janerebos/${TODAY}/replies.md`,
    `# @janerebos Reply - ${new Date().toISOString()}\n\n**Original:** ${parsed.originalText || screenshotOCR}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n---\n`,
    { flag: 'a' }
  );
  return result;
}
