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
    useFormikContext.mockImplementation(() => contextValue);
    const wrapper = shallow(<SubmitButton />);
    expect(wrapper).toMatchSnapshot();
  });
});
