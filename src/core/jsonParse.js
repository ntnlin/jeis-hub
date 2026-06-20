/**
 * Parse JSON out of a model response.
 *
 * Models often wrap JSON in ```json fences or add a sentence before/after it,
 * so JSON.parse on the raw text throws. This strips fences and, failing that,
 * tries the first balanced { } or [ ] span.
 */

export function extractJson(text) {
  if (typeof text !== 'string') {
    throw new Error('extractJson: expected a string');
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    // fall through to bracket extraction
  }

  const start = candidate.search(/[[{]/);
  if (start !== -1) {
    const open = candidate[start];
    const close = open === '{' ? '}' : ']';
    const end = candidate.lastIndexOf(close);
    if (end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        // fall through to error
      }
    }
  }

  throw new Error('extractJson: no valid JSON found in model output');
}
