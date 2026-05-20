/**
 * @janerebos - Tweet automation (secondary account, persona TBD)
 */

import { writeFileSync } from 'fs';
import { generate3Tones, callClaude } from '../../core/claudeAPI.js';
import { Notifier } from '../../core/notifier.js';

const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

function getPersonaContext() {
  try {
    const { readFileSync } = require('fs');
    const config = JSON.parse(readFileSync('./config/accounts/janerebos.config.json', 'utf8'));
    if (config.persona === 'TBD - Jei will define') {
      notifier.warning('@janerebos persona not yet defined. Update config/accounts/janerebos.config.json');
      return '@janerebos is a Web3 account (persona TBD by Jei). Never: sáo rỗng, chung chung, bịa, shill.';
    }
    return config.persona;
  } catch { return '@janerebos (persona TBD)'; }
}

export async function composeTweet(topic, format = 'single') {
  const context = getPersonaContext();
  const tones = await generate3Tones(topic, context);
  const content = { account: 'janerebos', type: format, topic, tones, generatedAt: new Date().toISOString(), status: 'draft', approvalRequired: true };

  writeFileSync(`./files/accounts/janerebos/${TODAY}/tweets.md`,
    `# @janerebos Tweets - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n`,
    { flag: 'a' }
  );
  return content;
}

export function logPerformance(tweetId, metrics) {
  return { tweetId, ...metrics, account: 'janerebos', loggedAt: new Date().toISOString() };
}
