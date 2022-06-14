import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import LoginPageContainer from '../LoginPageContainer';
import LoginPage from '../../components/LoginPage';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LoginPageContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(dummyWrapper.find(LoginPage)).toHaveProp({
      previousUrl: '/jobs?q=cern',
    });
  });
});
