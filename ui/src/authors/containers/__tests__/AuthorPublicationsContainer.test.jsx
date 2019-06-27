import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorPublicationsContainer from '../AuthorPublicationsContainer';
import EmbeddedSearch from '../../../common/components/EmbeddedSearch';
import {
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
} from '../../../actions/actionTypes';

describe('AuthorPublicationsContainer', () => {
  it('passes all props to embedded search', () => {
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
          results: [{ control_number: 1 }, { control_number: 2 }],
          aggregations: { agg1: { foo: 'bar' } },
          sortOptions: [{ value: 'mostrecent', display: 'Most Recent' }],
          loadingResults: true,
          loadingAggregations: true,
          total: 50,
          error: { message: 'Error' },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorPublicationsContainer renderResultItem={jest.fn()} />
      </Provider>
    );

    expect(wrapper.find(EmbeddedSearch)).toHaveProp({
      query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
      results: fromJS([{ control_number: 1 }, { control_number: 2 }]),
      aggregations: fromJS({ agg1: { foo: 'bar' } }),
      sortOptions: [{ value: 'mostrecent', display: 'Most Recent' }],
      loadingResults: true,
      loadingAggregations: true,
      numberOfResults: 50,
      error: fromJS({ message: 'Error' }),
    });
  });

  // FIXME: avoid also testing that actions merging newQuery and state query
  it('dispatches fetch author publications and facets onQueryChange', () => {
    const existingQuery = {
      page: 3,
      size: 10,
      author: ['Harun'],
      sort: 'mostrecent',
    };
    const queryChange = { sort: 'mostcited' };
    const newQuery = {
      page: 3,
      size: 10,
      sort: 'mostcited',
      author: ['Harun'],
    };
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: existingQuery,
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorPublicationsContainer renderResultItem={jest.fn()} />
      </Provider>
    );
    wrapper.find(EmbeddedSearch).prop('onQueryChange')(queryChange);

    const expectedActions = [
      {
        type: AUTHOR_PUBLICATIONS_REQUEST,
        payload: newQuery,
      },
      {
        type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
        payload: newQuery,
      },
    ];
    const actions = store.getActions().slice(0, 3); // slice to assert only REQUEST actions
    expect(actions).toEqual(expectedActions);
  });
});
