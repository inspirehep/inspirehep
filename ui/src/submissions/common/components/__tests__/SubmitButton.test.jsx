import React from 'react';
import { useFormikContext } from 'formik';
import { render } from '@testing-library/react';

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
    const { asFragment } = render(<SubmitButton />);

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with loading', () => {
    const contextValue = {
      isValid: true,
      isSubmitting: true,
      isValidating: false,
    };
    useFormikContext.mockImplementation(() => contextValue);
    const { asFragment, getByRole } = render(<SubmitButton />);

    expect(asFragment()).toMatchSnapshot();
    expect(getByRole('img')).toHaveAttribute('aria-label', 'loading');
  });
});
