import React from 'react';
import { shallow, mount } from 'enzyme';
import { fromJS } from 'immutable';

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
  it('dispatches fetch author publications and facets onQueryChange', () => {
    const newQuery = { sort: 'mostcited' };
    const fullQuery = { page: 3, size: 10, sort: 'mostcited' };
    const store = getStoreWithState({
      authors: fromJS({
        publications: {
          query: { page: 3, size: 10 },
        },
      }),
    });
    const wrapper = mount(
      <AuthorPublicationsContainer store={store} renderResultItem={jest.fn()} />
    );
    wrapper.find(EmbeddedSearch).prop('onQueryChange')(newQuery);

    const expectedActions = [
      {
        type: AUTHOR_PUBLICATIONS_REQUEST,
        payload: fullQuery,
      },
      {
        type: AUTHOR_PUBLICATIONS_FACETS_REQUEST,
        payload: fullQuery,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
