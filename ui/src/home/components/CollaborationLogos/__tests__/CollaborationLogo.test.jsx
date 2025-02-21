import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollaborationLogo from '../CollaborationLogo';

describe('CollaborationLogo', () => {
  it('render with all props', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <CollaborationLogo
          name="CERN"
          href="https://home.cern"
          src="/link/to/logo.png"
        />
      </MemoryRouter>
    );
    const linkElement = getByRole('link', { name: /cern/i });
    expect(linkElement).toHaveAttribute('href', 'https://home.cern');
  });
});
