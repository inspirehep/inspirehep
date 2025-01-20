import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import AuthorResultItem from '../ResultItem';
import { BACKOFFICE_SEARCH } from '../../../../../common/routes';
import { getStore } from '../../../../../fixtures/store';

describe('AuthorResultItem component', () => {
  const item = fromJS({
    id: '123',
    workflow_type: 'AUTHOR_UPDATE',
    status: 'completed',
    decisions: fromJS([
      {
        action: 'accept',
      },
    ]),
    data: fromJS({
      name: fromJS({
        value: 'Doe, John',
        preferred_name: 'Johnny',
      }),
      status: 'active',
      arxiv_categories: fromJS(['cs.AI', 'cs.CL']),
      acquisition_source: fromJS({
        email: 'joao.ramiro@cern.ch',
        method: 'submitter',
        source: 'submitter',
      }),
    }),
  });

  it('renders the AuthorResultItem component', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE_SEARCH]}>
          <AuthorResultItem item={item} />
        </MemoryRouter>
      </Provider>
    );

    const titleLink = screen.getByRole('link', { name: /Doe, John/i });
    expect(titleLink).toHaveAttribute('href', '/backoffice/123');

    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();

    const decisionPill = screen.getByText('Accept');
    expect(decisionPill).toBeInTheDocument();
    expect(decisionPill).toHaveClass('decision-pill bg-completed ml1');

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(
      screen.getByText('This workflow has been completed.')
    ).toBeInTheDocument();

    expect(screen.getByText('joao.ramiro@cern.ch')).toBeInTheDocument();

    expect(screen.getByText('cs.AI')).toBeInTheDocument();
    expect(screen.getByText('cs.CL')).toBeInTheDocument();
  });
});
