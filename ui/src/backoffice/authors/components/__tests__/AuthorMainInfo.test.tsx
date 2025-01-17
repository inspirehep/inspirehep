import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Map, List } from 'immutable';
import AuthorMainInfo from '../AuthorMainInfo';

describe('AuthorMainInfo', () => {
  const mockData = Map({
    name: Map({
      value: 'John Doe',
      preferred_name: 'Johnny Doe',
      native_names: List(['Jjjjjj Doe', 'J Doe']),
      name_variants: List(['J. Doe', 'John D.']),
    }),
    status: 'active',
    ids: List([
      Map({ schema: 'ORCID', value: '0000-0001-2345-6789' }),
      Map({ schema: 'Other', value: '1234-5678' }),
    ]),
  });

  it('renders the main information correctly', () => {
    render(<AuthorMainInfo data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Preferred name:')).toBeInTheDocument();
    expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
    expect(screen.getByText('Native names:')).toBeInTheDocument();
    expect(screen.getByText('Jjjjjj Doe; J Doe')).toBeInTheDocument();
    expect(screen.getByText('Name variants:')).toBeInTheDocument();
    expect(screen.getByText('J. Doe; John D.')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders ORCID IDs correctly', () => {
    render(<AuthorMainInfo data={mockData} />);

    expect(screen.getByText('0000-0001-2345-6789')).toBeInTheDocument();
  });

  it('does not render sections if data is missing', () => {
    const incompleteData = Map({
      name: Map({
        value: 'John Doe',
      }),
    });

    render(<AuthorMainInfo data={incompleteData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Preferred name:')).not.toBeInTheDocument();
    expect(screen.queryByText('Native names:')).not.toBeInTheDocument();
    expect(screen.queryByText('Name variants:')).not.toBeInTheDocument();
    expect(screen.queryByText('Status:')).not.toBeInTheDocument();
  });
});
