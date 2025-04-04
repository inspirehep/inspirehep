import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';

import ExperimentForm from '../ExperimentForm';

describe('ExperimentForm', () => {
  it('renders', () => {
    const { asFragment } = render(
      <Formik>
        <ExperimentForm />
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
