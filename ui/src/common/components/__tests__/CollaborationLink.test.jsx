import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CollaborationLink from '../CollaborationLink';

describe('CollaborationLink', () => {
  it('renders with collaboration', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <CollaborationLink>Alias Investigations</CollaborationLink>
      </MemoryRouter>
    );
    const link = getByRole('link', { name: 'Alias Investigations' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Alias Investigations'
    );
  });
});
