import { FieldTemplateProps } from '@rjsf/utils';

export function buildFieldTemplateProps(
  overrides: Partial<FieldTemplateProps> = {}
): FieldTemplateProps {
  return {
    id: 'root_name',
    label: 'Name',
    children: <div>children</div>,
    schema: {},
    uiSchema: {},
    registry: {},
    fieldPathId: { $id: 'root_name', path: ['name'] },
    onChange: vi.fn(),
    onKeyRename: vi.fn(),
    onKeyRenameBlur: vi.fn(),
    onRemoveProperty: vi.fn(),
    required: false,
    readonly: false,
    disabled: false,
    ...overrides,
  } as unknown as FieldTemplateProps;
}
