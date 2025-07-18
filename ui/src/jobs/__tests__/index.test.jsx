import React from 'react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../fixtures/render';
import Jobs from '..';

describe('Jobs', () => {
  it('navigates to DetailPageContainer when /jobs/:id', async () => {
    const initialState = {
      jobs: fromJS({
        data: {
          metadata: {
            position: 'Postdoctoral position in the NEWS-G experiment',
            control_number: 2904369,
            deadline_date: '2025-07-01',
          },
          created: '2025-03-26T16:25:11.340978+00:00',
          updated: '2025-03-26T16:25:11.340978+00:00',
        },
      }),
    };
    const { getByTestId } = renderWithProviders(<Jobs />, {
      route: '/jobs/123',
      initialState,
    });
    await Loadable.preloadAll();

    expect(getByTestId('jobs-detail-page-container')).toBeInTheDocument();
  });

  it('navigates to SearchPage when /jobs', async () => {
    const { getByTestId } = renderWithProviders(<Jobs />, {
      route: '/jobs',
    });
    await Loadable.preloadAll();

    expect(getByTestId('jobs-search-page-container')).toBeInTheDocument();
  });
});
