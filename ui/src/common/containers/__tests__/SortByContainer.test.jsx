import { waitFor, fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../fixtures/render';
import { getStore, mockActionCreator } from '../../../fixtures/store';
import SortByContainer from '../SortByContainer';
import { LITERATURE_NS } from '../../../search/constants';
import { searchQueryUpdate } from '../../../actions/search';

jest.mock('../../../actions/search');
mockActionCreator(searchQueryUpdate);

describe('SortByContainer', () => {
  it('passes namespace query sort param to SortBy', () => {
    const namespace = LITERATURE_NS;
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostrecent' },
            sortOptions: ['mostrecent', 'mostcited'],
          },
        },
      }),
    });
    const { getByText } = renderWithProviders(
      <SortByContainer namespace={namespace} />,
      {
        store,
      }
    );
    expect(getByText('mostrecent')).toBeInTheDocument();
  });

  it('dispatches SEARCH_QUERY_UPDATE on sort change', async () => {
    const namespace = LITERATURE_NS;
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostcited' },
            sortOptions: [
              { value: 'mostrecent', display: 'Most Recent' },
              { value: 'mostcited', display: 'Most Cited' },
            ],
          },
        },
      }),
    });

    const user = userEvent.setup();

    const screen = renderWithProviders(
      <SortByContainer namespace={namespace} />,
      {
        store,
      }
    );

    await user.click(screen.getByRole('combobox'));
    await waitFor(() => {
      screen.getByText('Most Recent');
    });
    fireEvent.click(screen.getByText('Most Recent'));

    const expectedActions = [
      searchQueryUpdate(namespace, { sort: 'mostrecent', page: '1' }),
    ];

    expect(store.getActions()).toEqual(expectedActions);
  });
});
