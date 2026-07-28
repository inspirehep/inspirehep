import { RJSFSchema } from '@rjsf/utils';

function flattenAnyOfItems(items: RJSFSchema): RJSFSchema {
  const anyOf = items?.anyOf;
  if (!Array.isArray(anyOf) || anyOf.length === 0) {
    return items;
  }

  const schemaEnum = anyOf
    .map((option) => (option as RJSFSchema)?.properties?.schema)
    .map((schemaProperty) => (schemaProperty as RJSFSchema)?.enum?.[0])
    .filter((value): value is string => typeof value === 'string');

  return {
    type: 'object',
    required: ['schema', 'value'],
    additionalProperties: false,
    properties: {
      schema: { type: 'string', enum: schemaEnum },
      value: { type: 'string' },
    },
  };
}

function prepareAuthorSchema(schema: RJSFSchema): RJSFSchema {
  // Drop $schema: Ajv8 has no draft-04 meta-schema registered and throws on first compile otherwise.
  const { $schema: _$schema, ...schemaWithoutMeta } = schema;
  const properties = (schemaWithoutMeta?.properties ?? {}) as RJSFSchema;
  const ids = properties.ids as RJSFSchema | undefined;
  const advisors = properties.advisors as RJSFSchema | undefined;
  const advisorItems = advisors?.items as RJSFSchema | undefined;
  const advisorIds = advisorItems?.properties?.ids as RJSFSchema | undefined;

  if (!ids?.items && !advisorIds?.items) {
    return schemaWithoutMeta;
  }

  return {
    ...schemaWithoutMeta,
    properties: {
      ...properties,
      ...(ids?.items && {
        ids: { ...ids, items: flattenAnyOfItems(ids.items as RJSFSchema) },
      }),
      ...(advisorIds?.items && {
        advisors: {
          ...advisors,
          items: {
            ...advisorItems,
            properties: {
              ...advisorItems?.properties,
              ids: {
                ...advisorIds,
                items: flattenAnyOfItems(advisorIds.items as RJSFSchema),
              },
            },
          },
        },
      }),
    },
  };
}

export default prepareAuthorSchema;
