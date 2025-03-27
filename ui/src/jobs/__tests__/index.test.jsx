import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Loadable from 'react-loadable';

import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { getStore } from '../../fixtures/store';
import Jobs from '..';

describe('Jobs', () => {
  it('navigates to DetailPageContainer when /jobs/:id', async () => {
    const store = getStore({
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
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/jobs/123']} initialIndex={0}>
          <Jobs />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(getByTestId('jobs-detail-page-container')).toBeInTheDocument();
  });

  it('navigates to SerachPage when /jobs', async () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/jobs']} initialIndex={0}>
          <Jobs />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(getByTestId('jobs-search-page-container')).toBeInTheDocument();
  });
});
