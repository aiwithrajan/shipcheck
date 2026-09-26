/**
 * Mission Control Audio Briefing Script Generator
 * Produces crisp, military/spaceflight-grade verbal briefings formatted for Web Speech API.
 */

import { TraversalResult } from './groqTraversal';

export function generateAudioBriefing(result: {
  verdict: 'DO NOT SHIP YET' | 'SAFE TO SHIP';
  proposedChange: { componentName: string; currentVersion: string; targetVersion: string; isHotfix?: boolean };
  reasons: { severity: string; conclusion: string }[];
  isSimulated?: boolean;
}): string {
  const { verdict, proposedChange, reasons, isSimulated } = result;
  const comp = proposedChange.componentName;
  const target = proposedChange.targetVersion;
  const from = proposedChange.currentVersion;

  if (isSimulated) {
    return `Simulation active. Pre-flight check for ${comp} upgrade from ${from} to ${target}. With cluster Payment SDK upgraded to version 3.1.0, all multi-hop constraints are satisfied. Verdict: SAFE TO SHIP. Green light for production once cluster patch is applied.`;
  }

  if (verdict === 'DO NOT SHIP YET') {
    const blockers = reasons.filter((r) => r.severity === 'BLOCKER');
    const drifts = reasons.filter((r) => r.severity === 'DRIFT');

    let text = `Attention. Pre-flight production check complete. Verdict: DO NOT SHIP YET. `;
    text += `Target change: ${comp} from ${from} to ${target}. `;

    if (blockers.length > 0) {
      text += `Detected critical blocker: ${blockers[0].conclusion} `;
    }

    if (drifts.length > 0) {
      text += `Additionally, architectural drift detected: ${drifts[0].conclusion} `;
    }

    text += `Automated remediation sequence and rollback scripts have been generated. Deployment authorization is currently locked.`;
    return text;
  }

  // Safe to ship
  if (proposedChange.isHotfix) {
    return `Pre-flight check complete. Verdict: SAFE TO SHIP. Emergency security patch recognized. Policy exception applied, staging soak bypass verified. Deployment authorized.`;
  }

  return `Pre-flight check complete. Verdict: SAFE TO SHIP. Target ${comp} upgrade to ${target} cleared all 2-hop graph dependency constraints and database compatibility checks. Zero collisions detected. All systems nominal.`;
}
