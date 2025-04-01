import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';

import ArticleForm from '../ArticleForm';

describe('ArticleForm', () => {
  it('renders all props', () => {
    const { asFragment } = render(
      <Formik>
        <ArticleForm
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
