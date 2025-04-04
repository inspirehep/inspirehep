import React from 'react';
import { render, screen } from '@testing-library/react';

import LiteratureSubmission from '../LiteratureSubmission';

describe('LiteratureSubmission', () => {
  it('renders for article document type', () => {
    render(
      <LiteratureSubmission docType="article" onSubmit={async () => {}} />
    );

    const formikElement = screen.getByTestId('formik-wrapper');

    expect(formikElement).toBeInTheDocument();
    expect(screen.getByTestId('article-form')).toBeInTheDocument();
  });
});
