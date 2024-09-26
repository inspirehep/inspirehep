import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import GuideModalContainer from '../GuideModalContainer';
import GuideModal from '../../components/GuideModal';
import { UI_CHANGE_GUIDE_MODAL_VISIBILITY } from '../../../actions/actionTypes';

describe('GuideModalContainer', () => {
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
    expect(wrapper.find(GuideModal)).toHaveProp({ visible: false });
  });

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
    expect(store.getActions()).toEqual(expectedActions);
  });
});
