export default {
  name: 'versionConstraint',
  title: 'Version Constraint',
  type: 'document',
  fields: [
    {
      name: 'component',
      title: 'Subject Component',
      type: 'reference',
      to: [{ type: 'component' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'version',
      title: 'Subject Version',
      type: 'string',
      description: 'The target version being proposed (e.g. v4)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'requiresComponent',
      title: 'Required Component',
      type: 'reference',
      to: [{ type: 'component' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'requiresVersionRange',
      title: 'Required Version Range / Expression',
      type: 'string',
      description: 'e.g. ">= v3.0.0" or "v15 | v16"',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'notes',
      title: 'Constraint Notes / Rationale',
      type: 'string',
    },
  ],
};
