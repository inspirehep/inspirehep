import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';

import InstitutionForm from '../InstitutionForm';

describe('InstitutionForm', () => {
  it('renders', () => {
    const { asFragment } = render(
      <Formik>
        <InstitutionForm />
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
