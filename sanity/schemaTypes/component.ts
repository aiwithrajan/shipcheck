export default {
  name: 'component',
  title: 'Component / Service',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Component Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'currentVersion',
      title: 'Current Production Version',
      type: 'string',
      description: 'The version currently active in production environment',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'serviceOwner',
      title: 'Service Owner',
      type: 'string',
    },
    {
      name: 'requiredBy',
      title: 'Required By (Downstream Consumers)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'component' }] }],
    },
    {
      name: 'dependencies',
      title: 'Dependencies (Upstream Services)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'component' }] }],
    },
  ],
};
