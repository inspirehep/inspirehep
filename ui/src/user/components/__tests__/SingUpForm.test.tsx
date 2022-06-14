import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import SingUpForm from '../SingUpForm';

describe('SingUpForm', () => {
  it('renders the form with valid input', () => {
    const wrapper = shallow(
      <SingUpForm loading={false} isValid onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders the form with invalid input', () => {
    const wrapper = shallow(
      <SingUpForm loading={false} isValid={false} onSubmit={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('disable email input and display loading on the button while loading', () => {
    const wrapper = shallow(
      <SingUpForm loading isValid onSubmit={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSubmit on Formik submit', () => {
    const onSubmit = jest.fn();
    const data = {
      email: 'jessica@jones.com',
    };
    const wrapper = shallow(<SingUpForm loading isValid onSubmit={onSubmit} />);

    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    onFormikSubmit(data);
    expect(onSubmit).toHaveBeenCalledWith(data);
  });
});
