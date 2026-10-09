import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ArrayFieldItemButtonsTemplateProps,
  ArrayFieldItemTemplateProps,
} from '@rjsf/utils';

import DefaultArrayFieldItemTemplate from '../DefaultArrayFieldItemTemplate';
import { buildArrayFieldItemTemplateProps } from './buildArrayFieldItemTemplateProps';

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
});
