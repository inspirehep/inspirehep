import { render, screen, within } from '@testing-library/react';
import { Map } from 'immutable';
import userEvent from '@testing-library/user-event';
import StatusGroup from '../StatusGroup';
import { renderWithRouter } from '../../../../fixtures/render';

describe('StatusGroup', () => {
  it('should display statuses on group click and hide them again when clicking again when isCollapsable', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <StatusGroup
        label="Test Group"
        groupStatusKey="group"
        groupKey="test-group"
        baseUrl="url-for-test"
        isCollapsable
        statuses={[
          Map({ key: 'status 1', doc_count: 1 }),
          Map({ key: 'status 2', doc_count: 3 }),
          Map({ key: 'status 3', doc_count: 1 }),
        ]}
      />
    );

    const button = screen.getByRole('button', { name: /Test Group/ });
    expect(within(button).getByText('5')).toBeVisible();
    expect(screen.queryByText('status 1')).not.toBeInTheDocument();

    await user.click(button);

    const link1 = screen.getByRole('link', { name: /status 1/ });
    expect(link1).toHaveAttribute('href', '/url-for-test&status=status 1');
    expect(within(link1).getByText('1'));

    const link2 = screen.getByRole('link', { name: /status 2/ });
    expect(link2).toHaveAttribute('href', '/url-for-test&status=status 2');
    expect(within(link2).getByText('3'));

    const link3 = screen.getByRole('link', { name: /status 3/ });
    expect(link3).toHaveAttribute('href', '/url-for-test&status=status 3');
    expect(within(link3).getByText('1'));

    await user.click(button);

    expect(screen.queryByText('status 1')).not.toBeInTheDocument();
  });

  it('should link directly to search page when not isCollapsable', async () => {
    renderWithRouter(
      <StatusGroup
        label="Test Group"
        groupStatusKey="status 1"
        groupKey="test-group"
        baseUrl="url-for-test"
        isCollapsable={false}
        statuses={[Map({ key: 'status 1', doc_count: 1 })]}
      />
    );

    const link = screen.getByRole('link', { name: /Test Group/ });
    expect(link).toHaveAttribute('href', '/url-for-test&status=status 1');
  });
});
