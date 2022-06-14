import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import OrcidPushSettingContainer from '../OrcidPushSettingContainer';
import { USER_SET_ORCID_PUSH_SETTING_REQUEST } from '../../../actions/actionTypes';
import OrcidPushSetting from '../../components/OrcidPushSetting';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('OrcidPushSettingContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(OrcidPushSetting)).toHaveProp({
      isUpdating: false,
      enabled: true,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(store.getActions()).toEqual(expectedActions);
  });
});
