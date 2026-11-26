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
          if: {
            properties: { schema: { const: schemaName } },
            required: ['schema'],
          },
          then: { properties: { value: valueConstraints } },
        })
      ),
    }),
  };
}

function isIdentifierAnyOf(schema: RJSFSchema): boolean {
  const { anyOf } = schema;
  return (
    Array.isArray(anyOf) &&
    anyOf.length > 0 &&
    (anyOf as RJSFSchema[]).every((option) => {
      const props = option?.properties as
        | Record<string, RJSFSchema>
        | undefined;
      return Array.isArray(props?.schema?.enum) && !!props?.value;
    })
  );
}

function mapValues(
  record: Record<string, RJSFSchema>,
  fn: (schema: RJSFSchema) => RJSFSchema
) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, fn(value)])
  );
}

function flattenIdentifierAnyOfs(schema: RJSFSchema): RJSFSchema {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }
  const node = isIdentifierAnyOf(schema) ? flattenAnyOfItems(schema) : schema;
  const { properties, definitions, items } = node;
  return {
    ...node,
    ...(properties && {
      properties: mapValues(
        properties as Record<string, RJSFSchema>,
        flattenIdentifierAnyOfs
      ),
    }),
    ...(definitions && {
      definitions: mapValues(
        definitions as Record<string, RJSFSchema>,
        flattenIdentifierAnyOfs
      ),
    }),
    ...(items &&
      !Array.isArray(items) &&
      typeof items === 'object' && {
        items: flattenIdentifierAnyOfs(items as RJSFSchema),
      }),
  };
}

function prepareSchema(schema: RJSFSchema): RJSFSchema {
  // Drop $schema: Ajv8 has no draft-04 meta-schema registered and throws on first compile otherwise.
  const { $schema: _$schema, ...schemaWithoutMeta } = schema;
  return flattenIdentifierAnyOfs(schemaWithoutMeta);
}

export default prepareSchema;
