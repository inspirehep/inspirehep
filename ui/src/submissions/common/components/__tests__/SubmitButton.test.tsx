import React from 'react';
import { shallow } from 'enzyme';
import { useFormikContext } from 'formik';
import SubmitButton from '../SubmitButton';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('formik');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SubmitButton', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props set', () => {
    const contextValue = {
      isValid: true,
      isSubmitting: false,
      isValidating: false,
    };
    (useFormikContext as $TSFixMe).mockImplementation(() => contextValue);
    const wrapper = shallow(<SubmitButton />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with loading', () => {
    const contextValue = {
      isValid: true,
      isSubmitting: true,
      isValidating: false,
    };
    (useFormikContext as $TSFixMe).mockImplementation(() => contextValue);
    const wrapper = shallow(<SubmitButton />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
