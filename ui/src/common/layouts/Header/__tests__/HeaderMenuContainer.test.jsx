import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../../fixtures/store';
import HeaderMenuContainer from '../HeaderMenuContainer';
import HeaderMenu from '../HeaderMenu';

describe('HeaderMenuContainer', () => {
  it('passes props from state', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          profile_control_number: '1010819',
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <HeaderMenuContainer />
      </Provider>
    );
    expect(wrapper.find(HeaderMenu)).toHaveProp({
      loggedIn: true,
      profileControlNumber: '1010819',
    });
  });
});
