import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import Loadable from 'react-loadable';
import { fromJS } from 'immutable';
import { getStore } from '../../fixtures/store';
import Experiments from '..';

describe('Experiments', () => {
  it('renders initial state', () => {
    const { asFragment } = render(
      <MemoryRouter>
        <Experiments />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /experiments/:id', async () => {
    const store = getStore({
      experiments: fromJS({
        data: {
          metadata: {
            legacy_name: 'Atlas',
            control_number: 1234,
          },
        },
      }),
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/experiments/123']} initialIndex={0}>
          <Experiments />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      getByTestId('experiments-detail-page-container')
    ).toBeInTheDocument();
  });

  it('contains all the required links in the DetailPageContainer', async () => {
    const store = getStore({
      experiments: fromJS({
        data: {
          metadata: {
            legacy_name: 'Atlas',
            control_number: 1234,
            collaboration: { value: 'CERN-LHC-ATLAS' },
          },
        },
      }),
    });

    const { getByRole } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/experiments/123']} initialIndex={0}>
          <Experiments />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    const experimentCollaboration = getByRole('link', {
      name: 'CERN-LHC-ATLAS',
    });
    expect(experimentCollaboration).toBeInTheDocument();
    expect(experimentCollaboration).toHaveAttribute(
      'href',
      '/literature?q=collaboration:CERN-LHC-ATLAS'
    );

    const experimentAssociatedArticlesLink = getByRole('link', {
      name: 'Articles associated with Atlas',
    });
    expect(experimentAssociatedArticlesLink).toBeInTheDocument();
    expect(experimentAssociatedArticlesLink).toHaveAttribute(
      'href',
      '/literature?q=accelerator_experiments.record.$ref:1234'
    );

    const experimentCollaborationArticlesLink = getByRole('link', {
      name: 'Collaboration articles',
    });
    expect(experimentCollaborationArticlesLink).toBeInTheDocument();
    expect(experimentCollaborationArticlesLink).toHaveAttribute(
      'href',
      '/literature?q=collaboration:CERN-LHC-ATLAS'
    );

    const experimentCollaborationMembersLink = getByRole('link', {
      name: 'Collaboration members',
    });
    expect(experimentCollaborationMembersLink).toBeInTheDocument();
    expect(experimentCollaborationMembersLink).toHaveAttribute(
      'href',
      '/authors?q=project_membership.record.$ref:1234'
    );
  });

  it('contains all the required dates in the DetailPageContainer', async () => {
    const store = getStore({
      experiments: fromJS({
        data: {
          metadata: {
            legacy_name: 'Atlas',
            control_number: 1234,
            date_proposed: '1984-02-01',
            date_approved: '1984-02-02',
            date_started: '1984-02-03',
            date_cancelled: '1984-02-04',
            date_completed: '1984-02-05',
          },
        },
      }),
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/experiments/123']} initialIndex={0}>
          <Experiments />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    const experimentDetailPage = getByTestId(
      'experiments-detail-page-container'
    );
    expect(experimentDetailPage).toHaveTextContent('Proposed: Feb 1, 1984');
    expect(experimentDetailPage).toHaveTextContent('Approved: Feb 2, 1984');
    expect(experimentDetailPage).toHaveTextContent('Started: Feb 3, 1984');
    expect(experimentDetailPage).toHaveTextContent('Cancelled: Feb 4, 1984');
    expect(experimentDetailPage).toHaveTextContent('Completed: Feb 5, 1984');
  });

  it('navigates to SearchPage when /experiments', async () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/experiments']} initialIndex={0}>
          <Experiments />
        </MemoryRouter>
      </Provider>
    );
    await Loadable.preloadAll();

    expect(
      getByTestId('experiments-search-page-container')
    ).toBeInTheDocument();
  });
});
