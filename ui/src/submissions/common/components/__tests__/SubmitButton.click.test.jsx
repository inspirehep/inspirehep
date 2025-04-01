import React from 'react';
import { render, act } from '@testing-library/react';
import { FormikContext } from 'formik';

import SubmitButton from '../SubmitButton';

describe('SubmitButton: click', () => {
  it('calls scrollTo when form is submitted and is not valid', async () => {
    const contextValue = {
      isValid: false,
      isSubmitting: true,
      isValidating: false,
    };

    global.scrollTo = jest.fn();

    const { rerender } = render(
      <FormikContext.Provider value={contextValue}>
        <SubmitButton />
      </FormikContext.Provider>
    );

    await act(() => {
      rerender(
        <FormikContext.Provider
          value={{ ...contextValue, isSubmitting: false }}
        >
          <SubmitButton />
        </FormikContext.Provider>
      );
    });

    expect(global.scrollTo).toHaveBeenCalled();
  });
});
