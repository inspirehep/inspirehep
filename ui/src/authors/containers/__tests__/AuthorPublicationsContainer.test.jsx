import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorPublicationsContainer from '../AuthorPublicationsContainer';
import EmbeddedSearch from '../../../common/components/EmbeddedSearch';
import {
  AUTHOR_PUBLICATIONS_REQUEST,
  AUTHOR_PUBLICATIONS_FACETS_REQUEST,
  CITATIONS_SUMMARY_REQUEST,
} from '../../../actions/actionTypes';

describe('AuthorPublicationsContainer', () => {
  it('passes all props to embedded search', () => {
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: { size: 10, page: 2, q: 'dude' },
          results: [{ control_number: 1 }, { control_number: 2 }],
          aggregations: { agg1: { foo: 'bar' } },
          loadingResults: true,
          loadingAggregations: true,
          numberOfResults: 50,
          error: { message: 'Error' },
        },
      }),
    });
    const wrapper = shallow(
      <AuthorPublicationsContainer store={store} renderResultItem={jest.fn()} />
    ).dive();

    expect(wrapper).toMatchSnapshot();
  });

  // FIXME: avoid also testing that actions merging newQuery and state query
  it('dispatches fetch author publications and facets, and new citation summary onQueryChange', () => {
    const existingQuery = { page: 3, size: 10, author: ['Harun'] };
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
      <AuthorPublicationsContainer store={store} renderResultItem={jest.fn()} />
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
      {
        type: CITATIONS_SUMMARY_REQUEST,
      },
    ];
    const actions = store.getActions().slice(0, 3); // slice to assert only REQUEST actions
    expect(actions).toEqual(expectedActions);
  });
});
