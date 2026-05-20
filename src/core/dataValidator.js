/**
 * Data integrity enforcer - validates before any store or analysis
 */

import { Notifier } from './notifier.js';

const notifier = new Notifier();

export class DataValidator {
  validate(data) {
    if (!data) return { ok: false, reason: 'empty data' };

    if (this.hasFabricationSignals(data)) {
      notifier.alert('CRITICAL', 'Fabrication signal detected - blocking store');
      return { ok: false, reason: 'fabrication_detected' };
    }

    const warnings = [];

    if (!data.source && !data._allowNoSource) {
      warnings.push('missing_source');
    }
    if (!data.timestamp && !data.lastUpdated && !data._allowNoTimestamp) {
      warnings.push('missing_timestamp');
    }
    if (data.confidence !== undefined && data.confidence < 40) {
      warnings.push(`low_confidence: ${data.confidence}`);
    }

    if (warnings.length > 0) {
      notifier.alert('WARNING', `Data quality issues: ${warnings.join(', ')}`);
    }

    return { ok: true, warnings };
  }

  hasFabricationSignals(data) {
    const str = JSON.stringify(data).toLowerCase();
    const fabricationPhrases = [
      'example.com', 'placeholder', 'lorem ipsum',
      'test data', 'fake user', 'mock data'
    ];
    return fabricationPhrases.some(p => str.includes(p));
  }

  stamp(data, source, confidence = 80) {
    return {
      ...data,
      source,
      timestamp: new Date().toISOString(),
      confidence
    };
  }

  assertProject(project) {
    const valid = ['vezta', 'tasmil', 'syzy', 'setlone'];
    if (!valid.includes(project)) {
      throw new Error(`Unknown project: ${project}. Must be one of: ${valid.join(', ')}`);
    }
    return true;
  }

  checkTasmilRWA(project, content) {
    if (project !== 'tasmil') return { flagged: false };
    const rwaTerms = ['RWA', 'real-world asset', 'real world asset', 'tokenization of real', 'asset-backed'];
    const found = rwaTerms.filter(t => content.toLowerCase().includes(t.toLowerCase()));
    if (found.length > 0) {
      notifier.alert('CRITICAL', `TASMIL RWA VIOLATION: found "${found.join(', ')}" - DeFAI ONLY, NOT RWA`);
      return { flagged: true, terms: found };
    }
    return { flagged: false };
  }
}
