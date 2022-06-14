import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import DisplayGuideButtonContainer from '../DisplayGuideButtonContainer';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';
import LinkLikeButton from '../../components/LinkLikeButton';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DisplayGuideButtonContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2571) FIXME: Object is of type 'unknown'.
    onClick();
    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility: true },
      },
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
