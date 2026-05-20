/**
 * Skill engine - auto-loads, updates, creates skills from patterns
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

    skill.usageCount = (skill.usageCount || 0) + 1;
    skill.lastUsed = new Date().toISOString();
    this.save();

    const skillFile = `./skills/${skill.file}`;
    if (existsSync(skillFile)) {
      return JSON.parse(readFileSync(skillFile, 'utf8'));
    }
    return skill;
  }

  async learnFromResult(taskType, result) {
    if (!result?.output) return;

    const skill = this.index.skills[taskType];
    if (skill) {
      skill.executions = (skill.executions || 0) + 1;
      skill.version = (skill.version || 1);
      this.save();
    } else {
      this.autoCreate(taskType);
    }
  }

  autoCreate(taskType) {
    if (this.index.skills[taskType]) return;

    const skillId = `skill_${taskType}_${Date.now()}`;
    this.index.skills[taskType] = {
      name: taskType,
      file: `${taskType}.json`,
      triggers: [taskType],
      version: 1,
      usageCount: 1,
      executions: 0,
      performanceScore: null,
      autoCreated: true,
      createdAt: new Date().toISOString()
    };

    this.save();
  }

  updatePerformance(taskType, score) {
    const skill = this.index.skills[taskType];
    if (!skill) return;
    const prev = skill.performanceScore || score;
    skill.performanceScore = (prev * 0.8) + (score * 0.2);
    this.save();
  }

  save() {
    writeFileSync(INDEX_PATH, JSON.stringify(this.index, null, 2));
  }
}
