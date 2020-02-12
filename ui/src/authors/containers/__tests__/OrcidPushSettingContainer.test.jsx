import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import OrcidPushSettingContainer from '../OrcidPushSettingContainer';
import { USER_SET_ORCID_PUSH_SETTING_REQUEST } from '../../../actions/actionTypes';
import OrcidPushSetting from '../../components/OrcidPushSetting';

describe('OrcidPushSettingContainer', () => {
  it('passes state to props', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          allow_orcid_push: true,
          orcid: '0000-0001-8058-0014',
        },
        isUpdatingOrcidPushSetting: false,
      }),
      authors: fromJS({
        data: {
          metadata: {
            control_number: 1,
            bai: 'Author.1.E',
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <OrcidPushSettingContainer />
      </Provider>
    );
    expect(wrapper.find(OrcidPushSetting)).toHaveProp({
      isUpdating: false,
      enabled: true,
      authorBAI: 'Author.1.E',
    });
  });

  it('dispatches USER_SET_ORCID_PUSH_SETTING_REQUEST on change', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          allow_orcid_push: true,
          orcid: '0000-0001-8058-0014',
        },
        isUpdatingOrcidPushSetting: false,
      }),
      authors: fromJS({
        data: {
          metadata: {
            control_number: 1,
            bai: 'Author.1.E',
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <OrcidPushSettingContainer />
      </Provider>
    );
    const onSettingChange = wrapper.find(OrcidPushSetting).prop('onChange');
    const settingValue = false;
    onSettingChange(settingValue);
    const expectedActions = [
      {
        type: USER_SET_ORCID_PUSH_SETTING_REQUEST,
        payload: { value: settingValue },
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
