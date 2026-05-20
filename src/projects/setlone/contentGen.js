/**
 * Setlone - Content Generator (TBD)
 */

import { writeFileSync } from 'fs';
import { generate3Tones } from '../../core/claudeAPI.js';
import { DataValidator } from '../../core/dataValidator.js';
import { Notifier } from '../../core/notifier.js';

const validator = new DataValidator();
const notifier = new Notifier();
const TODAY = new Date().toISOString().split('T')[0].replace(/-/g, '/');

export async function generateTweet(topic, channel = 'x', projectContext = 'Setlone (project TBD)') {
  validator.assertProject('setlone');
  notifier.warning('Setlone context TBD - update projectContext parameter when project is defined');

  const tones = await generate3Tones(topic, projectContext);
  const content = { project: 'setlone', isTBD: true, type: 'tweet', channel, topic, tones, generatedAt: new Date().toISOString(), status: 'draft' };
  writeFileSync(`./files/projects/setlone/${TODAY}/content/tweet-${Date.now()}.md`,
    `# Setlone Tweet - ${new Date().toISOString()}\n\n**Topic:** ${topic}\n\n**DEGEN:**\n${tones.degen}\n\n**CASUAL:**\n${tones.casual}\n\n**FORMAL:**\n${tones.formal}\n`
  );
  return content;
}
