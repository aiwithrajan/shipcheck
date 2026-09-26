export interface ComponentDoc {
  _id: string;
  _type: 'component';
  name: string;
  slug: { current: string };
  currentVersion: string;
  serviceOwner: string;
  requiredBy?: string[];
  dependencies?: string[];
}

export interface VersionConstraintDoc {
  _id: string;
  _type: 'versionConstraint';
  componentId: string; // ref to component
  version: string; // target version
  requiresComponentId: string; // ref to required component
  requiresVersionRange: string;
  notes: string;
}

export interface KnowledgeEntryDoc {
  _id: string;
  _type: 'knowledgeEntry';
  title: string;
  body: string;
  sourceType:
    | 'release-notes'
    | 'migration-guide'
    | 'architecture-doc'
    | 'dependency-spec'
    | 'runbook'
    | 'incident-report'
    | 'policy'
    | 'compatibility-matrix';
  effectiveDate: string;
  lastVerified: string;
  authorityLevel: number;
  appliesToComponentIds: string[];
  dependsOnIds?: string[];
  supersedesId?: string;
  contradictsIds?: string[];
  isExceptionOfId?: string;
}

export const SEED_COMPONENTS: ComponentDoc[] = [
  {
    _id: 'comp-payment-service',
    _type: 'component',
    name: 'Payment Service',
    slug: { current: 'payment-service' },
    currentVersion: 'v2',
    serviceOwner: 'Team Payments',
    dependencies: ['comp-payment-sdk', 'comp-postgres'],
  },
  {
    _id: 'comp-payment-sdk',
    _type: 'component',
    name: 'Payment SDK',
    slug: { current: 'payment-sdk' },
    currentVersion: 'v2',
    serviceOwner: 'Platform Infrastructure',
    requiredBy: ['comp-payment-service'],
  },
  {
    _id: 'comp-postgres',
    _type: 'component',
    name: 'PostgreSQL Database',
    slug: { current: 'postgres' },
    currentVersion: 'v15',
    serviceOwner: 'Data Platform Team',
    requiredBy: ['comp-payment-service'],
  },
  {
    _id: 'comp-notification-service',
    _type: 'component',
    name: 'Notification Service',
    slug: { current: 'notification-service' },
    currentVersion: 'v1',
    serviceOwner: 'Comms Team',
  },
];

export const SEED_CONSTRAINTS: VersionConstraintDoc[] = [
  {
    _id: 'vc-payment-v4-sdk',
    _type: 'versionConstraint',
    componentId: 'comp-payment-service',
    version: 'v4',
    requiresComponentId: 'comp-payment-sdk',
    requiresVersionRange: '>= v3.0.0',
    notes: 'Payment Service v4 introduces connection multiplexing and token HMAC verification that strictly requires Payment SDK v3.',
  },
  {
    _id: 'vc-payment-v4-pg',
    _type: 'versionConstraint',
    componentId: 'comp-payment-service',
    version: 'v4',
    requiresComponentId: 'comp-postgres',
    requiresVersionRange: '>= v15.0',
    notes: 'Certified for PostgreSQL 15 and 16 with JSONB partition support.',
  },
  {
    _id: 'vc-payment-v3-sdk',
    _type: 'versionConstraint',
    componentId: 'comp-payment-service',
    version: 'v3',
    requiresComponentId: 'comp-payment-sdk',
    requiresVersionRange: '>= v2.0.0',
    notes: 'Payment Service v3 maintains backward compatibility with Payment SDK v2.',
  },
  {
    _id: 'vc-payment-v3-pg',
    _type: 'versionConstraint',
    componentId: 'comp-payment-service',
    version: 'v3',
    requiresComponentId: 'comp-postgres',
    requiresVersionRange: '>= v14.0',
    notes: 'Compatible with PostgreSQL 14 and 15.',
  },
  {
    _id: 'vc-notification-v2-sdk',
    _type: 'versionConstraint',
    componentId: 'comp-notification-service',
    version: 'v2',
    requiresComponentId: 'comp-postgres',
    requiresVersionRange: '>= v14.0',
    notes: 'Safe incremental upgrade with no upstream SDK blockers.',
  },
];

