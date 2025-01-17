import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import LocalLoginPage from '../LocalLoginPage';
import { BACKOFFICE_LOGIN } from '../../../../common/routes';
import { getStore } from '../../../../fixtures/store';

jest.mock('../../../../common/components/DocumentHead', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid="document-head">{title}</div>
  ),
}));

describe('LocalLoginPage', () => {
  const onLoginFormSubmit = jest.fn();
  const store = getStore({
    backoffice: fromJS({
      loading: false,
      loggedIn: false,
    }),
  });

  const setup = () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[BACKOFFICE_LOGIN]}>
          <LocalLoginPage onLoginFormSubmit={onLoginFormSubmit} />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    onLoginFormSubmit.mockClear();
  });

  it('should render the login form with email and password fields', () => {
    setup();

    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('should display the correct title in the document head', () => {
    setup();

    expect(screen.getByTestId('document-head')).toHaveTextContent('Login');
  });

  it('should not submit the form when fields are empty', async () => {
    setup();

    const loginButton = screen.getByTestId('login');

    expect(loginButton).toBeDisabled();
  });

  it('should submit the form with the correct credentials', async () => {
    setup();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByTestId('login');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(onLoginFormSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should not submit the form with invalid email', async () => {
    setup();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByTestId('login');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(onLoginFormSubmit).not.toHaveBeenCalled();
    });
  });
});
