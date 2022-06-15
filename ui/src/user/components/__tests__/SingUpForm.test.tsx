import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import SingUpForm from '../SingUpForm';

describe('SingUpForm', () => {
  it('renders the form with valid input', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: false; isValid: true; onSubmit: a... Remove this comment to see the full error message
      <SingUpForm loading={false} isValid onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders the form with invalid input', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: false; isValid: boolean; onSubmit... Remove this comment to see the full error message
      <SingUpForm loading={false} isValid={false} onSubmit={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('disable email input and display loading on the button while loading', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: true; isValid: true; onSubmit: an... Remove this comment to see the full error message
      <SingUpForm loading isValid onSubmit={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onSubmit on Formik submit', () => {
    const onSubmit = jest.fn();
    const data = {
      email: 'jessica@jones.com',
    };
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: true; isValid: true; onSubmit: an... Remove this comment to see the full error message
    const wrapper = shallow(<SingUpForm loading isValid onSubmit={onSubmit} />);

    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    onFormikSubmit(data);
    expect(onSubmit).toHaveBeenCalledWith(data);
  });
});
