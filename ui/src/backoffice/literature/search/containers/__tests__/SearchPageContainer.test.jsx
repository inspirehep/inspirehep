import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import { fromJS } from 'immutable';
import userEvent from '@testing-library/user-event';

import { getStore } from '../../../../../fixtures/store';
import SearchPageContainer from '../SearchPageContainer';
import { BACKOFFICE_LITERATURE_SEARCH } from '../../../../../common/routes';
import { renderWithProviders } from '../../../../../fixtures/render';
import { BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR } from '../../../../../actions/actionTypes';
import { BACKOFFICE_LITERATURE_SEARCH_NS } from '../../../../../search/constants';
import { initialState as searchInitialState } from '../../../../../reducers/search';
import { initialState as backofficeInitialState } from '../../../../../reducers/backoffice';
import { WorkflowStatuses, WorkflowTypes } from '../../../../constants';
import {
  resolveLiteratureAction,
  resolveLiteratureBatchAction,
  clearBackofficeBatchSubmittedIds,
} from '../../../../../actions/backoffice';

jest.mock('../../../../../actions/backoffice', () => {
  const actual = jest.requireActual('../../../../../actions/backoffice');
  return {
    ...actual,
    resolveLiteratureAction: jest.fn(),
    resolveLiteratureBatchAction: jest.fn(),
    clearBackofficeBatchSubmittedIds: jest.fn(),
  };
});

const baseSearchQuery = {
  page: '1',
  size: '10',
  ordering: '-_updated_at',
};

const buildSearchState = ({ status, results }) =>
  searchInitialState
    .setIn(
      ['namespaces', BACKOFFICE_LITERATURE_SEARCH_NS, 'query'],
      fromJS({
        ...baseSearchQuery,
        status,
      })
    )
    .setIn(
      ['namespaces', BACKOFFICE_LITERATURE_SEARCH_NS, 'results'],
      fromJS(results)
    )
    .setIn(
      ['namespaces', BACKOFFICE_LITERATURE_SEARCH_NS, 'total'],
      results.length
    );

const buildLiteratureResult = (id, status = WorkflowStatuses.APPROVAL) => ({
  id,
  workflow_type: WorkflowTypes.HEP_CREATE,
  status,
  data: {
    titles: [{ title: `Example title ${id}` }],
    inspire_categories: [{ term: 'hep-th' }],
    acquisition_source: {
      datetime: '2025-01-07T16:29:31.315971',
      email: 'john.doe@cern.ch',
      source: 'submitter2',
    },
  },
});

