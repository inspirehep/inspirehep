import { ArrayFieldItemTemplateProps } from '@rjsf/utils';

export function buildArrayFieldItemTemplateProps(
  overrides: Partial<ArrayFieldItemTemplateProps> = {}
): ArrayFieldItemTemplateProps {
  return {
    children: <td>field</td>,
    buttonsProps: {
      hasRemove: true,
      onRemoveItem: vi.fn(),
    },
    ...overrides,
  } as unknown as ArrayFieldItemTemplateProps;
}
