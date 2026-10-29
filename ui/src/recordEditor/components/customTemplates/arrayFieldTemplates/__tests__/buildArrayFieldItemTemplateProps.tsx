import {
  ArrayFieldItemButtonsTemplateProps,
  ArrayFieldItemTemplateProps,
} from '@rjsf/utils';

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

export const reorderProps = (buttonsOverrides = {}) =>
  buildArrayFieldItemTemplateProps({
    buttonsProps: {
      hasRemove: true,
      hasMoveUp: true,
      hasMoveDown: true,
      onRemoveItem: vi.fn(),
      onMoveUpItem: vi.fn(),
      onMoveDownItem: vi.fn(),
      ...buttonsOverrides,
    } as unknown as ArrayFieldItemButtonsTemplateProps,
  });
