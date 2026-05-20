/**
 * Syzy - Content Generator
 */

import { writeFileSync } from 'fs';
import { generate3Tones } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const SYZY_CONTEXT = 'Syzy is a prediction market on Stellar. Community-driven, referral-powered, XLM/USDC rewards. Focus: beta access, community growth, prediction accuracy, Stellar ecosystem.';

export async function generateTweet(topic, channel = 'x') {
  validator.assertProject('syzy');
  const tones = await generate3Tones(topic, SYZY_CONTEXT);
  const content = { project: 'syzy', type: 'tweet', channel, topic, tones, generatedAt: new Date().toISOString(), status: 'draft' };
  writeFileSync(`./files/projects/syzy/${TODAY}/content/tweet-${Date.now()}.md`,
    `# Syzy Tweet - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n`
  );
  return content;
}

export async function generateThread(topic, points = []) {
  const { callClaude } = await import('../../core/claudeAPI.js');
  const { text } = await callClaude({
    system: `Generate Twitter thread for Syzy (Stellar prediction market). ${SYZY_CONTEXT} Rules: never generic, never fabricate, real insight. JSON array with degen/casual/formal per tweet.`,
    messages: [{ role: 'user', content: `Topic: ${topic}\nPoints: ${JSON.stringify(points)}` }],
    maxTokens: 3000
  });

  const thread = JSON.parse(text);
  writeFileSync(`./files/projects/syzy/${TODAY}/content/thread-${Date.now()}.md`,
    `# Syzy Thread - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n${thread.map((t, i) => `**Tweet ${i + 1}:**\n${JSON.stringify(t, null, 2)}`).join('\n\n')}\n`
  );
  return { project: 'syzy', type: 'thread', topic, thread, generatedAt: new Date().toISOString() };
}
