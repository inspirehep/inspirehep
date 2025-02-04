import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import AuthorDataContainer from '../AuthorDataContainer';
import { getStore } from '../../../fixtures/store';
import DataSearchPageContainer from '../../../data/containers/DataSearchPageContainer';
import { AUTHOR_DATA_NS } from '../../../search/constants';
import { SEARCH_BASE_QUERIES_UPDATE } from '../../../actions/actionTypes';

jest.mock('../../../data/containers/DataSearchPageContainer', () =>
  jest.fn(() => <div>Data Search Page</div>)
);

describe('AuthorDataContainer', () => {
  const store = getStore({
    authors: fromJS({
      data: {
        metadata: {
          facet_author_name: '1234_ThatDude',
        },
      },
    }),
  });

  it('renders DataSearchPageContainer with correct namespace', () => {
    render(
      <Provider store={store}>
        <AuthorDataContainer />
      </Provider>
    );

    expect(DataSearchPageContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: AUTHOR_DATA_NS,
      }),
      {}
    );
  });

  it('dispatches onBaseQueriesChange on mount', () => {
    render(
      <Provider store={store}>
        <AuthorDataContainer />
      </Provider>
    );

    expect(store.getActions()[0]).toEqual({
      payload: {
        baseAggregationsQuery: undefined,
        baseQuery: {
          author: ['1234_ThatDude'],
        },
        namespace: AUTHOR_DATA_NS,
      },
      type: SEARCH_BASE_QUERIES_UPDATE,
    });
  });
});
