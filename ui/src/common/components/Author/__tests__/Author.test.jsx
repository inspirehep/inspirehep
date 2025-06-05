import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Author from '..';

describe('Author', () => {
  it('renders unlinkedAuthor with affiliations', () => {
    const author = fromJS({
      full_name: 'Name, Full, Jr.',
      first_name: 'Full, Jr.',
      last_name: 'Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const { getByText } = render(<Author author={author} recordId={12345} />);
    expect(getByText('Full Name, Jr.')).toBeInTheDocument();
    expect(getByText('Affiliation')).toBeInTheDocument();
  });

  it('renders editor', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
      inspire_roles: ['editor'],
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    const { getByText } = render(<Author recordId={12345} author={author} />);
    expect(getByText('Full Name')).toBeInTheDocument();
    expect(getByText('Affiliation')).toBeInTheDocument();
  });

  it('renders supervisor', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      inspire_roles: ['supervisor'],
    });
    const { getByText } = render(<Author recordId={12345} author={author} />);
    expect(getByText('Name, Full')).toBeInTheDocument();
  });

  it('renders linked author', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      record: {
        $ref: 'https://beta.inspirehep.net/api/authors/12345',
      },
      bai: 'Full.Name.1',
    });
    const { getByRole } = render(
      <MemoryRouter>
        <Author recordId={12345} author={author} />
      </MemoryRouter>
    );
    const link = getByRole('link', {
      name: 'Name, Full',
    });
    expect(link).toHaveAttribute('href', '/authors/12345');
  });

  it('renders unlinked author with bai', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Full.Name.1',
    });
    const { getByRole } = render(
      <MemoryRouter>
        <Author recordId={12345} author={author} />
      </MemoryRouter>
    );
    const link = getByRole('link', {
      name: 'Name, Full',
    });
    expect(link).toHaveAttribute('href', '/literature?q=a%20Full.Name.1');
  });
});
