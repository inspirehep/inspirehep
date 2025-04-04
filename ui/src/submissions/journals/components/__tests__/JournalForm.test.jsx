import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';

import { JournalForm } from '../JournalForm';

describe('JournalForm', () => {
  it('renders', () => {
    const { asFragment } = render(
      <Formik>
        <JournalForm />
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
