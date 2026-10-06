export const authorWithSchema = {
  record: {
    metadata: {
      ids: [
        {
          schema: 'ORCID',
          value: '0000-0003-1866-1950',
        },
      ],
      name: {
        preferred_name: 'David Lyle Burke',
        value: 'Burke, David Lyle',
      },
      status: 'active',
    },
  },
  schema: {
    type: 'object',
    properties: {
      ids: {
        items: {
          anyOf: [
            {
              additionalProperties: false,
              description:
                'This identifier is assigned to any curated author record (HEPNAMES on\nlegacy).  It is mainly used by large collaborations (providing an\n`authors.xml` file) to uniquely identify the authors of their articles.',
              properties: {
                schema: {
                  enum: ['INSPIRE ID'],
                  minLength: 1,
                  type: 'string',
                },
                value: {
                  description: ':example: ``INSPIRE-12345678``',
                  minLength: 1,
                  pattern: '^INSPIRE-\\d{8}$',
                  type: 'string',
                },
              },
              required: ['schema', 'value'],
              title: 'Inspire ID',
              type: 'object',
            },
            {
              additionalProperties: false,
              description:
                '`ORCID <http://orcid.org>`_ provides an identifier for individuals to\nuse with their name as they engage in research, scholarship, and\ninnovation activities.\n\nThe ORCID identifier can be resolved by prepending ``http://orcid.org``\nto the `value`, in order to get the ORCID record of the person.',
              properties: {
                schema: {
                  enum: ['ORCID'],
                  minLength: 1,
                  type: 'string',
                },
                value: {
                  description: ':example: ``0000-0012-1234-5647``',
                  format: 'orcid',
                  minLength: 1,
                  pattern: '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$',
                  type: 'string',
                },
              },
              required: ['schema', 'value'],
              title: 'ORCID',
              type: 'object',
            },
          ],
        },
        minItems: 1,
        type: 'array',
        uniqueItems: true,
      },
      name: {
        additionalProperties: false,
        description: ':MARC: ``100``, ``400``, ``880``',
        properties: {
          name_variants: {
            description:
              'Contains other variations (besides `preferred_name`) of the\nauthor name in `value` that are in use.\n\nThese could be:\n\n- other spellings;\n- other transliterations from the :ref:`native_names` to the\n  Latin alphabet;\n- other splittings among last names and first names;\n- combinations with :ref:`previous_names`.\n\n:example: ``Smith-Taylor, Johnny``\n:MARC: ``400__a``',
            items: {
              minLength: 1,
              type: 'string',
            },
            minItems: 1,
            pattern: '^[^,]+(,[^,]+)?(,?[^,]+)?$',
            title: 'List of name variants',
            type: 'array',
            uniqueItems: true,
          },
          preferred_name: {
            description:
              'differs from the full name in `value`. This should use Latin alphabet.\n\n:example: ``Smith, John``\n:MARC: ``100__q``',
            minLength: 1,
            type: 'string',
          },
          value: {
            description:
              'Author name in Latin alphabet (may contain diacritics). The\nformat should be ``last names, first names``. If not all\nnames are known, initials should be followed by a `.`\nwithout space.\n\n.. note::\n\n    Not all authors have two names, so only one name\n    without a comma is perfectly valid.\n\n    :example: ``Jimmy``\n\n:example: ``Smith Davis, Jonathan Gerald C.T.``\n:MARC: ``100__a``',
            minLength: 1,
            pattern: '^[^,]+(,[^,]+)?(,?[^,]+)?$',
            title: 'Full name of the author',
            type: 'string',
          },
        },
        required: ['value'],
        title: 'Name information of the author',
        type: 'object',
      },
      status: {
        description: "The person's status",
        enum: ['active', 'deceased', 'departed', 'retired'],
        minLength: 1,
        type: 'string',
      },
    },
  },
};
