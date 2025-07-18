import React from 'react';

import { getStore } from '../../../fixtures/store';
import NumberOfCiteablePapersContainer from '../NumberOfCiteablePapersContainer';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { CITEABLE_QUERY } from '../../../common/constants';
import { renderWithProviders } from '../../../fixtures/render';

describe('NumberOfCiteablePapersContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE on click', () => {
    const store = getStore();
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const { getByRole } = renderWithProviders(
      <NumberOfCiteablePapersContainer>30</NumberOfCiteablePapersContainer>,
      { store }
    );
    getByRole('button').click();
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace, query: { page: '1', ...CITEABLE_QUERY } },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
