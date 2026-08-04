import { RJSFSchema } from '@rjsf/utils';

function flattenAnyOfItems(items: RJSFSchema): RJSFSchema {
  const anyOf = items?.anyOf;
  if (!Array.isArray(anyOf) || anyOf.length === 0) {
    return items;
  }

  const branches = (anyOf as RJSFSchema[]).map((option) => {
    const schemaName = (option?.properties?.schema as RJSFSchema | undefined)
      ?.enum?.[0] as string | undefined;
    const { pattern, minLength, maxLength } = (option?.properties?.value ??
      {}) as RJSFSchema;
    const valueConstraints: RJSFSchema = {
      ...(pattern !== undefined && { pattern }),
      ...(minLength !== undefined && { minLength }),
      ...(maxLength !== undefined && { maxLength }),
    };
    return { schemaName, valueConstraints };
  });

  const schemaEnum = branches
    .map((branch) => branch.schemaName)
    .filter((value): value is string => typeof value === 'string');

  const valueConstraintsBySchema = branches.filter(
    (branch): branch is { schemaName: string; valueConstraints: RJSFSchema } =>
      typeof branch.schemaName === 'string' &&
      Object.keys(branch.valueConstraints).length > 0
  );

  return {
    type: 'object',
    required: ['schema', 'value'],
    additionalProperties: false,
    properties: {
      schema: { type: 'string', enum: schemaEnum },
      value: { type: 'string' },
    },
    ...(valueConstraintsBySchema.length > 0 && {
      allOf: valueConstraintsBySchema.map(
        ({ schemaName, valueConstraints }) => ({
          if: { properties: { schema: { const: schemaName } } },
          then: { properties: { value: valueConstraints } },
        })
      ),
    }),
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
