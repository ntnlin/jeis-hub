/**
 * @jeivyou - Tweet automation (main Web3 degen builder account)
 */

import { generate3Tones, callClaude } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeFileSafe, writeJsonSafe } from '../../core/storage.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');
const JEIVYOU_CONTEXT = '@jeivyou is Jei - Web3 degen builder, operator of Vezta/Tasmil/Syzy/Setlone. Authentic Web3 native, blunt, insightful. Never: corporate speak, generic takes, fake enthusiasm.';

export async function composeTweet(topic, format = 'single') {
  const tones = await generate3Tones(topic, JEIVYOU_CONTEXT);
  const content = {
    account: 'jeivyou',
    type: format,
    topic,
    tones,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    approvalRequired: true
  };

  writeFileSafe(`./files/accounts/jeivyou/${TODAY}/tweets.md`,
    `# @jeivyou Tweets - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n**Format:** ${format}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n`,
    { flag: 'a' }
  );
  return content;
}

export async function composeThread(topic, keyPoints = []) {
  const { text } = await callClaude({
    system: `Generate a Twitter thread for @jeivyou (Jei). ${JEIVYOU_CONTEXT} Format: JSON array, each tweet has degen/casual/formal versions. Never: sáo rỗng, generic, shill, fabricate. Must add real value.`,
    messages: [{ role: 'user', content: `Topic: ${topic}\nKey points: ${JSON.stringify(keyPoints)}` }],
    maxTokens: 3000
  });

  return { account: 'jeivyou', type: 'thread', topic, thread: extractJson(text), generatedAt: new Date().toISOString(), status: 'draft' };
}

export function logPerformance(tweetId, metrics) {
  const log = { tweetId, ...metrics, loggedAt: new Date().toISOString() };
  writeJsonSafe(`./files/accounts/jeivyou/${TODAY}/performance.json`, log);
  return log;
}
