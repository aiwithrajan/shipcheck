export default {
  name: 'knowledgeEntry',
  title: 'Knowledge Entry',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'body',
      title: 'Body Text / Document Content',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'sourceType',
      title: 'Source Type',
      type: 'string',
      options: {
        list: [
          { title: 'Release Notes', value: 'release-notes' },
          { title: 'Migration Guide', value: 'migration-guide' },
          { title: 'Architecture Doc', value: 'architecture-doc' },
          { title: 'Dependency Spec', value: 'dependency-spec' },
          { title: 'Runbook', value: 'runbook' },
          { title: 'Incident Report', value: 'incident-report' },
          { title: 'Policy', value: 'policy' },
          { title: 'Compatibility Matrix', value: 'compatibility-matrix' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
    },
    {
      name: 'lastVerified',
      title: 'Last Verified Date',
      type: 'date',
      description: 'Used to resolve conflicts by recency',
    },
    {
      name: 'authorityLevel',
      title: 'Authority Level (1-10)',
      type: 'number',
      description: 'Higher numbers supersede lower numbers (e.g. Release Notes = 10, Stale Doc = 4)',
      validation: (Rule: any) => Rule.required().min(1).max(10),
    },
    {
      name: 'appliesToComponent',
      title: 'Applies To Component',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'component' }] }],
    },
    {
      name: 'dependsOn',
      title: 'Depends On (Knowledge Entries or Components)',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'knowledgeEntry' }, { type: 'component' }] },
      ],
    },
    {
      name: 'supersedes',
      title: 'Supersedes',
      type: 'reference',
      to: [{ type: 'knowledgeEntry' }],
    },
    {
      name: 'contradicts',
      title: 'Contradicts',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'knowledgeEntry' }] }],
    },
    {
      name: 'isExceptionOf',
      title: 'Is Exception Of (Policy / Rule Modifier)',
      type: 'reference',
      to: [{ type: 'knowledgeEntry' }],
      description: 'Links an exception to the general rule it modifies',
    },
  ],
};
