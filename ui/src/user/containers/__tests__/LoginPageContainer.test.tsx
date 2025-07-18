import React from 'react';
import { within } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import LoginPageContainer from '../LoginPageContainer';
import { renderWithProviders } from '../../../fixtures/render';

describe('LoginPageContainer', () => {
  it('passes props from state', () => {
    const store = getStore({
      router: {
        location: {
          previousUrl: '/jobs?q=cern',
        },
      },
    });

    const { getByTestId } = renderWithProviders(<LoginPageContainer />, {
      store,
    });

    const loginPage = getByTestId('login-page');
    const button = within(loginPage).getByTestId('login-button');
    expect(button).toHaveAttribute(
      'href',
      `/api/accounts/login?next=/jobs?q=cern`
    );
  });
});
