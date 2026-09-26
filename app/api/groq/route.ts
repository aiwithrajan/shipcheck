import { NextResponse } from 'next/server';
import { sanityLiveClient } from '@/lib/sanity/client';
import { SEED_COMPONENTS, SEED_CONSTRAINTS, SEED_KNOWLEDGE } from '@/sanity/seedData';

export async function GET() {
  try {
    // Live query from cloud Sanity Content Lake
    const [components, versionConstraints, knowledgeEntries] = await Promise.all([
      sanityLiveClient.fetch('*[_type == "component"]'),
      sanityLiveClient.fetch('*[_type == "versionConstraint"]'),
      sanityLiveClient.fetch('*[_type == "knowledgeEntry"]'),
    ]);

    return NextResponse.json({
      source: 'live-sanity-content-lake',
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '70rd1u6b',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      components: components.length > 0 ? components : SEED_COMPONENTS,
      versionConstraints: versionConstraints.length > 0 ? versionConstraints : SEED_CONSTRAINTS,
      knowledgeEntries: knowledgeEntries.length > 0 ? knowledgeEntries : SEED_KNOWLEDGE,
      stats: {
        totalComponents: components.length || SEED_COMPONENTS.length,
        totalConstraints: versionConstraints.length || SEED_CONSTRAINTS.length,
        totalKnowledgeEntries: knowledgeEntries.length || SEED_KNOWLEDGE.length,
      },
    });
  } catch (err: any) {
    console.warn('Fallback to local seed data due to:', err.message);
    return NextResponse.json({
      source: 'local-seed-fallback',
      components: SEED_COMPONENTS,
      versionConstraints: SEED_CONSTRAINTS,
      knowledgeEntries: SEED_KNOWLEDGE,
      stats: {
        totalComponents: SEED_COMPONENTS.length,
        totalConstraints: SEED_CONSTRAINTS.length,
        totalKnowledgeEntries: SEED_KNOWLEDGE.length,
      },
    });
  }
}
