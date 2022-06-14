import React from 'react';
import { shallow } from 'enzyme';
import { Formik } from 'formik';

import SingUpForm from '../SingUpForm';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SingUpForm', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders the form with valid input', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: false; isValid: true; onSubmit: a... Remove this comment to see the full error message
      <SingUpForm loading={false} isValid onSubmit={jest.fn()} />
    );

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders the form with invalid input', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: false; isValid: boolean; onSubmit... Remove this comment to see the full error message
      <SingUpForm loading={false} isValid={false} onSubmit={jest.fn()} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('disable email input and display loading on the button while loading', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: true; isValid: true; onSubmit: an... Remove this comment to see the full error message
      <SingUpForm loading isValid onSubmit={jest.fn()} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onSubmit on Formik submit', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSubmit = jest.fn();
    const data = {
      email: 'jessica@jones.com',
    };
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ loading: true; isValid: true; onSubmit: an... Remove this comment to see the full error message
    const wrapper = shallow(<SingUpForm loading isValid onSubmit={onSubmit} />);

    const onFormikSubmit = wrapper.find(Formik).prop('onSubmit');
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    onFormikSubmit(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onSubmit).toHaveBeenCalledWith(data);
  });
});
