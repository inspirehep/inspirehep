import React from 'react';
import { render, within } from '@testing-library/react';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import LoginPageContainer from '../LoginPageContainer';

describe('LoginPageContainer', () => {
  it('passes props from state', () => {
    const store = getStore({
      router: {
        location: {
          previousUrl: '/jobs?q=cern',
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <LoginPageContainer />
      </Provider>
    );

    const loginPage = getByTestId('login-page');
    const button = within(loginPage).getByTestId('login-button');
    expect(button).toHaveAttribute(
      'href',
      `/api/accounts/login?next=/jobs?q=cern`
    );
  });
});
