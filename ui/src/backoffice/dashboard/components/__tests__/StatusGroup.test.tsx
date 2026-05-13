import { screen, within } from '@testing-library/react';
import { Map } from 'immutable';
import userEvent from '@testing-library/user-event';
import StatusGroup from '../StatusGroup';
import { WorkflowStatusGroups } from '../../../constants';
import { renderWithRouter } from '../../../../fixtures/render';

describe('StatusGroup', () => {
  it('should display statuses on group click', async () => {
    const user = userEvent.setup();
    const onGroupCollapseStateChange = jest.fn();

    renderWithRouter(
      <StatusGroup
        groupStatusKey={WorkflowStatusGroups.NEEDS_REVIEW}
        groupKey="test-group"
        baseUrl="url-for-test"
        isOpen={false}
        onGroupCollapseStateChange={onGroupCollapseStateChange}
        statuses={[
          Map({ key: 'status 1', doc_count: 1 }),
          Map({ key: 'status 2', doc_count: 3 }),
          Map({ key: 'status 3', doc_count: 1 }),
        ]}
      />
    );

    const button = screen.getByRole('button', { name: /Needs review/ });
    expect(within(button).getByText('5')).toBeVisible();
    expect(screen.queryByText('status 1')).not.toBeInTheDocument();

    await user.click(button);

    expect(onGroupCollapseStateChange).toHaveBeenCalledWith('test-group', true);
  });

  it('should link directly to search page when not isCollapsable', async () => {
    renderWithRouter(
      <StatusGroup
        groupStatusKey={WorkflowStatusGroups.BLOCKED}
        groupKey="test-group"
        baseUrl="url-for-test"
        isOpen={false}
        onGroupCollapseStateChange={jest.fn()}
        statuses={[Map({ key: 'status 1', doc_count: 1 })]}
      />
    );

    const link = screen.getByRole('link', { name: /Blocked/ });
    expect(link).toHaveAttribute('href', '/url-for-test&status=blocked');
  });

  it('should show statuses when isOpen is true and hide them on button click', async () => {
    const user = userEvent.setup();
    const onGroupCollapseStateChange = jest.fn();
    renderWithRouter(
      <StatusGroup
        groupStatusKey={WorkflowStatusGroups.NEEDS_REVIEW}
        groupKey="test-group"
        baseUrl="url-for-test"
        isOpen
        onGroupCollapseStateChange={onGroupCollapseStateChange}
        statuses={[
          Map({ key: 'status 1', doc_count: 1 }),
          Map({ key: 'status 2', doc_count: 3 }),
        ]}
      />
    );

    const link1 = screen.getByRole('link', { name: /status 1/ });
    expect(link1).toHaveAttribute('href', '/url-for-test&status=status 1');

    const link2 = screen.getByRole('link', { name: /status 2/ });
    expect(link2).toHaveAttribute('href', '/url-for-test&status=status 2');

    const button = screen.getByRole('button', { name: /Needs review/ });

    await user.click(button);

    expect(onGroupCollapseStateChange).toHaveBeenCalledWith(
      'test-group',
      false
    );
  });
});
