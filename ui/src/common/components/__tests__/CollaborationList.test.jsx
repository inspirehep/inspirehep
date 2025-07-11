import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { MemoryRouter } from 'react-router-dom';
import CollaborationList from '../CollaborationList';

describe('CollaborationList', () => {
  it('renders with collaboration without suffix', () => {
    const collaborations = fromJS([{ value: 'Alias Investigations' }]);
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <CollaborationList collaborations={collaborations} />
      </MemoryRouter>
    );
    const link = getByRole('link', { name: 'Alias Investigations' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Alias Investigations'
    );
    expect(getByText('Collaboration')).toBeInTheDocument();
  });

  it('renders with collaborations without suffix', () => {
    const collaborations = fromJS([
      { value: 'Alias Investigations' },
      { value: 'Nelson and Murdock' },
    ]);
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <CollaborationList collaborations={collaborations} />
      </MemoryRouter>
    );
    const link = getByRole('link', { name: 'Alias Investigations' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Alias Investigations'
    );
    const link2 = getByRole('link', { name: 'Nelson and Murdock' });
    expect(link2).toBeInTheDocument();
    expect(link2).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Nelson and Murdock'
    );
    expect(getByText('and')).toBeInTheDocument();
    expect(getByText('Collaborations')).toBeInTheDocument();
  });

  it('renders with collaborations with and without suffix', () => {
    const collaborationsWithSuffix = fromJS([
      { value: 'Avangers Groups' },
      { value: 'Avangers Task Force' },
      { value: 'Avangers Consortium' },
      { value: 'Avangers Team' },
    ]);
    const collaborations = fromJS([
      { value: 'Alias Investigations' },
      { value: 'Nelson and Murdock' },
      { value: 'Defenders Group and Avengers' },
      { value: 'Defenders Task Force and Avengers' },
    ]);
    const { getByRole, getByText } = render(
      <MemoryRouter>
        <CollaborationList
          collaborations={collaborations}
          collaborationsWithSuffix={collaborationsWithSuffix}
        />
      </MemoryRouter>
    );
    const link = getByRole('link', { name: 'Avangers Groups' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Avangers Groups'
    );

    const link2 = getByRole('link', { name: 'Nelson and Murdock' });
    expect(link2).toBeInTheDocument();
    expect(link2).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Nelson and Murdock'
    );
    expect(getByText('Collaborations')).toBeInTheDocument();
  });

  it('renders with collaborations with suffix', () => {
    const collaborationsWithSuffix = fromJS([
      { value: 'Avangers Groups' },
      { value: 'Avangers Group' },
      { value: 'Avangers Task Force' },
      { value: 'Avangers Consortium' },
      { value: 'Avangers Team' },
    ]);
    const { getByRole } = render(
      <MemoryRouter>
        <CollaborationList
          collaborationsWithSuffix={collaborationsWithSuffix}
        />
      </MemoryRouter>
    );
    const link = getByRole('link', { name: 'Avangers Groups' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      '/literature?q=collaboration:Avangers Groups'
    );
  });
});
