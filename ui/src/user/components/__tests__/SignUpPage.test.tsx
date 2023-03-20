import React from 'react';
import { render } from '@testing-library/react';

import SignUpPage from '../SignUpPage';

describe('SignUpPage', () => {
  it('renders page', () => {
    const { asFragment } = render(
      <SignUpPage loading={false} onSubmit={jest.fn()} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders page with loading', () => {
    const { asFragment } = render(<SignUpPage loading onSubmit={jest.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders page with errors', () => {
    const error = {
      message: 'This is an error yo',
    };
    const { asFragment } = render(
      <SignUpPage loading={false} error={error} onSubmit={jest.fn()} />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
