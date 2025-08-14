import React from 'react';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import { AUTHOR_CITATIONS_NS } from '../../../search/constants';
import AuthorCitationsContainer from '../AuthorCitationsContainer';
import LiteratureSearchContainer from '../../../literature/containers/LiteratureSearchContainer';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('../../../literature/containers/LiteratureSearchContainer', () =>
  jest.fn(() => <div data-testid="literature-citations-search-container" />)
);

describe('AuthorCitationsContainer', () => {
  it('passes all props to LiteratureSearchContainer', () => {
    const store = getStore({
      authors: fromJS({
        data: {
          metadata: {
            bai: 'T.Dude.1',
          },
        },
      }),
    });

    renderWithProviders(<AuthorCitationsContainer />, { store });

    expect(LiteratureSearchContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: AUTHOR_CITATIONS_NS,
        baseQuery: { q: 'refersto a T.Dude.1' },
      }),
      {}
    );
  });
});
