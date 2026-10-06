import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrayFieldItemButtonsTemplateProps } from '@rjsf/utils';

import DisplayAsListArrayFieldItemTemplate from '../DisplayAsListArrayFieldItemTemplate';
import { buildArrayFieldItemTemplateProps } from './buildArrayFieldItemTemplateProps';
import { useArrayItemRemove } from '../../../../ArrayItemRemoveContext';

function RemoveButton() {
  const arrayItemRemove = useArrayItemRemove();
  return (
    <button type="button" onClick={arrayItemRemove?.remove}>
      Remove
    </button>
  );
}

describe('<DisplayAsListArrayFieldItemTemplate />', () => {
  it('renders children', () => {
    const props = buildArrayFieldItemTemplateProps({
      children: <div>field content</div>,
    });

    render(<DisplayAsListArrayFieldItemTemplate {...props} />);

    expect(screen.getByText('field content')).toBeVisible();
  });

  it('provides an ArrayItemRemoveContext whose remove() calls buttonsProps.onRemoveItem', async () => {
    const user = userEvent.setup();
    const onRemoveItem = vi.fn();
    const props = buildArrayFieldItemTemplateProps({
      children: <RemoveButton />,
      buttonsProps: {
        hasRemove: true,
        onRemoveItem,
      } as unknown as ArrayFieldItemButtonsTemplateProps,
    });

    render(<DisplayAsListArrayFieldItemTemplate {...props} />);

    await user.click(screen.getByRole('button', { name: 'Remove' }));

    expect(onRemoveItem).toHaveBeenCalledTimes(1);
  });
});
