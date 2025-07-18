import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';

import LocalLoginPageContainer from '../LocalLoginPageContainer';
import { getStore } from '../../../../fixtures/store';
import { BACKOFFICE_LOGIN } from '../../../../common/routes';
import { renderWithProviders } from '../../../../fixtures/render';

const store = getStore({
  backoffice: fromJS({
    loggedIn: false,
    loading: false,
  }),
});

describe('LoginPageContainer', () => {
  it('should dispatch backofficeLogin action on form submit', async () => {
    renderWithProviders(<LocalLoginPageContainer />, {
      route: BACKOFFICE_LOGIN,
      store,
    });

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByTestId('login');

    fireEvent.change(emailInput, { target: { value: 'email@mail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await waitFor(() => fireEvent.click(loginButton));

    await waitFor(() =>
      expect(store.getActions()).toEqual([{ type: 'BACKOFFICE_LOGIN_REQUEST' }])
    );
  });
});
