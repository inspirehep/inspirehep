import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import OrcidPushSettingMessageContainer from '../OrcidPushSettingMessageContainer';
import OrcidPushSettingMessage from '../../components/OrcidPushSettingMessage';

describe('OrcidPushSettingMessageContainer', () => {
  it('passes state to props', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          allow_orcid_push: false,
          orcid: '0000-0001-8058-0014',
        },
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
        <OrcidPushSettingMessageContainer />
      </Provider>
    );
    expect(wrapper.find(OrcidPushSettingMessage)).toHaveProp({
      orcid: '0000-0001-8058-0014',
      enabled: false,
    });
  });
});
