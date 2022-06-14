import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import GuideModalContainer from '../GuideModalContainer';
import GuideModal from '../../components/GuideModal';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('GuideModalContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes visibility to GuideModal', () => {
    const store = getStoreWithState({
      ui: fromJS({
        guideModalVisibility: false,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <GuideModalContainer />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(GuideModal)).toHaveProp({ visible: false });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('dispatches UI_CHANGE_GUIDE_MODAL_VISIBILITY with false, on modal cancel', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <GuideModalContainer />
      </Provider>
    );
    const onCancel = wrapper.find(GuideModal).prop('onCancel');
    onCancel();
    const expectedActions = [
      {
        type: UI_CHANGE_GUIDE_MODAL_VISIBILITY,
        payload: { visibility: false },
      },
    ];
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
