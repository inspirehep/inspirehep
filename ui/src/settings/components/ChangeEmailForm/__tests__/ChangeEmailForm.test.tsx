import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import { ChangeEmailForm } from '../ChangeEmailForm';

jest.mock('../../../../actions/settings');

describe('ChangeEmailForm', () => {
  it('renders page', () => {
    const { asFragment } = render(
      <ChangeEmailForm
        onChangeEmailAddress={jest.fn()}
        loading={false}
        email="test@test.pl"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('disable email input and display loading on the button while loading', () => {
    const { asFragment } = render(
      <ChangeEmailForm
        onChangeEmailAddress={jest.fn()}
        loading
        email="test@test.pl"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onSubmit on Formik submit', async () => {
    const onChangeEmailAddress = () => {};
    const onChangeEmailAddressSpy = jest.fn(onChangeEmailAddress);

    const data = {
      email: 'jessica@jones.com',
    };

    const { getByTestId } = render(
      <ChangeEmailForm
        onChangeEmailAddress={onChangeEmailAddressSpy}
        loading={false}
        email="test@test.pl"
      />
    );

    const emailInput = getByTestId('email');
    fireEvent.change(emailInput, { target: { value: data.email } });
    const submitButton = getByTestId('submit-email');
    fireEvent.click(submitButton);

    await waitFor(() => expect(onChangeEmailAddressSpy).toHaveBeenCalled());
  });
});