describe('SearchPageContainer', () => {
  const store = getStore({
    backoffice: fromJS({
      loading: false,
      loggedIn: true,
      query: {},
      totalResults: 15,
    }),
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    resolveLiteratureAction.mockImplementation((...args) => ({
      type: 'resolveLiteratureAction',
      payload: args,
    }));
    resolveLiteratureBatchAction.mockImplementation((...args) => ({
      type: 'resolveLiteratureBatchAction',
      payload: args,
    }));
    clearBackofficeBatchSubmittedIds.mockImplementation(() => ({
      type: BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR,
    }));
  });

  const renderComponent = (inputStore) =>
    renderWithProviders(<SearchPageContainer />, {
      route: BACKOFFICE_LITERATURE_SEARCH,
      store: inputStore,
    });

  it('renders the SearchPage component', () => {
    const { getByTestId, asFragment } = renderComponent(store);

    const searchPage = getByTestId('backoffice-search-page');

    expect(searchPage).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('dispatches clear batch submitted ids on mount', async () => {
    renderComponent(store);

    await waitFor(() => {
      expect(store.getActions()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: BACKOFFICE_BATCH_SUBMITTED_IDS_CLEAR,
          }),
        ])
      );
    });
  });

  it('shows decision submitted on row when id exists in batchSubmittedIds', () => {
    const searchState = buildSearchState({
      status: WorkflowStatuses.APPROVAL,
      results: [buildLiteratureResult('456')],
    });

    const storeWithBatchSubmittedId = getStore({
      search: searchState,
      backoffice: backofficeInitialState.set(
        'batchSubmittedIds',
        fromJS(['456'])
      ),
    });

    renderComponent(storeWithBatchSubmittedId);

    expect(screen.getByText('Decision submitted.')).toBeInTheDocument();
  });

  it('shows select all for selectable statuses', () => {
    const selectableStore = getStore({
      search: buildSearchState({
        status: WorkflowStatuses.APPROVAL,
        results: [buildLiteratureResult('1')],
      }),
    });
    renderComponent(selectableStore);
    expect(
      screen.getByRole('checkbox', { name: 'Select all workflows' })
    ).toBeInTheDocument();
  });

  it('does not show select all for non-selectable statuses', () => {
    const nonSelectableStore = getStore({
      search: buildSearchState({
        status: WorkflowStatuses.COMPLETED,
        results: [buildLiteratureResult('2', WorkflowStatuses.COMPLETED)],
      }),
    });
    renderComponent(nonSelectableStore);
    expect(
      screen.queryByRole('checkbox', { name: 'Select all workflows' })
    ).not.toBeInTheDocument();
  });

  it('select all toggles current page row checkboxes', async () => {
    const user = userEvent.setup();
    const interactiveStore = getStore({
      search: buildSearchState({
        status: WorkflowStatuses.APPROVAL,
        results: [buildLiteratureResult('a'), buildLiteratureResult('b')],
      }),
    });

    renderComponent(interactiveStore);

    const selectAll = screen.getByRole('checkbox', {
      name: 'Select all workflows',
    });
    const rowA = screen.getByRole('checkbox', { name: 'Select workflow a' });
    const rowB = screen.getByRole('checkbox', { name: 'Select workflow b' });

    expect(rowA).not.toBeChecked();
    expect(rowB).not.toBeChecked();

    await user.click(selectAll);
    expect(rowA).toBeChecked();
    expect(rowB).toBeChecked();

    await user.click(rowA);
    expect(rowA).not.toBeChecked();
    expect(rowB).toBeChecked();

    await user.click(selectAll);
    expect(rowA).toBeChecked();
    expect(rowB).toBeChecked();

    await user.click(selectAll);
    expect(rowA).not.toBeChecked();
    expect(rowB).not.toBeChecked();
  });

  it('dispatches batch resolve with selected ids', async () => {
    const user = userEvent.setup();
    const interactiveStore = getStore({
      search: buildSearchState({
        status: WorkflowStatuses.APPROVAL,
        results: [buildLiteratureResult('x'), buildLiteratureResult('y')],
      }),
    });

    renderComponent(interactiveStore);

    await user.click(
      screen.getByRole('checkbox', { name: 'Select all workflows' })
    );

    const batchCardTitle = screen.getByText(
      'Batch operations on 2 selected records.'
    );
    const batchCard = batchCardTitle.closest('.ant-card');
    expect(batchCard).toBeInTheDocument();

    await user.click(within(batchCard).getByRole('button', { name: 'Accept' }));

    expect(resolveLiteratureBatchAction).toHaveBeenCalledWith({
      action: 'hep_accept',
      ids: ['x', 'y'],
    });
  });

  it('shows batch operations card only when at least one workflow is selected', async () => {
    const user = userEvent.setup();
    const interactiveStore = getStore({
      search: buildSearchState({
        status: WorkflowStatuses.APPROVAL,
        results: [buildLiteratureResult('solo')],
      }),
    });

    renderComponent(interactiveStore);

    expect(
      screen.queryByText('Batch operations on 1 selected records.')
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('checkbox', { name: 'Select workflow solo' })
    );
    expect(
      screen.getByText('Batch operations on 1 selected records.')
    ).toBeInTheDocument();
  });

  it('dispatches single resolve action for workflow row action button', async () => {
    const user = userEvent.setup();
    const interactiveStore = getStore({
      search: buildSearchState({
        status: WorkflowStatuses.APPROVAL,
        results: [buildLiteratureResult('single')],
      }),
    });

    renderComponent(interactiveStore);

    await user.click(screen.getByRole('button', { name: 'Accept' }));

    expect(resolveLiteratureAction).toHaveBeenCalledWith('single', {
      action: 'hep_accept',
      value: undefined,
    });
  });
});
