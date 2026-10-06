import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ArrayFieldItemButtonsTemplateProps,
  ArrayFieldItemTemplateProps,
} from '@rjsf/utils';

import NestedArrayFieldItemTemplate from '../NestedArrayFieldItemTemplate';
import NestedArrayRowLabelContext from '../NestedArrayRowLabelContext';
import { buildArrayFieldItemTemplateProps } from './buildArrayFieldItemTemplateProps';

function renderInTable(
  props: ArrayFieldItemTemplateProps,
  rowLabelCell: React.ReactNode = null
) {
  return render(
    <table>
      <tbody>
        <NestedArrayRowLabelContext.Provider value={rowLabelCell}>
          <NestedArrayFieldItemTemplate {...props} />
        </NestedArrayRowLabelContext.Provider>
      </tbody>
    </table>
  );
}

describe('<NestedArrayFieldItemTemplate />', () => {
  it('renders the row label cell from context when index is 0', () => {
    const props = buildArrayFieldItemTemplateProps({
      index: 0,
      children: <span>field content</span>,
    });

    renderInTable(props, <td>row label</td>);

    expect(screen.getByText('row label')).toBeVisible();
    expect(screen.getByText('field content')).toBeVisible();
  });

  it('does not render the row label cell when index is not 0', () => {
    const props = buildArrayFieldItemTemplateProps({
      index: 1,
      children: <span>field content</span>,
    });

    renderInTable(props, <td>row label</td>);

    expect(screen.queryByText('row label')).not.toBeInTheDocument();
    expect(screen.getByText('field content')).toBeVisible();
  });

  it('does not render "Remove item" button when buttonsProps.hasRemove is false', () => {
    const props = buildArrayFieldItemTemplateProps({
      index: 0,
      children: <span>field content</span>,
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
      index: 0,
      children: <span>field content</span>,
      buttonsProps: {
        hasRemove: true,
        onRemoveItem,
      } as unknown as ArrayFieldItemButtonsTemplateProps,
    });

    renderInTable(props);

    await user.click(screen.getByRole('button', { name: 'Remove item' }));

    expect(onRemoveItem).toHaveBeenCalledTimes(1);
  });
});
