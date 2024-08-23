import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import LoginPageContainer from '../LoginPageContainer';
import { getStoreWithState } from '../../../../fixtures/store';
import { HOLDINGPEN_LOGIN_NEW } from '../../../../common/routes';

const store = getStoreWithState({
  holdingpen: fromJS({
    loggedIn: false,
    loading: false,
  }),
});

describe('LoginPageContainer', () => {
  it('should dispatch holdingpenLogin action on form submit', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[HOLDINGPEN_LOGIN_NEW]}>
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
      expect(store.getActions()).toEqual([{ type: 'HOLDINGPEN_LOGIN_REQUEST' }])
    );
  });
});
