import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import OrcidProfileLink from '../OrcidProfileLink';

describe('OrcidProfileLink', () => {
  it('renders with all props set', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <OrcidProfileLink className="test" orcid="0000-0001-8058-0014">
          Orcid: <strong>0000-0001-8058-0014</strong>
        </OrcidProfileLink>
      </MemoryRouter>
    );
    const linkElement = getByRole('link', {
      name: /Orcid: 0000-0001-8058-0014/i,
    });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      'href',
      '//orcid.org/0000-0001-8058-0014'
    );
  });

  it('renders with only orcid', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <OrcidProfileLink orcid="0000-0001-8058-0014" />
      </MemoryRouter>
    );

    const linkElement = getByRole('link', {
      name: '0000-0001-8058-0014',
    });

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      'href',
      '//orcid.org/0000-0001-8058-0014'
    );
  });
});
