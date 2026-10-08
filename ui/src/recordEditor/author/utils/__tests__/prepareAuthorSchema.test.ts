import { RJSFSchema } from '@rjsf/utils';

import prepareAuthorSchema from '../prepareAuthorSchema';

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

describe('prepareAuthorSchema', () => {
  it('strips $schema from the top-level schema', () => {
    const schema: RJSFSchema = {
      $schema: 'http://json-schema.org/draft-04/schema#',
      type: 'object',
      properties: {},
    };

    expect(prepareAuthorSchema(schema)).toEqual({
      type: 'object',
      properties: {},
    });
  });

  it('returns the schema unchanged (besides $schema) when there is no ids/advisors field', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: { name: { type: 'string' } },
    };

    expect(prepareAuthorSchema(schema)).toEqual(schema);
  });

  it('flattens properties.ids.items.anyOf into a single object schema with a flat enum and conditional value constraints', () => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        ids: { type: 'array', minItems: 1, uniqueItems: true, items: anyOfIds },
      },
    };

    const result = prepareAuthorSchema(schema) as any;

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

    const result = prepareAuthorSchema(schema) as any;

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

    const result = prepareAuthorSchema(schema) as any;

    expect(result.properties.ids.items).toEqual(flattenedIdsItems);
    expect(result.properties.advisors.items.properties.ids.items).toEqual(
      flattenedIdsItems
    );
  });
});
