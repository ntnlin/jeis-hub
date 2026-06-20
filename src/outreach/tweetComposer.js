/**
 * Tweet Composer
 * Topic → 3 tone options × format types → schedule or post
 */

import { generate3Tones, callClaude } from '../core/claudeAPI.js';
import { extractJson } from '../core/jsonParse.js';
import { writeFileSafe } from '../core/storage.js';

const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

const FORMATS = ['single', 'thread', 'quote_tweet', 'reply'];

export async function composeTweet(topic, format = 'single', account = 'jeivyou', projectContext = '') {
  const context = `Account: @${account}. ${projectContext} Never: sáo rỗng, chung chung, bịa, shill, sượng. Always: relevant, specific, personality.`;

  let tones;

  if (format === 'thread') {
    const { text } = await callClaude({
      system: `Generate a Twitter thread. ${context} Format: JSON array, each tweet has { degen, casual, formal }. 3-7 tweets.`,
      messages: [{ role: 'user', content: `Topic: ${topic}` }],
      maxTokens: 3000
    });
    tones = { thread: extractJson(text) };
  } else {
    tones = await generate3Tones(topic, context);
  }

  const result = {
    account,
    format,
    topic,
    tones,
    designPrompt: `Visual for: ${topic}. Style: Web3 native, clean, bold. Not generic stock photo.`,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    scheduledFor: null,
    performance: null
  };

  writeFileSafe(`./files/accounts/${account}/${TODAY}/tweets.md`,
    `# Tweet - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n**Format:** ${format}\n\n${format === 'thread' ? JSON.stringify(tones.thread, null, 2) : `**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}`}\n---\n`,
    { flag: 'a' }
  );

  return result;
}

export function scheduleTweet(content, scheduledFor, account = 'jeivyou') {
  return { ...content, scheduledFor, status: 'scheduled', scheduledBy: 'jei', account };
}
