import React from 'react';
import { shallow } from 'enzyme';
import { useFormikContext } from 'formik';
import SubmitButton from '../SubmitButton';

jest.mock('formik');

describe('SubmitButton', () => {
  it('renders with all props set', () => {
    const contextValue = {
      isValid: true,
      isSubmitting: false,
      isValidating: false,
    };
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
    useFormikContext.mockImplementation(() => contextValue);
    const wrapper = shallow(<SubmitButton />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with loading', () => {
    const contextValue = {
      isValid: true,
      isSubmitting: true,
      isValidating: false,
    };
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
    useFormikContext.mockImplementation(() => contextValue);
    const wrapper = shallow(<SubmitButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
