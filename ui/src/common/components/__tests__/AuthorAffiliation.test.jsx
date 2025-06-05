import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import Affiliation from '../Affiliation';

describe('Affiliation', () => {
  it('renders linked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const { getByRole } = render(
      <MemoryRouter>
        <Affiliation affiliation={affiliation} />
      </MemoryRouter>
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/institutions/12345');
  });

  it('renders unlinked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
    });
    const { getByText } = render(<Affiliation affiliation={affiliation} />);
    expect(getByText('CERN2')).toBeInTheDocument();
  });

  it('renders linked affiliation with value', () => {
    const affiliation = fromJS({
      value: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const { getByRole } = render(
      <MemoryRouter>
        <Affiliation affiliation={affiliation} />
      </MemoryRouter>
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/institutions/12345');
  });

  it('renders unlinked affiliation with value', () => {
    const affiliation = fromJS({
      value: 'CERN2',
    });
    const { getByText } = render(<Affiliation affiliation={affiliation} />);
    expect(getByText('CERN2')).toBeInTheDocument();
  });
});
