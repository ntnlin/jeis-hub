/**
 * Vezta - Content Generator
 * 3 tones × multiple channels, learns from viral content
 */

import { generate3Tones } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { extractJson } from '../../core/jsonParse.js';
import { writeFileSafe } from '../../core/storage.js';

const validator = new DataValidator();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

const VEZTA_CONTEXT = 'Vezta is a prediction market platform on Solana. Focus: sharp scoring, whale activity, volume spikes, trading accuracy.';

export async function generateTweet(topic, channel = 'x') {
  validator.assertProject('vezta');

  const tones = await generate3Tones(topic, VEZTA_CONTEXT);
  const content = {
    project: 'vezta',
    type: 'tweet',
    channel,
    topic,
    tones,
    generatedAt: new Date().toISOString(),
    status: 'draft',
    performance: null
  };

  writeFileSafe(`./files/projects/vezta/${TODAY}/content/tweet-${Date.now()}.md`,
    `# Vezta Tweet - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n`
  );
  return content;
}

export async function generateThread(topic, points = []) {
  const { callClaude } = await import('../../core/claudeAPI.js');
  const { text } = await callClaude({
    system: `Generate a Twitter thread for Vezta (Solana prediction market). ${VEZTA_CONTEXT}\nRules: Never sáo rỗng, chung chung, bịa, shill. Always: real insight, specific, conversational. Format: JSON array of tweet objects with degen/casual/formal versions.`,
    messages: [{ role: 'user', content: `Topic: ${topic}\nKey points: ${JSON.stringify(points)}` }],
    maxTokens: 3000
  });

  const thread = extractJson(text);
  writeFileSafe(`./files/projects/vezta/${TODAY}/content/thread-${Date.now()}.md`,
    `# Vezta Thread - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n${thread.map((t, i) => `**Tweet ${i + 1}:**\n${JSON.stringify(t, null, 2)}`).join('\n\n')}\n`
  );
  return { project: 'vezta', type: 'thread', topic, thread, generatedAt: new Date().toISOString() };
}

export async function generateBlog(topic, outline = '') {
  const { callClaude } = await import('../../core/claudeAPI.js');
  const { text } = await callClaude({
    system: `Write a blog post for Vezta (Solana prediction market). ${VEZTA_CONTEXT}\nRules: data-backed, specific, never generic. SEO-aware. Output markdown.`,
    messages: [{ role: 'user', content: `Topic: ${topic}\nOutline: ${outline}` }],
    maxTokens: 4096
  });

  writeFileSafe(`./files/projects/vezta/${TODAY}/content/blog-${Date.now()}.md`, text);
  return { project: 'vezta', type: 'blog', topic, generatedAt: new Date().toISOString() };
}
