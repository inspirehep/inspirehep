import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SingUpForm from '../SingUpForm';

describe('SingUpForm', () => {
  it('renders the form', () => {
    const { asFragment } = render(
      <SingUpForm loading={false} onSignUp={jest.fn()} />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('disable email input and display loading on the button while loading', () => {
    const { asFragment } = render(<SingUpForm loading onSignUp={jest.fn()} />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onSubmit on form submit', async () => {
    const onSignUp = () => {};
    const onSignUpSpy = jest.fn(onSignUp);

    const data = {
      email: 'jessica@jones.com',
    };

    const { getByTestId } = render(
      <SingUpForm loading={false} onSignUp={onSignUpSpy} />
    );

    const emailInput = getByTestId('email');
    fireEvent.change(emailInput, { target: { value: data.email } });
    const submitButton = getByTestId('submit');
    fireEvent.click(submitButton);

    await waitFor(() => expect(onSignUpSpy).toHaveBeenCalled());
  });
});
