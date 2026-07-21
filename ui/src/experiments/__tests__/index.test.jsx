import { fromJS } from 'immutable';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Experiments from '..';
import { EXPERIMENTS } from '../../common/routes';

const renderExperiments = (route, initialState) =>
  renderWithProviders(
    <Routes>
      <Route path={`${EXPERIMENTS}/*`} element={<Experiments />} />
    </Routes>,
    { initialState, route }
  );

describe('Experiments', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Experiments />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to DetailPageContainer when /experiments/:id', () => {
    const initialState = {
      experiments: fromJS({
        data: {
          metadata: {
            legacy_name: 'Atlas',
            control_number: 1234,
          },
        },
      }),
    };

    const { getByTestId } = renderExperiments('/experiments/123', initialState);

    expect(
      getByTestId('experiments-detail-page-container')
    ).toBeInTheDocument();
  });

  it('contains all the required links in the DetailPageContainer', () => {
    const initialState = {
      experiments: fromJS({
        data: {
          metadata: {
            legacy_name: 'Atlas',
            control_number: 1234,
            collaboration: { value: 'CERN-LHC-ATLAS' },
          },
        },
      }),
    };

    const { getByRole } = renderExperiments('/experiments/123', initialState);

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

  it('contains all the required dates in the DetailPageContainer', () => {
    const initialState = {
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
    };

    const { getByTestId } = renderExperiments('/experiments/123', initialState);

    const experimentDetailPage = getByTestId(
      'experiments-detail-page-container'
    );
    expect(experimentDetailPage).toHaveTextContent('Proposed: Feb 1, 1984');
    expect(experimentDetailPage).toHaveTextContent('Approved: Feb 2, 1984');
    expect(experimentDetailPage).toHaveTextContent('Started: Feb 3, 1984');
    expect(experimentDetailPage).toHaveTextContent('Cancelled: Feb 4, 1984');
    expect(experimentDetailPage).toHaveTextContent('Completed: Feb 5, 1984');
  });

  it('navigates to SearchPage when /experiments', () => {
    const { getByTestId } = renderExperiments('/experiments');

    expect(
      getByTestId('experiments-search-page-container')
    ).toBeInTheDocument();
  });
});
