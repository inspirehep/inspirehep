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
// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('SubmitButton: click', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    global.scrollTo = jest.fn();
    act(() => {
      wrapper.setProps({ value: { ...contextValue, isSubmitting: false } });
      wrapper.update();
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(global.scrollTo).toHaveBeenCalled();
  });
});
