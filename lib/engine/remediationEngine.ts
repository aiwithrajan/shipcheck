/**
 * Remediation Plan & Migration Script Engine
 * Automatically generates executable step-by-step remediation plans,
 * CLI rollout commands, and rollback procedures when pre-flight blockers or drift are detected.
 */

import { EvidenceReason } from './groqTraversal';

export interface RemediationStep {
  stepNumber: number;
  phase: 'PREREQUISITE' | 'SCHEMA_MIGRATION' | 'DEPLOYMENT' | 'VERIFICATION';
  title: string;
  description: string;
  command?: string;
  automatedCheck: string;
  estimatedMinutes: number;
}

export interface RemediationPlan {
  status: 'REMEDIATION_REQUIRED' | 'CLEAR_FOR_DEPLOYMENT';
  summary: string;
  estimatedTotalMinutes: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  steps: RemediationStep[];
  cliScript: string;
  rollbackScript: string;
  requiredApprovals: string[];
}

export function generateRemediationPlan(
  componentName: string,
  targetVersion: string,
  verdict: 'DO NOT SHIP YET' | 'SAFE TO SHIP',
  reasons: EvidenceReason[],
  isSimulated = false
): RemediationPlan {
  if (verdict === 'SAFE TO SHIP') {
    return {
      status: 'CLEAR_FOR_DEPLOYMENT',
      summary: isSimulated
        ? `Remediation verified via simulation. Once prerequisite cluster patch is applied, ${componentName} ${targetVersion} can be safely rolled out.`
        : `All multi-hop constraints satisfied. Zero prerequisite blocking issues detected for ${componentName} ${targetVersion}.`,
      estimatedTotalMinutes: 10,
      riskLevel: 'LOW',
      steps: [
        {
          stepNumber: 1,
          phase: 'DEPLOYMENT',
          title: 'Canary Rollout (10% Traffic)',
          description: `Deploy ${componentName} ${targetVersion} to 10% of cluster pods with automated canary metric monitoring.`,
          command: `kubectl set image deployment/${componentName.toLowerCase().replace(/\s+/g, '-')} ${componentName.toLowerCase().replace(/\s+/g, '-')}=registry.internal/${componentName.toLowerCase().replace(/\s+/g, '-')}:${targetVersion} -n prod --record`,
          automatedCheck: 'curl -fsSL http://localhost:8080/healthz | jq -e .healthy',
          estimatedMinutes: 5,
        },
        {
          stepNumber: 2,
          phase: 'VERIFICATION',
          title: 'Promote to 100% Traffic',
          description: 'Verify 0% error rate on synthetic payment probes, then promote to full production cluster.',
          command: `kubectl rollout status deployment/${componentName.toLowerCase().replace(/\s+/g, '-')} -n prod --timeout=300s`,
          automatedCheck: 'datadog-cli monitor check --tag service:payment',
          estimatedMinutes: 5,
        },
      ],
      cliScript: [
        `# === SAFE DEPLOYMENT SEQUENCE: ${componentName} ${targetVersion} ===`,
        `kubectl set image deployment/${componentName.toLowerCase().replace(/\s+/g, '-')} ${componentName.toLowerCase().replace(/\s+/g, '-')}=registry.internal/${componentName.toLowerCase().replace(/\s+/g, '-')}:${targetVersion} -n prod`,
        `kubectl rollout status deployment/${componentName.toLowerCase().replace(/\s+/g, '-')} -n prod --timeout=300s`,
        `echo "✓ Deployment succeeded with 0 detected graph collisions."`,
      ].join('\n'),
      rollbackScript: [
        `# === EMERGENCY ROLLBACK ===`,
        `kubectl rollout undo deployment/${componentName.toLowerCase().replace(/\s+/g, '-')} -n prod`,
        `echo "✓ Rollback executed."`,
      ].join('\n'),
      requiredApprovals: ['Standard Change Authorizer (DevOps Lead)'],
    };
  }

  // Handle DO NOT SHIP YET (Blocking Scenario)
  const steps: RemediationStep[] = [];
  let stepIdx = 1;

  const hasSdkBlocker = reasons.some((r) => r.severity === 'BLOCKER' && r.evidence.includes('SDK'));
  const hasWebhookDrift = reasons.some((r) => r.severity === 'DRIFT' && r.evidence.includes('webhook'));

  if (hasSdkBlocker) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'PREREQUISITE',
      title: 'Upgrade Cluster Payment SDK to v3.1.0',
      description:
        'Target Payment Service v4 requires Payment SDK >= v3.0.0 for token HMAC verification. Deploy SDK v3.1.0 across all production worker pods first.',
      command:
        'kubectl set image deployment/payment-sdk payment-sdk=registry.internal/payment-sdk:3.1.0 -n prod && kubectl rollout status deployment/payment-sdk -n prod --timeout=180s',
      automatedCheck:
        'python3 -c "import paymentsdk; assert paymentsdk.__version__ >= \'3.0.0\'"',
      estimatedMinutes: 15,
    });
  }

  if (hasWebhookDrift) {
    steps.push({
      stepNumber: stepIdx++,
      phase: 'SCHEMA_MIGRATION',
      title: 'Deploy Dual-Format Webhook Adapter (XML + JSON v2)',
      description:
        'Official v4 release note specifies JSON v2 with SHA256 signatures, contradicting legacy XML listeners. Deploy backward-compatible dual parser to downstream event consumers.',
      command:
        './scripts/deploy-webhook-adapter.sh --consumer-group payment-events --enable-json-v2 --fallback-xml',
      automatedCheck:
        'curl -s -X POST http://event-bus.prod.internal/verify-schema -d \'{"format":"json_v2"}\'',
      estimatedMinutes: 20,
    });
  }

  steps.push({
    stepNumber: stepIdx++,
    phase: 'DEPLOYMENT',
    title: `Deploy ${componentName} ${targetVersion}`,
    description: `Execute progressive rolling update of ${componentName} to ${targetVersion} only after prerequisites 1 & 2 pass verification.`,
    command: `kubectl set image deployment/${componentName.toLowerCase().replace(/\s+/g, '-')} ${componentName.toLowerCase().replace(/\s+/g, '-')}=registry.internal/${componentName.toLowerCase().replace(/\s+/g, '-')}:${targetVersion} -n prod`,
    automatedCheck: `kubectl get pods -l app=${componentName.toLowerCase().replace(/\s+/g, '-')} -n prod | grep -v Terminating`,
    estimatedMinutes: 10,
  });

  steps.push({
    stepNumber: stepIdx++,
    phase: 'VERIFICATION',
    title: 'Run Automated Post-Deployment Sanity Check',
    description:
      'Trigger synthetic end-to-end payment transaction probe and verify audit trail in Sanity Content Lake.',
    command:
      './scripts/synthetic-transaction-test.sh --env prod --service payment --expect-version 4.0.0',
    automatedCheck: 'curl -fsSL https://api.internal/health/payment/deep-audit | grep "all_dependencies_valid"',
    estimatedMinutes: 5,
  });

  const cliScript = [
    `#!/usr/bin/env bash`,
    `set -euo pipefail`,
    `echo "🚀 Starting Automated Remediation for ${componentName} ${targetVersion}..."`,
    ``,
    `# Step 1: Upstream SDK Prerequisite`,
    `echo "[1/4] Upgrading Payment SDK to v3.1.0 in cluster..."`,
    `kubectl set image deployment/payment-sdk payment-sdk=registry.internal/payment-sdk:3.1.0 -n prod`,
    `kubectl rollout status deployment/payment-sdk -n prod --timeout=180s`,
    ``,
    `# Step 2: Webhook Dual-Parser Compatibility`,
    `echo "[2/4] Deploying Webhook JSON v2 Schema Adapter..."`,
    `./scripts/deploy-webhook-adapter.sh --consumer-group payment-events --enable-json-v2`,
    ``,
    `# Step 3: Service Rollout`,
    `echo "[3/4] Promoting ${componentName} to ${targetVersion}..."`,
    `kubectl set image deployment/payment-service payment-service=registry.internal/payment-service:4.0.0 -n prod`,
    `kubectl rollout status deployment/payment-service -n prod --timeout=300s`,
    ``,
    `# Step 4: Verification Probe`,
    `echo "[4/4] Verifying synthetic health probe..."`,
    `./scripts/synthetic-transaction-test.sh --env prod --expect-version 4.0.0`,
    `echo "✓ Remediation and production rollout successfully completed!"`,
  ].join('\n');

  const rollbackScript = [
    `#!/usr/bin/env bash`,
    `# === EMERGENCY ROLLBACK PROCEDURE ===`,
    `echo "⚠️ Initiating emergency rollback of ${componentName}..."`,
    `kubectl rollout undo deployment/payment-service -n prod`,
    `kubectl rollout status deployment/payment-service -n prod --timeout=120s`,
    `echo "✓ Payment Service reverted to prior stable version."`,
  ].join('\n');

  return {
    status: 'REMEDIATION_REQUIRED',
    summary: `Pre-flight blockers detected. 3-phase remediation required before deploying ${componentName} ${targetVersion} to prevent high-severity outages.`,
    estimatedTotalMinutes: 50,
    riskLevel: 'HIGH',
    steps,
    cliScript,
    rollbackScript,
    requiredApprovals: [
      'Platform Architecture Team (SDK v3 sign-off)',
      'Event Infrastructure Team (Webhook JSON v2 schema transition)',
      'Security Incident Lead (HMAC token signature validation)',
    ],
  };
}
