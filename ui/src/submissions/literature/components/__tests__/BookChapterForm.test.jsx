import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';

import BookChapterForm from '../BookChapterForm';

describe('BookChapterForm', () => {
  it('renders all props', () => {
    const { asFragment } = render(
      <Formik>
        <BookChapterForm
          isSubmitting={false}
          isValidating={false}
          isValid
          values={{}}
        />
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
