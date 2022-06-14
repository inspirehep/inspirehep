import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import LoginPageContainer from '../LoginPageContainer';
import LoginPage from '../../components/LoginPage';

describe('LoginPageContainer', () => {
  it('passes props from state', () => {
    const store = getStoreWithState({
      router: {
        location: {
          previousUrl: '/jobs?q=cern',
        },
      },
    });

    const wrapper = mount(
      <Provider store={store}>
        <LoginPageContainer />
      </Provider>
    );

    const dummyWrapper = wrapper.find(LoginPageContainer);

    expect(dummyWrapper.find(LoginPage)).toHaveProp({
      previousUrl: '/jobs?q=cern',
    });
  });
});
