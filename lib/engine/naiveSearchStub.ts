export interface NaiveSearchResult {
  query: string;
  naiveVerdict: string;
  matchedDocs: {
    title: string;
    similarityScore: number;
    snippet: string;
  }[];
  failureAnalysis: string;
  whyStructuredWins: string;
}

export function runNaiveVectorSearch(query: string): NaiveSearchResult {
  const isV4Upgrade = query.toLowerCase().includes('v4');

  if (isV4Upgrade) {
    return {
      query,
      naiveVerdict:
        '“Looks safe to upgrade! Payment Service v4 is released and compatible with PostgreSQL 16. Webhook documentation is available in internal architecture specifications.”',
      matchedDocs: [
        {
          title: 'Database Compatibility Matrix: Payment Core',
          similarityScore: 0.89,
          snippet:
            'PostgreSQL 15 (current prod) and PostgreSQL 16 are certified for Payment Service v2, v3, and v4...',
        },
        {
          title: 'Payment Service v4.0.0 Official Release Notes',
          similarityScore: 0.86,
          snippet:
            'Payment Service v4.0.0 includes a redesigned webhook engine. Supports multi-currency and high-volume billing...',
        },
        {
          title: 'Internal Payment Architecture & Webhook Specification (STALE)',
          similarityScore: 0.81,
          snippet:
            'Payment Service dispatches transaction notifications via HTTP POST using our standard XML envelope format...',
        },
      ],
      failureAnalysis:
        'FAIL: Similarity search retrieved documents that matched the words "payment", "v4", "upgrade", and "database". But because vector embeddings cannot follow relational links, it never queried Payment SDK specs (since "SDK" was never in the user’s question). It also blended the 2023 stale XML doc with the 2026 JSON release notes without noticing the authority contradiction.',
      whyStructuredWins:
        'Sanity GROQ graph traversal explicitly queried versionConstraints and walked 2 hops to discover that Payment Service v4 requires Payment SDK v3, while production only runs v2. It also resolved the XML vs JSON contradiction using authorityLevel (10 vs 4).',
    };
  }

  return {
    query,
    naiveVerdict:
      '“Retrieved general documentation for the proposed service. Review release notes before deploying.”',
    matchedDocs: [
      {
        title: 'Engineering Standard Deployment Policy (POL-01)',
        similarityScore: 0.78,
        snippet: 'All major and minor production service version upgrades must soak in staging...',
      },
    ],
    failureAnalysis:
      'Vector search returns chunks based on surface keyword similarity rather than verifying whether prerequisite conditions and dependency matrices are met.',
    whyStructuredWins:
      'SHIPCHECK evaluates actual version ranges, active cluster states, and policy exceptions before rendering a verdict.',
  };
}
