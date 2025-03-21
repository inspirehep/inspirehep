import { fromJS } from 'immutable';
import { render, screen } from '@testing-library/react';
import AuthorList from '../AuthorList';

describe('AuthorList', () => {
  it('renders only 5 authors and suffixes "show all" if passed more', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
      {
        full_name: 'Test, Guy 4',
      },
      {
        full_name: 'Test, Guy 5',
      },
      {
        full_name: 'Test, Guy 6',
      },
    ]);
    const { getByText, queryByText } = render(
      <AuthorList total={6} enableShowAll authors={authors} />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(getByText('Test, Guy 2')).toBeInTheDocument();
    expect(getByText('Test, Guy 3')).toBeInTheDocument();
    expect(getByText('Test, Guy 4')).toBeInTheDocument();
    expect(getByText('Test, Guy 5')).toBeInTheDocument();
    expect(queryByText('Test, Guy 6')).toBeNull();
    expect(getByText(/Show All\(6\)/i)).toBeInTheDocument();
  });

  it('renders only 5 authors and suffixes "et al." if passed more', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
      {
        full_name: 'Test, Guy 4',
      },
      {
        full_name: 'Test, Guy 5',
      },
      {
        full_name: 'Test, Guy 6',
      },
    ]);
    const { getByText, queryByText } = render(
      <AuthorList total={6} authors={authors} />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(getByText('Test, Guy 2')).toBeInTheDocument();
    expect(getByText('Test, Guy 3')).toBeInTheDocument();
    expect(getByText('Test, Guy 4')).toBeInTheDocument();
    expect(getByText('Test, Guy 5')).toBeInTheDocument();
    expect(queryByText('Test, Guy 6')).toBeNull();
    expect(getByText('et al.')).toBeInTheDocument();
  });

  it('renders only limited (prop) authors and suffixes "et al." if passed more', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
    ]);
    const { getByText, queryByText } = render(
      <AuthorList limit={2} total={3} authors={authors} />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(getByText('Test, Guy 2')).toBeInTheDocument();
    expect(queryByText('Test, Guy 3')).toBeNull();
    expect(getByText('et al.')).toBeInTheDocument();
  });

  it('renders only limited (prop) authors and suffixes "show all." if passed more', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
    ]);
    const { getByText, queryByText } = render(
      <AuthorList limit={2} total={3} authors={authors} enableShowAll />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(getByText('Test, Guy 2')).toBeInTheDocument();
    expect(queryByText('Test, Guy 3')).toBeNull();
    expect(getByText(/Show All\(3\)/i)).toBeInTheDocument();
  });

  it('renders all authors if they are less than the limit without suffix', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const { getByText, queryByText } = render(
      <AuthorList limit={4} authors={authors} />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(getByText('Test, Guy 2')).toBeInTheDocument();
    expect(queryByText('et al.')).toBeNull();
  });

  it('should display `authors` in modal title', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const { getByRole } = render(
      <AuthorList authors={authors} limit={1} enableShowAll />
    );
    getByRole('button').click();
    expect(screen.getByText('2 authors')).toBeInTheDocument();
  });
});
