import { ObjectFieldTemplateProps } from '@rjsf/utils';

export function buildObjectFieldTemplateProps(
  overrides: Partial<ObjectFieldTemplateProps> = {}
): ObjectFieldTemplateProps {
  return {
    title: 'Title',
    properties: [],
    schema: {},
    uiSchema: {},
    registry: {},
    fieldPathId: { $id: 'root', path: [] },
    onAddProperty: vi.fn(),
    required: false,
    readonly: false,
    disabled: false,
    ...overrides,
  } as unknown as ObjectFieldTemplateProps;
}
