import { createClient } from '@sanity/client';
import { SEED_COMPONENTS, SEED_CONSTRAINTS, SEED_KNOWLEDGE } from '../sanity/seedData.js';

const client = createClient({
  projectId: '70rd1u6b',
  dataset: 'production',
  token: 'sk89RFuZqB0MS2YuPJ4mwmYZatQ9ByXD2QV1LJE8704Yk5K6M4aftlnpgvqIXrxsIaMPPiReRzHf0xGJ1lv35vNFbr8jbDYPAYA3Q0coyR2Rd0X4X4xpYQR4bP3Qe1xJ5ZNGAn3UPMTM69srYw843Oq5g5UDoPfqtlecBOWFmA91s2dT1zWd',
  apiVersion: '2026-06-23',
  useCdn: false,
});

async function seed() {
  console.log('Seeding documents to live Sanity Content Lake: 70rd1u6b ...');

  // Transform components to Sanity documents
  const compDocs = SEED_COMPONENTS.map(c => ({
    _id: c._id,
    _type: 'component',
    name: c.name,
    slug: { _type: 'slug', current: c.slug.current },
    currentVersion: c.currentVersion,
    serviceOwner: c.serviceOwner,
    dependencies: (c.dependencies || []).map(id => ({ _type: 'reference', _ref: id })),
    requiredBy: (c.requiredBy || []).map(id => ({ _type: 'reference', _ref: id })),
  }));

  const constraintDocs = SEED_CONSTRAINTS.map(vc => ({
    _id: vc._id,
    _type: 'versionConstraint',
    component: { _type: 'reference', _ref: vc.componentId },
    version: vc.version,
    requiresComponent: { _type: 'reference', _ref: vc.requiresComponentId },
    requiresVersionRange: vc.requiresVersionRange,
    notes: vc.notes,
  }));

  const knowledgeDocs = SEED_KNOWLEDGE.map(k => ({
    _id: k._id,
    _type: 'knowledgeEntry',
    title: k.title,
    body: k.body,
    sourceType: k.sourceType,
    effectiveDate: k.effectiveDate,
    lastVerified: k.lastVerified,
    authorityLevel: k.authorityLevel,
    appliesToComponent: k.appliesToComponentIds.map(id => ({ _type: 'reference', _ref: id })),
    dependsOn: (k.dependsOnIds || []).map(id => ({ _type: 'reference', _ref: id })),
    contradicts: (k.contradictsIds || []).map(id => ({ _type: 'reference', _ref: id })),
    ...(k.supersedesId ? { supersedes: { _type: 'reference', _ref: k.supersedesId } } : {}),
    ...(k.isExceptionOfId ? { isExceptionOf: { _type: 'reference', _ref: k.isExceptionOfId } } : {}),
  }));

  const allDocs = [...compDocs, ...constraintDocs, ...knowledgeDocs];

  const transaction = client.transaction();
  for (const doc of allDocs) {
    transaction.createOrReplace(doc);
  }

  const result = await transaction.commit();
  console.log(`Successfully seeded ${allDocs.length} documents into live Sanity Content Lake! Transaction ID: ${result.transactionId}`);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
