import { createClient } from '@sanity/client';

export const sanityLiveClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '70rd1u6b',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.SANITY_API_VERSION || '2026-06-23',
  useCdn: false,
});
