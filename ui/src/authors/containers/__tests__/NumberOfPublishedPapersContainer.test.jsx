import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import NumberOfPublishedPapersContainer from '../NumberOfPublishedPapersContainer';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { PUBLISHED_QUERY } from '../../../common/constants';

describe('NumberOfPublishedPapersContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE on click', () => {
    const store = getStore();
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const { getByRole } = render(
      <Provider store={store}>
        <NumberOfPublishedPapersContainer>30</NumberOfPublishedPapersContainer>
      </Provider>
    );
    getByRole('button').click();
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace, query: { page: '1', ...PUBLISHED_QUERY } },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