export const SEED_KNOWLEDGE: KnowledgeEntryDoc[] = [
  {
    _id: 'ke-payment-v4-release',
    _type: 'knowledgeEntry',
    title: 'Payment Service v4.0.0 Official Release Notes',
    body: 'Payment Service v4.0.0 includes a redesigned webhook engine. Webhook callbacks now transmit payloads in JSON v2 with SHA256 signatures instead of the legacy XML format. BREAKING: This release strictly depends on Payment SDK v3.0.0 or higher. Running against Payment SDK v2 will cause connection handshake rejections.',
    sourceType: 'release-notes',
    effectiveDate: '2026-08-10',
    lastVerified: '2026-09-20',
    authorityLevel: 10,
    appliesToComponentIds: ['comp-payment-service'],
    dependsOnIds: ['ke-sdk-v3-spec'],
    contradictsIds: ['ke-arch-payment-stale'],
  },
  {
    _id: 'ke-payment-v3-release',
    _type: 'knowledgeEntry',
    title: 'Payment Service v3.0.0 Official Release Notes',
    body: 'Payment Service v3.0.0 adds multi-currency support. Fully backward-compatible with Payment SDK v2.0 and PostgreSQL 15. Safe drop-in upgrade from v2.',
    sourceType: 'release-notes',
    effectiveDate: '2025-11-15',
    lastVerified: '2026-09-01',
    authorityLevel: 10,
    appliesToComponentIds: ['comp-payment-service'],
    dependsOnIds: ['ke-sdk-v2-spec'],
  },
  {
    _id: 'ke-migration-guide-v2-v4',
    _type: 'knowledgeEntry',
    title: 'Payment Service v2 -> v4 Step-by-Step Migration Guide',
    body: 'PREREQUISITE 1: Platform Infra team MUST roll out Payment SDK v3 to all production ingress gateways before deploying Payment Service v4. PREREQUISITE 2: All downstream event consumers must update their parsers for the new JSON v2 webhook schema. Running v4 with SDK v2 in prod WILL halt transaction processing.',
    sourceType: 'migration-guide',
    effectiveDate: '2026-08-12',
    lastVerified: '2026-09-20',
    authorityLevel: 9,
    appliesToComponentIds: ['comp-payment-service'],
    dependsOnIds: ['ke-payment-v4-release'],
  },
  {
    _id: 'ke-arch-payment-stale',
    _type: 'knowledgeEntry',
    title: 'Internal Payment Architecture & Webhook Specification (STALE)',
    body: 'Payment Service dispatches transaction notifications via HTTP POST using our standard XML envelope format with MD5 verification. Consumers should parse `<payment-event>` XML nodes.',
    sourceType: 'architecture-doc',
    effectiveDate: '2023-04-10',
    lastVerified: '2023-04-10',
    authorityLevel: 4, // Stale doc! Overridden by v4 release notes (auth 10)
    appliesToComponentIds: ['comp-payment-service'],
  },
  {
    _id: 'ke-sdk-v2-spec',
    _type: 'knowledgeEntry',
    title: 'Payment SDK v2 Production Specification',
    body: 'Payment SDK v2.4.1 is currently deployed across production clusters. It supports protocol versions up to Payment Service v3. It lacks the connection multiplexing and SHA256 HMAC verification handlers introduced in v4.',
    sourceType: 'dependency-spec',
    effectiveDate: '2024-01-20',
    lastVerified: '2026-09-22',
    authorityLevel: 8,
    appliesToComponentIds: ['comp-payment-sdk'],
  },
  {
    _id: 'ke-sdk-v3-spec',
    _type: 'knowledgeEntry',
    title: 'Payment SDK v3 Architecture & Rollout Specification',
    body: 'Payment SDK v3.0.1 is staged in staging-us-east-1. It introduces async connection multiplexing and the JSON v2 webhook parsing engine. Scheduled for platform cluster rollout in Q4.',
    sourceType: 'dependency-spec',
    effectiveDate: '2026-07-01',
    lastVerified: '2026-09-15',
    authorityLevel: 8,
    appliesToComponentIds: ['comp-payment-sdk'],
  },
  {
    _id: 'ke-incident-8921',
    _type: 'knowledgeEntry',
    title: 'Incident Postmortem: #INC-8921 Payment Gateway Blackhole',
    body: 'Severity: P0 Outage. On Sept 2024, a service upgrade was deployed without verifying upstream SDK compatibility. The service failed silently during handshake verification, resulting in 47 minutes of dropped checkout transactions ($180k revenue impact). Action Item: All future service version upgrades must audit dependency chains before shipping.',
    sourceType: 'incident-report',
    effectiveDate: '2024-09-03',
    lastVerified: '2024-09-10',
    authorityLevel: 8,
    appliesToComponentIds: ['comp-payment-service', 'comp-payment-sdk'],
  },
  {
    _id: 'ke-pg-matrix',
    _type: 'knowledgeEntry',
    title: 'Database Compatibility Matrix: Payment Core',
    body: 'PostgreSQL 15 (current prod) and PostgreSQL 16 are certified for Payment Service v2, v3, and v4. Database upgrade is NOT required for Payment Service v4.',
    sourceType: 'compatibility-matrix',
    effectiveDate: '2026-08-01',
    lastVerified: '2026-09-18',
    authorityLevel: 9,
    appliesToComponentIds: ['comp-payment-service', 'comp-postgres'],
  },
  {
    _id: 'ke-deploy-policy-std',
    _type: 'knowledgeEntry',
    title: 'Engineering Standard Deployment Policy (POL-01)',
    body: 'Rule 1: All major and minor production service version upgrades must soak in the staging environment for at least 24 hours prior to production deployment.',
    sourceType: 'policy',
    effectiveDate: '2025-01-01',
    lastVerified: '2026-08-01',
    authorityLevel: 6,
    appliesToComponentIds: ['comp-payment-service', 'comp-notification-service'],
  },
  {
    _id: 'ke-deploy-policy-hotfix-exception',
    _type: 'knowledgeEntry',
    title: 'Policy Exception: Emergency Security Hotfix (POL-02)',
    body: 'Exception to POL-01: Critical security patches and hotfix releases that contain zero schema changes and zero dependency version changes are exempt from the 24-hour staging soak requirement and may be deployed directly to production with on-call lead sign-off.',
    sourceType: 'policy',
    effectiveDate: '2025-06-15',
    lastVerified: '2026-09-10',
    authorityLevel: 9,
    appliesToComponentIds: ['comp-payment-service', 'comp-notification-service'],
    isExceptionOfId: 'ke-deploy-policy-std',
  },
  {
    _id: 'ke-notification-v2-release',
    _type: 'knowledgeEntry',
    title: 'Notification Service v2.0.0 Release Notes',
    body: 'Notification Service v2.0.0 introduces batched email dispatching. No breaking API changes, no SDK bumps required, fully compatible with existing PostgreSQL database.',
    sourceType: 'release-notes',
    effectiveDate: '2026-06-01',
    lastVerified: '2026-09-01',
    authorityLevel: 10,
    appliesToComponentIds: ['comp-notification-service'],
  },
];
