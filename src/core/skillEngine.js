/**
 * Skill engine - loads skill definitions for a task type and tracks usage counters.
 *
 * Skills are defined as JSON files under ./skills and registered in index.json.
 * This engine does not synthesize new skills; it only loads existing ones and
 * records how often each is used.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const INDEX_PATH = './skills/index.json';

export class SkillEngine {
  constructor() {
    this.index = existsSync(INDEX_PATH)
      ? JSON.parse(readFileSync(INDEX_PATH, 'utf8'))
      : { skills: {} };
  }

  loadFor(taskType) {
    const skill = this.index.skills[taskType];
    if (!skill) return null;

    const skillFile = `./skills/${skill.file}`;
    if (!existsSync(skillFile)) return null;

    skill.usageCount = (skill.usageCount || 0) + 1;
    skill.lastUsed = new Date().toISOString();
    this.save();

    return JSON.parse(readFileSync(skillFile, 'utf8'));
  }

  learnFromResult(taskType, result) {
    if (!result?.output) return;

    const skill = this.index.skills[taskType];
    if (!skill) return;

    skill.executions = (skill.executions || 0) + 1;
    this.save();
  }

  updatePerformance(taskType, score) {
    const skill = this.index.skills[taskType];
    if (!skill) return;
    const prev = skill.performanceScore ?? score;
    skill.performanceScore = (prev * 0.8) + (score * 0.2);
    this.save();
  }

  save() {
    writeFileSync(INDEX_PATH, JSON.stringify(this.index, null, 2));
  }
}
