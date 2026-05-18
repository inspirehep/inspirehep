import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fromJS, Map } from 'immutable';

import { getStore } from '../../../../fixtures/store';
import {
  initialState as userInitialState,
  BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE,
} from '../../../../reducers/user';
import DashboardPageContainer from '../DashboardPageContainer';
import { BACKOFFICE } from '../../../../common/routes';
import {
  BACKOFFICE_LOGIN_CHECK,
  USER_SET_PREFERENCE,
} from '../../../../actions/actionTypes';
import { WorkflowStatuses, WorkflowTypes } from '../../../constants';
import { renderWithProviders } from '../../../../fixtures/render';

describe('DashboardPageContainer', () => {
  let store = getStore({
    backoffice: fromJS({
      loading: false,
      loggedIn: true,
      query: {},
      facets: fromJS({
        _filter_workflow_type: fromJS({
          workflow_type: fromJS({
            buckets: fromJS([
              {
                key: WorkflowTypes.AUTHOR_CREATE,
                doc_count: 3,
                status: [{ key: WorkflowStatuses.ERROR }],
              },
              {
                key: WorkflowTypes.AUTHOR_UPDATE,
                doc_count: 7,
              },
              {
                key: WorkflowTypes.HEP_CREATE,
                doc_count: 5,
              },
              {
                key: WorkflowTypes.HEP_PUBLISHER_CREATE,
                doc_count: 2,
              },
              {
                key: WorkflowTypes.HEP_PUBLISHER_UPDATE,
                doc_count: 1,
              },
            ]),
          }),
        }),
        _filter_status: fromJS({
          doc_count: 45,
          status: fromJS({
            buckets: fromJS([
              {
                key: WorkflowStatuses.APPROVAL,
                doc_count: 16,
              },
              {
                key: WorkflowStatuses.COMPLETED,
                doc_count: 9,
              },
              {
                key: WorkflowStatuses.ERROR,
                doc_count: 16,
              },
              {
                key: WorkflowStatuses.RUNNING,
                doc_count: 4,
              },
            ]),
          }),
        }),
      }),
      totalResults: 15,
    }),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    renderWithProviders(<DashboardPageContainer />, {
      store,
      route: BACKOFFICE,
    });

  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByTestId('backoffice-dashboard-page')).toBeInTheDocument();
  });

  it('renders the correct UI elements', () => {
    renderComponent();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders workflow cards in the preferred type order', () => {
    store = getStore({
      backoffice: fromJS({
        dashboard: {
          loading: false,
          facets: {
            authors: {
              _filter_workflow_type: {
                workflow_type: {
                  buckets: [
                    { key: WorkflowTypes.AUTHOR_UPDATE, doc_count: 1 },
                    { key: WorkflowTypes.AUTHOR_CREATE, doc_count: 1 },
                  ],
                },
              },
            },
            literature: {
              _filter_workflow_type: {
                workflow_type: {
                  buckets: [
                    { key: WorkflowTypes.HEP_SUBMISSION, doc_count: 1 },
                    { key: WorkflowTypes.HEP_PUBLISHER_UPDATE, doc_count: 1 },
                    { key: WorkflowTypes.HEP_CREATE, doc_count: 1 },
                    { key: WorkflowTypes.HEP_UPDATE, doc_count: 1 },
                    { key: WorkflowTypes.HEP_PUBLISHER_CREATE, doc_count: 1 },
                  ],
                },
              },
            },
          },
        },
      }),
    });

    renderComponent();

    expect(
      screen
        .getAllByRole('link', { name: /view all/i })
        .map((link) => (link as HTMLAnchorElement).href)
    ).toEqual([
      expect.stringContaining(`workflow_type=${WorkflowTypes.AUTHOR_CREATE}`),
      expect.stringContaining(`workflow_type=${WorkflowTypes.AUTHOR_UPDATE}`),
      expect.stringContaining(`workflow_type=${WorkflowTypes.HEP_CREATE}`),
      expect.stringContaining(`workflow_type=${WorkflowTypes.HEP_UPDATE}`),
      expect.stringContaining(
        `workflow_type=${WorkflowTypes.HEP_PUBLISHER_CREATE}`
      ),
      expect.stringContaining(
        `workflow_type=${WorkflowTypes.HEP_PUBLISHER_UPDATE}`
      ),
      expect.stringContaining(`workflow_type=${WorkflowTypes.HEP_SUBMISSION}`),
    ]);
  });

  it('dispatches isUserLoggedInToBackoffice on mount', () => {
    renderComponent();

    expect(store.getActions()[0]).toEqual({
      type: BACKOFFICE_LOGIN_CHECK,
    });
    expect(store.getActions()[1]).toEqual({
      type: BACKOFFICE_LOGIN_CHECK,
    });
  });

  it('shows loading spinner when loading is true', () => {
    store = getStore({
      backoffice: fromJS({
        dashboard: {
          loading: true,
        },
      }),
    });

    renderComponent();

    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  describe('CollapseButton', () => {
    const GROUP_KEY = 'new authors-failed';

    const getCollapseBackofficeState = () =>
      fromJS({
        dashboard: {
          loading: false,
          facets: {
            authors: {
              _filter_workflow_type: {
                workflow_type: {
                  buckets: [
                    {
                      key: WorkflowTypes.AUTHOR_CREATE,
                      doc_count: 3,
                      status: {
                        buckets: [
                          { key: WorkflowStatuses.ERROR, doc_count: 3 },
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      });

    const getCollapseStore = (
      initialCollapseMap: Record<string, boolean> = {}
    ) =>
      getStore({
        backoffice: getCollapseBackofficeState(),
        user: (userInitialState as Map<string, any>).setIn(
          ['preferences', BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE],
          fromJS(initialCollapseMap)
        ),
      });

    const renderCollapseComponent = (
      initialCollapseMap: Record<string, boolean> = {}
    ) =>
      renderWithProviders(<DashboardPageContainer />, {
        store: getCollapseStore(initialCollapseMap),
        route: BACKOFFICE,
      });

    it('should dispatch setPreference to collapse all groups on Collapse All click', async () => {
      const user = userEvent.setup();

      const { store: collapseStore } = renderCollapseComponent({
        [GROUP_KEY]: true,
      });

      await user.click(
        await screen.findByRole('button', { name: 'Collapse all' })
      );

      const prefAction = collapseStore
        .getActions()
        .find((a: any) => a.type === USER_SET_PREFERENCE);
      expect(prefAction?.payload.name).toBe(
        BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE
      );
      expect(prefAction?.payload.value.toJS()).toEqual({ [GROUP_KEY]: false });
    });

    it('should dispatch setPreference to expand all groups on Expand All click', async () => {
      const user = userEvent.setup();

      const { store: collapseStore } = renderCollapseComponent();

      await user.click(
        await screen.findByRole('button', { name: 'Expand all' })
      );

      const prefAction = collapseStore
        .getActions()
        .find((a: any) => a.type === USER_SET_PREFERENCE);
      expect(prefAction?.payload.name).toBe(
        BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE
      );
      expect(prefAction?.payload.value.toJS()).toEqual({ [GROUP_KEY]: true });
    });

    it('should dispatch setPreference when individual group collapse button is clicked', async () => {
      const user = userEvent.setup();

      const { store: collapseStore } = renderCollapseComponent();

      await user.click(screen.getByTestId(`collapse-button-${GROUP_KEY}`));

      const prefAction = collapseStore
        .getActions()
        .find((a: any) => a.type === USER_SET_PREFERENCE);
      expect(prefAction?.payload.name).toBe(
        BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE
      );
      expect(prefAction?.payload.value.toJS()).toEqual({ [GROUP_KEY]: true });
    });
  });
});
