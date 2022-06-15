import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { FormikContext } from 'formik';
import SubmitButton from '../SubmitButton';

/**
 * `formik` is mocked on the original test file for snapshot tests
 * because `useFormikContext` which uses `useContext` doesn't work with shallow rendering
 *
 * but we need `FormikContext` not to be mocked for this test case
 * mocking only `useFormikContext` does not work, I guess because it also imports `FormikContext` internally
 */
describe('SubmitButton: click', () => {
  it('calls scrollTo when form is submitted and is not valid', () => {
    const contextValue = {
      isValid: false,
      isSubmitting: true,
      isValidating: false,
    };
    const wrapper = mount(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ isValid: boolean; isSubmitting: boolean; i... Remove this comment to see the full error message
      <FormikContext.Provider value={contextValue}>
        <SubmitButton />
      </FormikContext.Provider>
    );
    global.scrollTo = jest.fn();
    act(() => {
      wrapper.setProps({ value: { ...contextValue, isSubmitting: false } });
      wrapper.update();
    });
    expect(global.scrollTo).toHaveBeenCalled();
  });
});
