import React from 'react';
import { fromJS } from 'immutable';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AffiliationList from '../AffiliationList';

describe('AffiliationList', () => {
  it('renders author with one affiliation', () => {
    const affiliations = fromJS([
      {
        value: 'CERN2',
        record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
      },
    ]);
    const { getByRole } = render(
      <MemoryRouter>
        <AffiliationList affiliations={affiliations} />
      </MemoryRouter>
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/institutions/12345');
  });

  it('renders author with multiple affiliations', () => {
    const affiliations = fromJS([
      {
        value: 'CERN2',
        record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
      },
      {
        value: 'CERN1',
      },
    ]);
    const { getByRole } = render(
      <MemoryRouter>
        <AffiliationList affiliations={affiliations} />
      </MemoryRouter>
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/institutions/12345');
    expect(screen.getByText('CERN1')).toBeInTheDocument();
  });
});
