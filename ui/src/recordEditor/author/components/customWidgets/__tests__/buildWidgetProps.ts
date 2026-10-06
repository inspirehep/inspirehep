import { WidgetProps } from '@rjsf/utils';

export function buildWidgetProps(
  overrides: Partial<WidgetProps> = {}
): WidgetProps {
  return {
    id: 'test',
    name: 'test',
    value: '',
    required: false,
    disabled: false,
    readonly: false,
    autofocus: false,
    options: {},
    onBlur: vi.fn(),
    onChange: vi.fn(),
    onFocus: vi.fn(),
    label: 'Test',
    schema: {},
    uiSchema: {},
    registry: {} as unknown,
    ...overrides,
  } as unknown as WidgetProps;
}
