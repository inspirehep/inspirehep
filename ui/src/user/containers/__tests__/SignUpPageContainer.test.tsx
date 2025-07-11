import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import { USER_SIGN_UP_REQUEST } from '../../../actions/actionTypes';
import { initialState } from '../../../reducers/user';
import SignUpPageContainer from '../SignUpPageContainer';

describe('SignUpPageContainer', () => {
  it('calls userSignUp onLoginClick', async () => {
    const store = getStore(initialState);

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <SignUpPageContainer />
        </MemoryRouter>
      </Provider>
    );

    const emailInput = getByTestId('email');
    await waitFor(() =>
      fireEvent.change(emailInput, { target: { value: 'test@user.com' } })
    );
    const submitButton = getByTestId('submit');
    await waitFor(() => userEvent.click(submitButton));

    const expectedActions = {
      type: USER_SIGN_UP_REQUEST,
    };

    await waitFor(() => expect(store.getActions()[0]).toEqual(expectedActions));
  });

  it('passes errors, onSubmit, and loading from the state', () => {
    const store = getStore({
      user: fromJS({
        isSigningUp: true,
        signUpError: {
          message: 'This is an error',
        },
      }),
    });

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <SignUpPageContainer />
      </Provider>
    );

    expect(getByTestId('error')).toBeInTheDocument();
    expect(getByText('This is an error')).toBeInTheDocument();
    expect(getByTestId('loading')).toBeInTheDocument();
  });
});
