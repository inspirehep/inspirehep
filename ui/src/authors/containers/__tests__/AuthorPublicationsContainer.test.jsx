import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorPublicationsContainer from '../AuthorPublicationsContainer';
import LiteratureSearchContainer from '../../../literature/containers/LiteratureSearchContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../../reducers/search';

describe('AuthorPublicationsContainer', () => {
  it('passes all props to LiteratureSearchContainer', () => {
    const store = getStoreWithState({
      authors: fromJS({
        data: {
          metadata: {
            facet_author_name: '1234_ThatDude',
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorPublicationsContainer />
      </Provider>
    );

    expect(wrapper.find(LiteratureSearchContainer)).toHaveProp({
      namespace: AUTHOR_PUBLICATIONS_NS,
      baseQuery: {
        author: ['1234_ThatDude'],
      },
      baseAggregationsQuery: {
        author_recid: '1234_ThatDude',
      },
    });
  });
});
