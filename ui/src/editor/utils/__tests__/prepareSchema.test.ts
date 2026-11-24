import { RJSFSchema } from '@rjsf/utils';

import prepareSchema from '../prepareSchema';

const anyOfIds = {
  anyOf: [
    {
      properties: {
        schema: { enum: ['INSPIRE ID'] },
        value: { pattern: '^INSPIRE-\\d{8}$', minLength: 1 },
      },
    },
    {
      properties: {
        schema: { enum: ['ORCID'] },
        value: {
          pattern: '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$',
          minLength: 1,
        },
      },
    },
  ],
};

const flattenedIdsItems = {
  type: 'object',
  required: ['schema', 'value'],
  additionalProperties: false,
  properties: {
    schema: { type: 'string', enum: ['INSPIRE ID', 'ORCID'] },
    value: { type: 'string' },
  },
  allOf: [
    {
      if: {
        properties: { schema: { const: 'INSPIRE ID' } },
        required: ['schema'],
      },
      then: {
        properties: { value: { pattern: '^INSPIRE-\\d{8}$', minLength: 1 } },
      },
    },
    {
      if: { properties: { schema: { const: 'ORCID' } }, required: ['schema'] },
      then: {
        properties: {
          value: {
            pattern: '^\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]$',
            minLength: 1,
          },
        },
      },
    },
  ],
};

describe('prepareSchema', () => {
  it('strips $schema from the top-level schema', () => {
    const schema: RJSFSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: {},
    };

    expect(prepareSchema(schema)).toEqual({
      type: 'object',
      properties: {},
    });
  });

  it('returns the schema unchanged (besides $schema) when there is no ids/advisors field', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    expect(prepareSchema(schema)).toEqual(schema);
  });

  it('flattens properties.ids.items.anyOf into a single object schema with a flat enum and conditional value constraints', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        ids: { type: 'array', minItems: 1, uniqueItems: true, items: anyOfIds },
      },
    };

    const result = prepareSchema(schema) as any;

    expect(result.properties.ids).toEqual({
      type: 'array',
      minItems: 1,
      uniqueItems: true,
      items: flattenedIdsItems,
    });
  });

  it('flattens properties.advisors.items.properties.ids.items.anyOf the same way, leaving sibling advisor properties untouched', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        advisors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ids: { type: 'array', items: anyOfIds },
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const result = prepareSchema(schema) as any;

    expect(result.properties.advisors.items.properties.ids.items).toEqual(
      flattenedIdsItems
    );
    expect(result.properties.advisors.items.properties.name).toEqual({
      type: 'string',
    });
  });

  it('flattens both ids and advisors ids when both are present', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        ids: { type: 'array', items: anyOfIds },
        advisors: {
          type: 'array',
          items: {
            type: 'object',
            properties: { ids: { type: 'array', items: anyOfIds } },
          },
        },
      },
    };

    const result = prepareSchema(schema) as any;

    expect(result.properties.ids.items).toEqual(flattenedIdsItems);
    expect(result.properties.advisors.items.properties.ids.items).toEqual(
      flattenedIdsItems
    );
  });

  it('flattens properties.authors.items.properties.ids.items.anyOf for literature records, leaving sibling author properties untouched', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        authors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ids: { type: 'array', items: anyOfIds },
              full_name: { type: 'string' },
            },
          },
        },
        titles: { type: 'array' },
      },
    };

    const result = prepareSchema(schema) as any;

    expect(result.properties.authors.items.properties.ids.items).toEqual(
      flattenedIdsItems
    );
    expect(result.properties.authors.items.properties.full_name).toEqual({
      type: 'string',
    });
    expect(result.properties.titles).toEqual({ type: 'array' });
  });

  it('flattens authors[].affiliations_identifiers (GRID / ROR)', () => {
    const branch = (name: string, pattern: string): RJSFSchema => ({
      additionalProperties: false,
      properties: {
        schema: {
          description: 'd',
          enum: [name],
          minLength: 1,
          type: 'string',
        },
        value: { description: 'd', minLength: 1, pattern, type: 'string' },
      },
      required: ['schema', 'value'],
      title: `${name} identifier`,
      type: 'object',
    });
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        authors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              affiliations_identifiers: {
                type: 'array',
                items: {
                  anyOf: [branch('GRID', '^grid'), branch('ROR', '^https')],
                },
              },
            },
          },
        },
      },
    };

    const { items } = (prepareSchema(schema) as any).properties.authors.items
      .properties.affiliations_identifiers;

    expect(items.anyOf).toBeUndefined();
    expect(items.properties.schema.enum).toEqual(['GRID', 'ROR']);
    expect(items.allOf).toHaveLength(2);
  });

  it('flattens identifier anyOf at any depth without targeting specific fields', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        supervisors: {
          type: 'array',
          items: {
            type: 'object',
            properties: { ids: { type: 'array', items: anyOfIds } },
          },
        },
      },
    };

    const result = prepareSchema(schema) as any;

    expect(result.properties.supervisors.items.properties.ids.items).toEqual(
      flattenedIdsItems
    );
  });

  it('leaves anyOf that are not identifier branches untouched', () => {
    const otherAnyOf: RJSFSchema = {
      anyOf: [{ type: 'string' }, { type: 'object', properties: {} }],
    };
    const schema: RJSFSchema = {
      type: 'object',
      properties: { something: { type: 'array', items: otherAnyOf } },
    };

    expect(prepareSchema(schema)).toEqual(schema);
  });
});
