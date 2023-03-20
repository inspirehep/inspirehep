import React from 'react';
import { render, within } from '@testing-library/react';

import LoginPage from '../LoginPage';

jest.mock('../../../../actions/user');

describe('LoginPage', () => {
  it('renders page', () => {
    const { asFragment } = render(
      <LoginPage previousUrl="/" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('passes previousUrl as next query parameter', () => {
    const previousUrl = '/jobs?q=CERN';
    const { getByTestId } = render(<LoginPage previousUrl={previousUrl} />);

    const loginPage = getByTestId('login-page');
    const button = within(loginPage).getByTestId('login-button');
    expect(button).toHaveAttribute('href', `/api/accounts/login?next=${previousUrl}`);
  });
});
