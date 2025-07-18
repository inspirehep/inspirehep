import React from 'react';

import CollaborationLogo from '../CollaborationLogo';
import { renderWithRouter } from '../../../../fixtures/render';

describe('CollaborationLogo', () => {
  it('render with all props', () => {
    const { getByRole } = renderWithRouter(
      <CollaborationLogo
        name="CERN"
        href="https://home.cern"
        src="/link/to/logo.png"
      />
    );
    const linkElement = getByRole('link', { name: /cern/i });
    expect(linkElement).toHaveAttribute('href', 'https://home.cern');
  });
});
