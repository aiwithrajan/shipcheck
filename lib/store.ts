// Simple localStorage-based store to share check results across pages

import { TraversalResult } from './engine/groqTraversal';
import { NaiveSearchResult } from './engine/naiveSearchStub';
import { AgentRunResult } from './agent/preflightAgent';

const RESULT_KEY = 'shipcheck_result';

export interface StoredResult {
  structured: TraversalResult;
  naive: NaiveSearchResult;
  agent?: AgentRunResult;
  proposal: string;
  timestamp: number;
}

export function saveResult(
  structured: TraversalResult,
  naive: NaiveSearchResult,
  proposal: string,
  agent?: AgentRunResult
) {
  if (typeof window === 'undefined') return;
  const data: StoredResult = { structured, naive, agent, proposal, timestamp: Date.now() };
  localStorage.setItem(RESULT_KEY, JSON.stringify(data));
}

export function loadResult(): StoredResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearResult() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RESULT_KEY);
}
