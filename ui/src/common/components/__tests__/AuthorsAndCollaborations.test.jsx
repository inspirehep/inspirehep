import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { renderWithRouter } from '../../../fixtures/render';
import AuthorsAndCollaborations from '../AuthorsAndCollaborations';

describe('AuthorsAndCollaborations', () => {
  it('renders only author list if collaborations are missing (default author props)', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const { getByText } = render(
      <AuthorsAndCollaborations authors={authors} />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
  });

  it('renders only author list if collaborations are missing (extra author props)', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const { getByText } = render(
      <AuthorsAndCollaborations
        authors={authors}
        authorCount={1}
        enableAuthorsShowAll
      />
    );

    expect(getByText('Test, Guy 1')).toBeInTheDocument();
  });

  it('renders only one collaboration and author for the collaboration', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const { getByText } = renderWithRouter(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={1}
        collaborations={collaborations}
      />
    );
    expect(getByText('Test Collab 1')).toBeInTheDocument();
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
  });

  it('renders multiple collaborations and author for the collaborations', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
      {
        value: 'Test Collab 2',
      },
    ]);
    const { getByText } = renderWithRouter(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={1}
        collaborations={collaborations}
      />
    );
    expect(getByText('Test Collab 1')).toBeInTheDocument();
    expect(getByText('Test Collab 2')).toBeInTheDocument();
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
  });

  it('renders collaboration list with single item and author list with limit 1 if there are multiple authors', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const collaborationsWithSuffix = fromJS([
      {
        value: 'Test 1 Group',
      },
    ]);
    const { getByText, queryByText } = renderWithRouter(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={12}
        collaborationsWithSuffix={collaborationsWithSuffix}
      />
    );
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(queryByText('Test, Guy 2')).toBeNull();
  });

  it('renders collaboration list and author list if collaborations and authors have multiple items', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const collaborationsWithSuffix = fromJS([
      {
        value: 'Test 1 Group',
      },
      {
        value: 'Test 2 Group',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const { getByText, getAllByTestId } = renderWithRouter(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={12}
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
      />
    );
    expect(getByText('Test Collab 1')).toBeInTheDocument();
    expect(getByText('Test 1 Group')).toBeInTheDocument();
    expect(getByText('Test 2 Group')).toBeInTheDocument();
    expect(getByText('Test, Guy 1')).toBeInTheDocument();
    expect(getByText(/Show All\(2\)/i)).toBeInTheDocument();
    expect(getAllByTestId('inline-data-list')).toHaveLength(3);
  });

  it('does not render bullet if authors missing', () => {
    const collaborationsWithSuffix = fromJS([
      {
        value: 'Test 1 Group',
      },
      {
        value: 'Test 2 Group',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const { getByText, getAllByTestId } = renderWithRouter(
      <AuthorsAndCollaborations
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
      />
    );

    expect(getByText('Test Collab 1')).toBeInTheDocument();
    expect(getByText('Test 1 Group')).toBeInTheDocument();
    expect(getByText('Test 2 Group')).toBeInTheDocument();
    expect(getAllByTestId('inline-data-list')).toHaveLength(2);
  });

  it('does not render bullet if authors missing with single collaboration', () => {
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const { getAllByTestId, getByText } = renderWithRouter(
      <AuthorsAndCollaborations collaborations={collaborations} />
    );
    expect(getByText('Test Collab 1')).toBeInTheDocument();
    expect(getAllByTestId('inline-data-list')).toHaveLength(1);
  });
});
