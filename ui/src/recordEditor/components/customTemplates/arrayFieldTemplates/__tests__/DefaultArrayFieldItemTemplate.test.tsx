import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ArrayFieldItemButtonsTemplateProps,
  ArrayFieldItemTemplateProps,
} from '@rjsf/utils';

import DefaultArrayFieldItemTemplate from '../DefaultArrayFieldItemTemplate';
import {
  buildArrayFieldItemTemplateProps,
  reorderProps,
} from './buildArrayFieldItemTemplateProps';

function renderInTable(props: ArrayFieldItemTemplateProps) {
  return render(
    <table>
      <tbody>
        <DefaultArrayFieldItemTemplate {...props} />
      </tbody>
    </table>
  );
}

describe('<DefaultArrayFieldItemTemplate />', () => {
  it('renders children as-is', () => {
    const props = buildArrayFieldItemTemplateProps({
      children: <td>field content</td>,
    });

    renderInTable(props);

    expect(screen.getByText('field content')).toBeVisible();
  });

  it('does not render "Remove item" button when buttonsProps.hasRemove is false', () => {
    const props = buildArrayFieldItemTemplateProps({
      buttonsProps: {
        hasRemove: false,
        onRemoveItem: vi.fn(),
      } as unknown as ArrayFieldItemButtonsTemplateProps,
    });

    renderInTable(props);

    expect(
      screen.queryByRole('button', { name: 'Remove item' })
    ).not.toBeInTheDocument();
  });

  it('calls buttonsProps.onRemoveItem when clicking "Remove item"', async () => {
    const user = userEvent.setup();
    const onRemoveItem = vi.fn();
    const props = buildArrayFieldItemTemplateProps({
      buttonsProps: {
        hasRemove: true,
        onRemoveItem,
      } as unknown as ArrayFieldItemButtonsTemplateProps,
    });

    renderInTable(props);

    await user.click(screen.getByRole('button', { name: 'Remove item' }));

    expect(onRemoveItem).toHaveBeenCalledTimes(1);
  });

  it('calls onMoveUpItem and onMoveDownItem when clicking the arrows', async () => {
    const user = userEvent.setup();
    const onMoveUpItem = vi.fn();
    const onMoveDownItem = vi.fn();
    renderInTable(reorderProps({ onMoveUpItem, onMoveDownItem }));

    await user.click(screen.getByRole('button', { name: 'Move up' }));
    expect(onMoveUpItem).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Move down' }));
    expect(onMoveDownItem).toHaveBeenCalledTimes(1);
  });

  it('disables "Move up" for the first item', () => {
    renderInTable(reorderProps({ hasMoveUp: false }));

    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled();
  });

  it('disables "Move down" for the last item', () => {
    renderInTable(reorderProps({ hasMoveDown: false }));

    expect(screen.getByRole('button', { name: 'Move up' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled();
  });

  it('does not render arrows when the item cannot move', () => {
    renderInTable(reorderProps({ hasMoveUp: false, hasMoveDown: false }));

    expect(
      screen.queryByRole('button', { name: 'Move up' })
    ).not.toBeInTheDocument();
  });

  it('disables arrows when readonly', () => {
    const props = reorderProps();
    renderInTable({ ...props, readonly: true });

    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled();
  });

  it('disables "Remove item" button when readonly', () => {
    const props = buildArrayFieldItemTemplateProps({
      readonly: true,
      buttonsProps: {
        hasRemove: true,
        onRemoveItem: vi.fn(),
      } as unknown as ArrayFieldItemButtonsTemplateProps,
    });

    renderInTable(props);

    expect(screen.getByRole('button', { name: 'Remove item' })).toBeDisabled();
  });
});
