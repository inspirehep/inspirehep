import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import NumberOfCiteablePapersContainer from '../NumberOfCiteablePapersContainer';
import { SEARCH_QUERY_UPDATE } from '../../../actions/actionTypes';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import LinkLikeButton from '../../../common/components/LinkLikeButton';
import { CITEABLE_QUERY } from '../../../common/constants';

describe('NumberOfCiteablePapersContainer', () => {
  it('dispatches SEARCH_QUERY_UPDATE on click', () => {
    const store = getStore();
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const wrapper = mount(
      <Provider store={store}>
        <NumberOfCiteablePapersContainer>30</NumberOfCiteablePapersContainer>
      </Provider>
    );
    wrapper.find(LinkLikeButton).simulate('click');
    const expectedActions = [
      {
        type: SEARCH_QUERY_UPDATE,
        payload: { namespace, query: { page: '1', ...CITEABLE_QUERY } },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
