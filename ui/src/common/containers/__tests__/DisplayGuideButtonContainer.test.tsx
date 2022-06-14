import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import DisplayGuideButtonContainer from '../DisplayGuideButtonContainer';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';
import LinkLikeButton from '../../components/LinkLikeButton';

describe('DisplayGuideButtonContainer', () => {
  it('dispatches UI_CHANGE_GUIDE_MODAL_VISIBILITY with true, on button click', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <DisplayGuideButtonContainer>
          Display the guide!!!!
        </DisplayGuideButtonContainer>
      </Provider>
    );
    const onClick = wrapper.find(LinkLikeButton).prop('onClick');
    onClick();
    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility: true },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
