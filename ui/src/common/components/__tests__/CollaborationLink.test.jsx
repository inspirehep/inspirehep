import React from 'react';
import { renderWithRouter } from '../../../fixtures/render';
import CollaborationLink from '../CollaborationLink';

describe('CollaborationLink', () => {
  it('renders with collaboration', () => {
    const { getByRole } = renderWithRouter(
      <CollaborationLink>Alias Investigations</CollaborationLink>
    );
    const link = getByRole('link', { name: 'Alias Investigations' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Alias Investigations'
    );
  });
});
