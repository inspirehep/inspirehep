import { ArrayFieldTemplateProps } from '@rjsf/utils';

export function buildArrayFieldTemplateProps(
  overrides: Partial<ArrayFieldTemplateProps> = {}
): ArrayFieldTemplateProps {
  return {
    title: 'Title',
    items: [],
    canAdd: true,
    onAddClick: vi.fn(),
    schema: { items: { type: 'object', properties: {} } },
    uiSchema: {},
    registry: {},
    fieldPathId: { $id: 'root', path: [] },
    required: false,
    readonly: false,
    disabled: false,
    ...overrides,
  } as unknown as ArrayFieldTemplateProps;
}
