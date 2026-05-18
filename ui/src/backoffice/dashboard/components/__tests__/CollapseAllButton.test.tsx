import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CollapseAllButton from '../CollapseAllButton';
import { CollapseState } from '../../../constants';

const renderButton = (
  collapseState: CollapseState,
  onCollapseAll = jest.fn()
) =>
  render(
    <CollapseAllButton
      collapseState={collapseState}
      onCollapseAll={onCollapseAll}
    />
  );

describe('CollapseAllButton', () => {
  it('calls onCollapseAll(true) when clicking "Expand all"', async () => {
    const onCollapseAll = jest.fn();
    const user = userEvent.setup();
    renderButton(CollapseState.ALL_COLLAPSED, onCollapseAll);

    await user.click(screen.getByRole('button', { name: 'Expand all' }));

    expect(onCollapseAll).toHaveBeenCalledWith(true);
  });

  it('calls onCollapseAll(false) when clicking "Collapse all"', async () => {
    const onCollapseAll = jest.fn();
    const user = userEvent.setup();
    renderButton(CollapseState.ALL_EXPANDED, onCollapseAll);

    await user.click(screen.getByRole('button', { name: 'Collapse all' }));

    expect(onCollapseAll).toHaveBeenCalledWith(false);
  });

  it('should display "Collapse all" label when collapse state is mixed', () => {
    renderButton(CollapseState.MIXED);
    expect(screen.getByRole('button', { name: 'Collapse all' })).toBeVisible();
  });
});
