/**
 * Tasmil - Content Generator | DeFAI ONLY - NOT RWA
 */

import { generate3Tones } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeFileSafe } from '../../core/storage.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const TASMIL_CONTEXT = 'Tasmil is a DeFAI protocol on Stellar - AI-powered autonomous finance. NEVER RWA. Focus: AI agents, autonomous financial decisions, Stellar ecosystem, DeFAI innovation.';

export async function generateTweet(topic, channel = 'x') {
  validator.assertProject('tasmil');
  validator.checkTasmilRWA('tasmil', topic);

  const tones = await generate3Tones(topic, TASMIL_CONTEXT);

  Object.values(tones).forEach(t => validator.checkTasmilRWA('tasmil', t));

  const content = { project: 'tasmil', type: 'tweet', defaiOnly: true, channel, topic, tones, generatedAt: new Date().toISOString(), status: 'draft' };
  writeFileSafe(`./files/projects/tasmil/${TODAY}/content/tweet-${Date.now()}.md`,
    `# Tasmil Tweet - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n`
  );
  return content;
}

export async function generateThread(topic, points = []) {
  validator.checkTasmilRWA('tasmil', topic);
  const { callClaude } = await import('../../core/claudeAPI.js');

  const { text } = await callClaude({
    system: `Generate a Twitter thread for Tasmil (DeFAI on Stellar). ${TASMIL_CONTEXT}\nRules: Never RWA, never sáo rỗng, never generic, never fabricate. Real insight only. Format: JSON array with degen/casual/formal per tweet.`,
    messages: [{ role: 'user', content: `Topic: ${topic}\nPoints: ${JSON.stringify(points)}` }],
    maxTokens: 3000
  });

  const thread = extractJson(text);
  validator.checkTasmilRWA('tasmil', JSON.stringify(thread));
  writeFileSafe(`./files/projects/tasmil/${TODAY}/content/thread-${Date.now()}.md`,
    `# Tasmil Thread - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n${thread.map((t, i) => `**Tweet ${i + 1}:**\n${JSON.stringify(t, null, 2)}`).join('\n\n')}\n`
  );
  return { project: 'tasmil', type: 'thread', topic, thread, generatedAt: new Date().toISOString() };
}
