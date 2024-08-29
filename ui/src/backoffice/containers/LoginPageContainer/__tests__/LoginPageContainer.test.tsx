import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import LoginPageContainer from '../LoginPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';
import { BACKOFFICE_LOGIN } from '../../../../common/routes';

const store = getStoreWithState({
  backoffice: fromJS({
    loggedIn: false,
    loading: false,
  }),
});

describe('LoginPageContainer', () => {
  it('should dispatch backofficeLogin action on form submit', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[BACKOFFICE_LOGIN]}>
          <LoginPageContainer />
        </MemoryRouter>
      </Provider>
    );
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
