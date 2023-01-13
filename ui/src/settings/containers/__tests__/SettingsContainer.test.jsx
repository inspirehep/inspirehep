import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS, Map } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import SettingsContainer from '../SettingsContainer';
import SettingsPage from '../../components/SettingsPage';

describe('SettingsContainer', () => {
  it('passes props from state', () => {
    const store = getStoreWithState({
      settings: fromJS({
        changeEmailError: Map({ message: 'Error' }),
        changeEmailRequest: true,
      }),
      user: fromJS({
        data: {
          orcid: '123-aaa',
          email: 'test@o2.pl',
        }
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <SettingsContainer />
      </Provider>
    );

    const dummyWrapper = wrapper.find(SettingsContainer);

    expect(dummyWrapper.find(SettingsPage)).toHaveProp({
      loading: true,
      error: Map({ message: 'Error' }),
      userOrcid: '123-aaa',
      userEmail: 'test@o2.pl'
    });
  });
});
