import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { renderWithRouter } from '../../../fixtures/render';
import Affiliation from '../Affiliation';

describe('Affiliation', () => {
  it('renders linked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const { getByRole } = renderWithRouter(
      <Affiliation affiliation={affiliation} />
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
    const { getByRole } = renderWithRouter(
      <Affiliation affiliation={affiliation} />
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
