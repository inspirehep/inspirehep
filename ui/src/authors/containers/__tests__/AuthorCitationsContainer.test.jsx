import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import LiteratureSearchContainer from '../../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_CITATIONS_NS } from '../../../search/constants';
import AuthorCitationsContainer from '../AuthorCitationsContainer';

describe('AuthorCitationsContainer', () => {
  it('passes all props to LiteratureSearchContainer', () => {
    const store = getStoreWithState({
      authors: fromJS({
        data: {
          metadata: {
            bai: 'T.Dude.1',
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorCitationsContainer />
      </Provider>
    );

    expect(wrapper.find(LiteratureSearchContainer)).toHaveProp({
      namespace: AUTHOR_CITATIONS_NS,
      baseQuery: {
        q: 'refersto a T.Dude.1',
      },
    });
  });
});
