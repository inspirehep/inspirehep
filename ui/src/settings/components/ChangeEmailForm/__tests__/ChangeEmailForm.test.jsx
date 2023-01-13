import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import { ChangeEmailForm } from '../ChangeEmailForm';

jest.mock('../../../../actions/settings');

describe('ChangeEmailForm', () => {
  it('renders page', () => {
    const wrapper = shallow(
      <ChangeEmailForm onChangeEmailAddress={jest.fn()} loading={false}  email='test@test.pl' />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('disable email input and display loading on the button while loading', () => {
    const wrapper = shallow(
      <ChangeEmailForm onChangeEmailAddress={jest.fn()} loading email='test@test.pl' />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSubmit on Formik submit', () => {
    const onChangeEmailAddress = jest.fn();
    const data = {
      email: 'jessica@jones.com',
    };
    const wrapper = shallow(
      <ChangeEmailForm
        onChangeEmailAddress={onChangeEmailAddress}
        loading={false}
        email='test@test.pl'
      />
    );

    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    onFormikSubmit(data);
    expect(onChangeEmailAddress).toHaveBeenCalledWith(data);
  });
});
