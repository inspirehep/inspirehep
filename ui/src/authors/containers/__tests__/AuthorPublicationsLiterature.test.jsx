import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { render } from '@testing-library/react';
import { getStore } from '../../../fixtures/store';
import AuthorPublicationsContainer from '../AuthorPublicationsContainer';
import LiteratureSearchContainer from '../../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { initialState } from '../../../reducers/authors';

jest.mock('../../../literature/containers/LiteratureSearchContainer', () =>
  jest.fn(() => <div data-testid="literature-search-container" />)
);

describe('AuthorPublicationsContainer with LiteratureSearchContainer mocked', () => {
  it('passes all props to LiteratureSearchContainer', () => {
    const store = getStore({
      authors: fromJS({
        ...initialState,
        publicationSelection: {},
        publicationSelectionUnclaimed: [],
        publicationSelectionClaimed: [],
        data: {
          metadata: {
            facet_author_name: '1234_ThatDude',
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <AuthorPublicationsContainer />
      </Provider>
    );

    expect(LiteratureSearchContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: AUTHOR_PUBLICATIONS_NS,
        baseQuery: {
          author: ['1234_ThatDude'],
        },
        baseAggregationsQuery: {
          author_recid: '1234_ThatDude',
        },
        numberOfSelected: 0,
      }),
      {}
    );
  });
});
