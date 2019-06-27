import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import { userLogin } from '../../../actions/user';
import LoginPageContainer from '../LoginPageContainer';
import LoginPage from '../../components/LoginPage';

jest.mock('../../../actions/user');
userLogin.mockReturnValue(async () => {});

describe('LoginPageContainer', () => {
  it('calls userLogin onLoginClick', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <LoginPageContainer />
      </Provider>
    );
    const onLoginClick = wrapper.find(LoginPage).prop('onLoginClick');
    onLoginClick();
    expect(userLogin).toHaveBeenCalledTimes(1);
  });
});
