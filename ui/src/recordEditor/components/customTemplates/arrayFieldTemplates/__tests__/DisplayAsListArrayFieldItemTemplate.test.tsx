import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrayFieldItemButtonsTemplateProps } from '@rjsf/utils';

import DisplayAsListArrayFieldItemTemplate from '../DisplayAsListArrayFieldItemTemplate';
import {
  buildArrayFieldItemTemplateProps,
  reorderProps,
} from './buildArrayFieldItemTemplateProps';
import { ArrayAddItemContext } from '../../../../ArrayAddItemContext';
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

  it('calls onMoveUpItem and onMoveDownItem when clicking the arrows', async () => {
    const user = userEvent.setup();
    const onMoveUpItem = vi.fn();
    const onMoveDownItem = vi.fn();
    render(
      <DisplayAsListArrayFieldItemTemplate
        {...reorderProps({ onMoveUpItem, onMoveDownItem })}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Move up' }));
    expect(onMoveUpItem).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Move down' }));
    expect(onMoveDownItem).toHaveBeenCalledTimes(1);
  });

  it('disables "Move up" for the first item', () => {
    render(
      <DisplayAsListArrayFieldItemTemplate
        {...reorderProps({ hasMoveUp: false })}
      />
    );

    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled();
  });

  it('disables "Move down" for the last item', () => {
    render(
      <DisplayAsListArrayFieldItemTemplate
        {...reorderProps({ hasMoveDown: false })}
      />
    );

    expect(screen.getByRole('button', { name: 'Move up' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled();
  });

  it('does not render arrows when the item cannot move', () => {
    render(
      <DisplayAsListArrayFieldItemTemplate
        {...reorderProps({ hasMoveUp: false, hasMoveDown: false })}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Move up' })
    ).not.toBeInTheDocument();
  });

  it('disables arrows when readonly', () => {
    const props = reorderProps();
    render(<DisplayAsListArrayFieldItemTemplate {...props} readonly />);

    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled();
  });

  it('does not render "Add new element here" without an add context', () => {
    render(
      <DisplayAsListArrayFieldItemTemplate
        {...buildArrayFieldItemTemplateProps()}
      />
    );

    expect(
      screen.queryByRole('button', { name: /Add new element here/ })
    ).not.toBeInTheDocument();
  });

  it('calls addAt with the item index on "Add new element here" click', async () => {
    const user = userEvent.setup();
    const addAt = vi.fn();
    const props = buildArrayFieldItemTemplateProps({ index: 2 });

    render(
      <ArrayAddItemContext.Provider value={{ addAt }}>
        <DisplayAsListArrayFieldItemTemplate {...props} />
      </ArrayAddItemContext.Provider>
    );

    await user.click(
      screen.getByRole('button', { name: /Add new element here/ })
    );

    expect(addAt).toHaveBeenCalledTimes(1);
    expect(addAt).toHaveBeenCalledWith(2);
  });

  it('disables "Add new element here" when readonly', () => {
    const props = buildArrayFieldItemTemplateProps({ index: 0 });

    render(
      <ArrayAddItemContext.Provider value={{ addAt: vi.fn() }}>
        <DisplayAsListArrayFieldItemTemplate {...props} readonly />
      </ArrayAddItemContext.Provider>
    );

    expect(
      screen.getByRole('button', { name: /Add new element here/ })
    ).toBeDisabled();
  });
});
