import React from 'react';
import { render, screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import BibliographyGenerator from '../BibliographyGenerator';

describe('BibliographyGenerator', () => {
  it('renders successfully', () => {
    const { asFragment } = render(
      <BibliographyGenerator onSubmit={jest.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders citation errors as alerts', () => {
    const citationErrors = fromJS([
      {
        message: 'Error 1',
      },
      {
        message: 'Error 2',
      },
    ]);

    render(
      <BibliographyGenerator
        onSubmit={jest.fn()}
        citationErrors={citationErrors}
      />
    );

    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('does not render any citation error alerts when there are no citation errors', () => {
    render(
      <BibliographyGenerator onSubmit={jest.fn()} citationErrors={null} />
    );

    const alerts = screen.queryAllByRole('alert');
    expect(alerts.length).toBe(0);
  });
});
